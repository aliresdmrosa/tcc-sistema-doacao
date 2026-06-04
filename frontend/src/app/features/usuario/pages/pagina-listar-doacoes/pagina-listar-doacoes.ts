import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { timeout } from 'rxjs';
import { DoacaoService } from '../../../../core/services/doacao.service';

@Component({
  selector: 'app-pagina-listar-doacoes',
  standalone: true,
  imports: [CommonModule,DatePipe,FormsModule,MatCardModule,MatTableModule,MatPaginatorModule,MatFormFieldModule,MatInputModule,
            MatButtonModule,MatIconModule,MatTooltipModule],
  templateUrl: './pagina-listar-doacoes.html',
  styleUrl: './pagina-listar-doacoes.css'
})
export class PaginaListarDoacoes implements OnInit, AfterViewInit {
  private doacaoService = inject(DoacaoService);
  private cdRef = inject(ChangeDetectorRef);
  private router = inject(Router);


  displayedColumns: string[] = [
    'id',
    'equipamento',
    'statusConservacao',
    'descricao',
    'dataCadastro',
    'status',
    'acoes'
  ];

  dataSource = new MatTableDataSource<any>([]);

  carregando = false;
  erroAoCarregar = false;
  termoPesquisa = '';
  private timeoutCarregamento?: ReturnType<typeof setTimeout>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    // chamada de api substituir mock por:
    this.buscarDoacoes();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;

    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const texto = `
        ${data.id}
        ${data.equipamento}
        ${data.statusConservacao}
        ${data.descricao}
        ${data.dataCadastro}
        ${data.status}
      `.toLowerCase();

      return texto.includes(filter);
    };
  }

  carregarDadosMockados(): void {
    this.carregando = false;
    this.erroAoCarregar = false;

    this.dataSource.data = [
      {
        id: '001',
        equipamento: 'Computador',
        statusConservacao: 'NOVO',
        dataCadastro: '2025-05-01',
        status: 'APROVADA'
      },
      {
        id: '002',
        equipamento: 'Notebook',
        statusConservacao: 'USADO',
        dataCadastro: '2025-05-01',
        ultimaAtualizacao: '2025-05-01',
        status: 'REPROVADA'
      },
      {
        id: '003',
        equipamento: 'Monitor',
        statusConservacao: 'REPARO',
        dataCadastro: '2025-05-01',
        ultimaAtualizacao: '2025-05-01',
        status: 'EM_ESTOQUE'
      },
      {
        id: '004',
        equipamento: 'Mouse',
        statusConservacao: 'NOVO',
        dataCadastro: '2025-05-02',
        ultimaAtualizacao: '2025-05-02',
        status: 'PENDENTE'
      },
      {
        id: '005',
        equipamento: 'Teclado',
        statusConservacao: 'USADO',
        dataCadastro: '2025-05-02',
        ultimaAtualizacao: '2025-05-03',
        status: 'APROVADA'
      },
      {
        id: '006',
        equipamento: 'Webcam',
        statusConservacao: 'NOVO',
        dataCadastro: '2025-05-03',
        ultimaAtualizacao: '2025-05-03',
        status: 'PENDENTE'
      },
      {
        id: '007',
        equipamento: 'Caixa de som',
        statusConservacao: 'USADO',
        dataCadastro: '2025-05-03',
        ultimaAtualizacao: '2025-05-04',
        status: 'REPROVADA'
      },
      {
        id: '008',
        equipamento: 'Roteador',
        statusConservacao: 'NOVO',
        dataCadastro: '2025-05-04',
        ultimaAtualizacao: '2025-05-04',
        status: 'REPARO'
      },
      {
        id: '009',
        equipamento: 'Monitor',
        statusConservacao: 'REPARO',
        dataCadastro: '2025-05-04',
        ultimaAtualizacao: '2025-05-05',
        status: 'PENDENTE'
      },
      {
        id: '010',
        equipamento: 'Notebook',
        statusConservacao: 'USADO',
        dataCadastro: '2025-05-05',
        ultimaAtualizacao: '2025-05-05',
        status: 'APROVADA'
      }
    ];
  }

  buscarDoacoes(): void {
    // API
    this.carregando = true;
    this.erroAoCarregar = false;
    this.iniciarTimeoutCarregamento();

    this.doacaoService.listarDoacoesUsuario().pipe(timeout(5000)).subscribe({
      next: (doacoes) => {     
        this.limparTimeoutCarregamento();
        this.dataSource.data = doacoes;
        console.log("dados na tabela",this.dataSource.data);
        this.carregando = false;
        this.erroAoCarregar = false;
        this.cdRef.detectChanges();
      },
      error: () => {
        this.limparTimeoutCarregamento();
        this.carregando = false;
        this.erroAoCarregar = true;
        this.cdRef.detectChanges();
      }
    });
    
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

  verDetalhes(doacao: any): void {
    this.router.navigate(['/usuario/doacoes', doacao.id], {
      state: { doacao }
    });
  }

  obterClasseStatus(status: string): string {
    switch (status?.toUpperCase()) {
      case 'APROVADA':
      case 'APROVADO':
      case 'APROVADO_IA':
        return 'status-aprovado';
      case 'REPROVADA':
      case 'REPROVADO':
        return 'status-reprovado';
      case 'REPARO':
        return 'status-analise';
      case 'EM_ESTOQUE':
      case 'VINCULADA':
      case 'DOADO':
        return 'status-entregue';
      case 'PENDENTE':
        return 'status-pendente';
      default:
        return 'status-default';
    }
  }

  obterTextoStatusConservacao(status: string): string {
    switch (status?.toUpperCase()) {
      case 'NOVO':
        return 'Novo';
      case 'USADO':
        return 'Usado';
      case 'REPARO':
        return 'Precisa de reparo';
      default:
        return status;
    }
  }

  tentarNovamente(): void {
    // integração futura com API:
    this.buscarDoacoes();

   
  }

  private iniciarTimeoutCarregamento(): void {
    this.limparTimeoutCarregamento();

    this.timeoutCarregamento = setTimeout(() => {
      if (!this.carregando) {
        return;
      }

      this.carregando = false;
      this.erroAoCarregar = true;
      this.cdRef.detectChanges();
    }, 5000);
  }

  private limparTimeoutCarregamento(): void {
    if (this.timeoutCarregamento) {
      clearTimeout(this.timeoutCarregamento);
      this.timeoutCarregamento = undefined;
    }
  }
}
