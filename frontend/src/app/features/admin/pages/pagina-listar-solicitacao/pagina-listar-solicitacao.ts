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
  templateUrl: './pagina-listar-solicitacao.html',
  styleUrls: ['./pagina-listar-solicitacao.css']
})
export class PaginaListarSolicitacao implements AfterViewInit {
  private router = inject(Router);
  private dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  carregando = false;
  erroAoCarregar = false;
  termoPesquisa = '';

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
      status: 'PENDENTE'
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
      status: 'VINCULADA'
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
    this.dataSource.filterPredicate = (solicitacao: SolicitacaoAdmin, filtro: string): boolean => {
      const termo = filtro.trim().toLowerCase();
      const texto = [
        solicitacao.id,
        solicitacao.grr,
        solicitacao.nome,
        solicitacao.equipamento,
        this.formatarData(solicitacao.dataCadastro),
        this.formatarData(solicitacao.dataUltimaAtualizacao),
        solicitacao.status
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
      this.dataSource.data = this.solicitacoes;
    }, 800);
  }

  verDetalhes(solicitacao: SolicitacaoAdmin): void {
    this.router.navigate(['/admin/solicitacoes', solicitacao.id]);
  }

  editar(solicitacao: SolicitacaoAdmin): void {
    this.verDetalhes(solicitacao);
  }

  excluir(solicitacao: SolicitacaoAdmin): void {
    const dialogRef = this.dialog.open(DialogBaseComponent, {
      width: '420px',
      disableClose: true,
      data: {
        tipo: 'confirm',
        titulo: 'Deseja excluir esta solicitação?',
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

      console.log('Excluir solicitação:', solicitacao.id);

      this.solicitacoes = this.solicitacoes.filter((item) => item.id !== solicitacao.id);
      this.dataSource.data = this.solicitacoes;
    });
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

    if (statusNormalizado.includes('pendente')) {
      return 'status-pendente';
    }

    if (statusNormalizado.includes('vinculada') || statusNormalizado.includes('doado')) {
      return 'status-entregue';
    }

    return 'status-default';
  }

  private formatarData(data: Date): string {
    return data.toLocaleDateString('pt-BR');
  }
}
