import { CommonModule, DatePipe } from '@angular/common';
import { AfterViewInit, Component, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';

interface SolicitacaoAdmin {
  id: string;
  grr: string;
  nome: string;
  equipamento: string;
  dataCadastro: Date;
  dataUltimaAtualizacao: Date;
  status: string;
}

@Component({
  selector: 'app-pagina-listar-solicitacao',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule
  ],
  templateUrl: './pagina-listar-solicitacao.html',
  styleUrls: ['./pagina-listar-solicitacao.css']
})
export class PaginaListarSolicitacao implements AfterViewInit {
  private router = inject(Router);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  carregando = false;
  erroAoCarregar = false;

  displayedColumns: string[] = [
    'id',
    'grr',
    'nome',
    'equipamento',
    'dataCadastro',
    'dataUltimaAtualizacao',
    'status',
    'acoes'
  ];

  solicitacoes: SolicitacaoAdmin[] = [
    {
      id: '001',
      grr: '2025000000',
      nome: 'Maria',
      equipamento: 'Computador',
      dataCadastro: new Date(2025, 4, 1),
      dataUltimaAtualizacao: new Date(2025, 4, 1),
      status: 'SOLICITADA'
    },
    {
      id: '002',
      grr: '2024000000',
      nome: 'José',
      equipamento: 'Notebook',
      dataCadastro: new Date(2025, 4, 1),
      dataUltimaAtualizacao: new Date(2025, 4, 1),
      status: 'PENDENTE'
    },
    {
      id: '003',
      grr: '2023000000',
      nome: 'Ana',
      equipamento: 'Monitor',
      dataCadastro: new Date(2025, 4, 1),
      dataUltimaAtualizacao: new Date(2025, 4, 1),
      status: 'PENDENTE'
    },
    {
      id: '004',
      grr: 'XXXX',
      nome: 'XXXX',
      equipamento: 'XXXX',
      dataCadastro: new Date(2025, 4, 1),
      dataUltimaAtualizacao: new Date(2025, 4, 1),
      status: 'EM ANÁLISE'
    },
    {
      id: '005',
      grr: 'XXXX',
      nome: 'XXXX',
      equipamento: 'XXXX',
      dataCadastro: new Date(2025, 4, 1),
      dataUltimaAtualizacao: new Date(2025, 4, 1),
      status: 'APROVADA'
    },
    {
      id: '006',
      grr: 'XXXX',
      nome: 'XXXX',
      equipamento: 'XXXX',
      dataCadastro: new Date(2025, 4, 1),
      dataUltimaAtualizacao: new Date(2025, 4, 1),
      status: 'REPROVADA'
    },
    {
      id: '007',
      grr: 'XXXX',
      nome: 'XXXX',
      equipamento: 'XXXX',
      dataCadastro: new Date(2025, 4, 1),
      dataUltimaAtualizacao: new Date(2025, 4, 1),
      status: 'PENDENTE'
    },
    {
      id: '008',
      grr: 'XXXX',
      nome: 'XXXX',
      equipamento: 'XXXX',
      dataCadastro: new Date(2025, 4, 1),
      dataUltimaAtualizacao: new Date(2025, 4, 1),
      status: 'PENDENTE'
    },
    {
      id: '009',
      grr: 'XXXX',
      nome: 'XXXX',
      equipamento: 'XXXX',
      dataCadastro: new Date(2025, 4, 1),
      dataUltimaAtualizacao: new Date(2025, 4, 1),
      status: 'PENDENTE'
    },
    {
      id: '010',
      grr: 'XXXX',
      nome: 'XXXX',
      equipamento: 'XXXX',
      dataCadastro: new Date(2025, 4, 1),
      dataUltimaAtualizacao: new Date(2025, 4, 1),
      status: 'PENDENTE'
    }
  ];

  dataSource = new MatTableDataSource<SolicitacaoAdmin>(this.solicitacoes);

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  aplicarFiltro(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.dataSource.filter = valor.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  tentarNovamente(): void {
    this.carregando = true;
    this.erroAoCarregar = false;

    setTimeout(() => {
      this.carregando = false;
      this.dataSource.data = this.solicitacoes;
    }, 800);
  }

  verDetalhes(solicitacao: SolicitacaoAdmin): void {
    this.router.navigate(['/admin/solicitacoes', solicitacao.id]);
  }

  editar(solicitacao: SolicitacaoAdmin): void {
    console.log('Editar solicitação:', solicitacao.id);

    // rota futura
    // this.router.navigate(['/admin/solicitacoes/editar', solicitacao.id]);
  }

  excluir(solicitacao: SolicitacaoAdmin): void {
    console.log('Excluir solicitação:', solicitacao.id);

  }

  obterClasseStatus(status: string): string {
    const statusNormalizado = status
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (statusNormalizado.includes('aprovada')) {
      return 'status-aprovado';
    }

    if (statusNormalizado.includes('reprovada')) {
      return 'status-reprovado';
    }

    if (
      statusNormalizado.includes('pendente') ||
      statusNormalizado.includes('analise') ||
      statusNormalizado.includes('solicitada')
    ) {
      return 'status-pendente';
    }

    return 'status-default';
  }
}
