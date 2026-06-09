import { CommonModule, DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ViewChild, inject } from '@angular/core';
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
import { SolicitacaoService } from '../../../../core/services/solicitacao.service';
import { SolicitacaoResponseDTO } from '../../../../core/dto/solicitacao.response';


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
  private solicitacaoService = inject(SolicitacaoService);
  private cdf = inject(ChangeDetectorRef);
  solicitacoes: SolicitacaoResponseDTO[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  carregando = false;
  erroAoCarregar = false;
  termoPesquisa = '';

  displayedColumns: string[] = [
    'id',
    'grr',
    'nome',
    'cpf',
    'equipamento',
    'dataCadastro',
    'status',
    'acoes'
  ];

  ngOnInit(): void {
    this.carregarSolicitacoes();
  }

  carregarSolicitacoes(): void {
    this.carregando = true;
    this.erroAoCarregar = false;
    this.solicitacaoService.listarTodasSolicitacao().subscribe({
      next: (dados) => {
        this.solicitacoes = dados;
        this.dataSource.data = this.solicitacoes;
        console.log('Solicitações carregadas:', this.solicitacoes);
        this.carregando = false;
        this.erroAoCarregar = false;
        this.cdf.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar solicitações:', error);
        this.erroAoCarregar = true;
        this.carregando = false;
        this.cdf.detectChanges();
      }
    });
  }
  dataSource = new MatTableDataSource<SolicitacaoResponseDTO>(this.solicitacoes);

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterPredicate = (solicitacao: SolicitacaoResponseDTO, filtro: string): boolean => {
      const termo = filtro.trim().toLowerCase();
      const texto = [
        solicitacao,
        solicitacao.grr,
        solicitacao.nome,
        solicitacao.cpf,
        solicitacao.equipamento,
        this.formatarData(new Date(solicitacao.dataCadastro)),
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

  verDetalhes(solicitacao: SolicitacaoResponseDTO): void {
    this.router.navigate(['/admin/solicitacoes', solicitacao.id],{
      state : { solicitacao }
    }
    );
  }

  editar(solicitacao: SolicitacaoResponseDTO): void {
    this.verDetalhes(solicitacao);
  }

  excluir(solicitacao: SolicitacaoResponseDTO): void {
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

      this.solicitacaoService.excluirSolicitacao(solicitacao.id).subscribe({
        next: () => {
          console.log('Solicitação excluída com sucesso');
          this.carregarSolicitacoes();
          this.dialog.open(DialogBaseComponent, {
            width: '420px',
            disableClose: true,
            data: {
              tipo: 'success',
              titulo: 'Solicitação excluída com sucesso',
              mensagem: 'A solicitação foi excluída com sucesso.',
              textoConfirmar: 'OK'
            }
          });
        },
        error: (error) => {
          console.error('Erro ao excluir solicitação:', error);
        }
      });
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

  obterDataUltimaAtualizacao(solicitacao: SolicitacaoResponseDTO): string {
    return solicitacao.historico.at(-1)?.dataAlteracao ?? solicitacao.dataCadastro;
  }

  private formatarData(data: Date): string {
    return data.toLocaleDateString('pt-BR');
  }
}
