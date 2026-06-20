import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { timeout } from 'rxjs';
import { DoacaoService } from '../../../../core/services/doacao.service';
import { abrirJanelaEtiquetaVazia, imprimirEtiquetaDoacao } from '../../../../shared/utils/etiqueta-doacao';

interface DoacaoTecnico {
  id?: number;
  cpf?: string;
  nome?: string;
  equipamento?: string;
  dataCadastro?: string;
  dataUltimaAtualizacao?: string;
  estado?: string;
  status?: string;
}

@Component({
  selector: 'app-pagina-doacoes-tecnico',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatTooltipModule,
    MatCardModule
  ],
  templateUrl: './pagina-doacoes-tecnico.html',
  styleUrls: ['./pagina-doacoes-tecnico.css']
})
export class PaginaDoacoesTecnicoComponent implements AfterViewInit, OnInit {
  private router = inject(Router);
  private doacaoService = inject(DoacaoService);
  private cdr = inject(ChangeDetectorRef);

  displayedColumns: string[] = [
    'id',
    'cpf',
    'nome',
    'equipamento',
    'dataCadastro',
    'dataUltimaAtualizacao',
    'status',
    'acoes'
  ];

  dataSource = new MatTableDataSource<DoacaoTecnico>();
  termoPesquisa = '';
  carregando = false;
  erroAoCarregar = false;
  private timeoutCarregamento?: ReturnType<typeof setTimeout>;

  @ViewChild(MatPaginator) 
  set paginator(paginator: MatPaginator | undefined) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }

  ngOnInit(): void {
    this.buscarDoacoesDaApi();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterPredicate = (doacao: DoacaoTecnico, filtro: string): boolean => {
      const termo = filtro.trim().toLowerCase();
      const texto = [
        doacao.id,
        doacao.cpf,
        doacao.nome,
        doacao.equipamento,
        doacao.dataCadastro,
        doacao.dataUltimaAtualizacao,
        doacao.status
      ].join(' ').toLowerCase();

      return texto.includes(termo);
    };
  }

  buscarDoacoesDaApi(): void {
    this.carregando = true;
    this.erroAoCarregar = false;
    this.iniciarTimeoutCarregamento();

    this.doacaoService.listarTodasDoacoes().pipe(timeout(5000)).subscribe({
      next: (doacoes) => {
        this.limparTimeoutCarregamento();
        console.log('Doacoes recebidas da API:', doacoes);
        this.dataSource.data = doacoes.map(doacao => ({
          id: doacao.id,
          cpf: doacao.cpf,
          nome: doacao.nome,
          equipamento: doacao.equipamento,
          dataCadastro: doacao.dataCadastro,
          dataUltimaAtualizacao: doacao.dataAlteracaoStatus,
          status: doacao.status
        }));
        this.carregando = false;
        this.erroAoCarregar = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.limparTimeoutCarregamento();
        console.error('Erro ao carregar doacoes:', error);
        this.carregando = false;
        this.erroAoCarregar = true;
        this.cdr.detectChanges();
      }
    });
  }

  pesquisar(): void {
    this.dataSource.filter = this.termoPesquisa.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  limparPesquisa(): void {
    this.termoPesquisa = '';
    this.dataSource.filter = '';
  }

  verDetalhes(doacao: DoacaoTecnico): void {
    this.router.navigate(['/tecnico/doacoes', doacao.id], {
      state: { doacao }
    });
  }

  imprimirEtiqueta(doacao: DoacaoTecnico): void {
    if (!this.podeImprimirEtiqueta(doacao)) {
      console.warn('A etiqueta so pode ser impressa para doacoes em estoque ou reparo');
      return;
    }

    if (!doacao.id) {
      console.error('Doacao sem ID para imprimir etiqueta:', doacao);
      return;
    }

    const janela = abrirJanelaEtiquetaVazia();

    this.doacaoService.doacaoId(doacao.id).subscribe({
      next: (doacaoAtualizada) => imprimirEtiquetaDoacao(doacaoAtualizada, janela),
      error: (erro) => {
        console.error('Erro ao buscar dados da doacao para etiqueta:', erro);
        imprimirEtiquetaDoacao(doacao, janela);
      }
    });
  }

  tentarNovamente(): void {
    this.buscarDoacoesDaApi();
  }

  private iniciarTimeoutCarregamento(): void {
    this.limparTimeoutCarregamento();

    this.timeoutCarregamento = setTimeout(() => {
      if (!this.carregando) {
        return;
      }

      this.carregando = false;
      this.erroAoCarregar = true;
      this.cdr.detectChanges();
    }, 5000);
  }

  private limparTimeoutCarregamento(): void {
    if (this.timeoutCarregamento) {
      clearTimeout(this.timeoutCarregamento);
      this.timeoutCarregamento = undefined;
    }
  }

  obterClasseStatus(status: string): string {
    const statusNormalizado = status
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (statusNormalizado.includes('aprovada')) {
      return 'status-aprovado';
    }

    if (statusNormalizado.includes('reprovado')) {
      return 'status-reprovado';
    }

    if (statusNormalizado.includes('estoque') || statusNormalizado.includes('vinculada') || statusNormalizado.includes('doado')) {
      return 'status-entregue';
    }

    if (statusNormalizado.includes('reparo')) {
      return 'status-analise';
    }

    if (statusNormalizado.includes('pendente')) {
      return 'status-pendente';
    }

    return 'status-default';
  }

  podeImprimirEtiqueta(doacao: DoacaoTecnico): boolean {
    const statusNormalizado = (doacao.status ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return statusNormalizado.includes('estoque') || statusNormalizado.includes('reparo');
  }

  
}
