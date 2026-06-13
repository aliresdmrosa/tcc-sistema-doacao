import { CommonModule, DatePipe } from '@angular/common';
import { AfterViewInit, Component, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogBaseComponent } from '../../../../shared/dialogs/dialog-base/dialog-base';
import { DoacaoService } from '../../../../core/services/doacao.service';
import { DoacaoDTO } from '../../../../core/dto/daocao.dto';
import { abrirJanelaEtiquetaVazia, imprimirEtiquetaDoacao } from '../../../../shared/utils/etiqueta-doacao';


@Component({
  selector: 'app-pagina-listar-doacao-admin',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './pagina-listar-doacao.html',
  styleUrls: ['./pagina-listar-doacao.css']
})
export class PaginaListarDoacaoAdmin implements AfterViewInit {
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private doacaoService = inject(DoacaoService);
  doacoes : DoacaoDTO[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  carregando = false;
  erroAoCarregar = false;
  termoPesquisa = '';

  displayedColumns: string[] = [
    'id',
    'cpf',
    'nome',
    'equipamento',
    'dataCadastro',
    'status',
    'acoes'
  ];


  ngOnInit(): void {
    this.carregarDoacoes();
  }

  carregarDoacoes(): void {
    this.doacaoService.listarTodasDoacoes().subscribe({
      next: (doacoes) => {
        console.log('Doações carregadas:', doacoes);
        this.doacoes = doacoes;
        this.dataSource.data = this.doacoes;
      },
      error: (err) => {
        console.error('Erro ao carregar doações:', err);
      }
    });
  }

  dataSource = new MatTableDataSource<DoacaoDTO>(this.doacoes);

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterPredicate = (doacao: DoacaoDTO, filtro: string): boolean => {
      const termo = filtro.trim().toLowerCase();
      const texto = [
        doacao.id,
        doacao.cpf,
        doacao.nome,
        doacao.equipamento,
        this.formatarData(new Date(doacao.dataCadastro)),
        doacao.status
      ].join(' ').toLowerCase();

      return texto.includes(termo);
    };
  }

  aplicarFiltroPesquisa(): void {
    this.dataSource.filter = this.termoPesquisa.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  limparPesquisa(): void {
    this.termoPesquisa = '';
    this.dataSource.filter = '';
  }

  tentarNovamente(): void {
    this.carregando = true;
    this.erroAoCarregar = false;

    setTimeout(() => {
      this.carregando = false;
      this.dataSource.data = this.doacoes;
    }, 800);
  }

  verDetalhes(doacao: DoacaoDTO): void {
    this.router.navigate(['/admin/doacoes', doacao.id]);
  }

  editar(doacao: DoacaoDTO): void {
    this.verDetalhes(doacao);
  }

  excluir(doacao: DoacaoDTO): void {
    const dialogRef = this.dialog.open(DialogBaseComponent, {
      width: '420px',
      disableClose: true,
      data: {
        tipo: 'confirm',
        titulo: 'Deseja excluir esta doação?',
        mensagem: 'Essa ação será permanente.',
        textoConfirmar: 'Confirmar',
        textoCancelar: 'Cancelar',
        mostrarCancelar: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmou) => {
      if (!confirmou) {
        return;
      }

      console.log('Excluir doação:', doacao.id);

      this.doacoes = this.doacoes.filter((item) => item.id !== doacao.id);
      this.dataSource.data = this.doacoes;
    });
  }

  imprimirEtiqueta(doacao: DoacaoDTO): void {
    

    const janela = abrirJanelaEtiquetaVazia();

    this.doacaoService.doacaoId(doacao.id).subscribe({
      next: (doacaoAtualizada) => imprimirEtiquetaDoacao(doacaoAtualizada, janela),
      error: (erro) => {
        console.error('Erro ao buscar dados da doacao para etiqueta:', erro);
        imprimirEtiquetaDoacao(doacao, janela);
      }
    });
  }

  obterClasseStatus(status: string): string {
    const statusNormalizado = status
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (statusNormalizado.includes('aprovada') || statusNormalizado.includes('aprovado')) {
      return 'status-aprovado';
    }

    if (statusNormalizado.includes('reprovada') || statusNormalizado.includes('reprovado')) {
      return 'status-reprovado';
    }

    if (statusNormalizado.includes('estoque') || statusNormalizado.includes('vinculada') || statusNormalizado.includes('doado') || statusNormalizado.includes('entregue')) {
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

 

  private formatarData(data: Date): string {
    return data.toLocaleDateString('pt-BR');
  }
}
