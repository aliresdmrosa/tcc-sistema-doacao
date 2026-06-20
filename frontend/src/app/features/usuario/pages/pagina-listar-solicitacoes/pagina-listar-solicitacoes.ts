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
import { SolicitacaoService } from '../../../../core/services/solicitacao.service';

@Component({
  selector: 'app-pagina-listar-solicitacoes',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './pagina-listar-solicitacoes.html',
  styleUrl: './pagina-listar-solicitacoes.css'
})
export class PaginaListarSolicitacoes implements OnInit, AfterViewInit {
  private solicitacaoService = inject(SolicitacaoService);
  private cdf = inject(ChangeDetectorRef);
  private router = inject(Router);


  displayedColumns: string[] = [
    'id',
    'equipamento',
    'motivo',
    'dataCadastro',
    'status',
    'acoes'
  ];

  dataSource = new MatTableDataSource<any>([]);

  carregando = false;
  erroAoCarregar = false;
  termoPesquisa = '';
  private timeoutCarregamento?: ReturnType<typeof setTimeout>;

  @ViewChild(MatPaginator) 
  set paginator(paginator: MatPaginator | undefined) {
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }

  ngOnInit(): void {
    // this.carregarDadosMockados();
    // depois substituir pela chamada de api
    this.buscarSolicitacoes();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;

  

    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const texto = `
        ${data.id}
        ${data.equipamento}
        ${data.dataCadastro}
        ${data.dataAlteracao}
        ${data.status}
        ${data.semComputador}
        ${data.ativo}}
      `.toLowerCase();

      return texto.includes(filter);
    };
  }

 

  buscarSolicitacoes(): void {
    this.carregando = true;
    this.erroAoCarregar = false;
    this.iniciarTimeoutCarregamento();

    this.solicitacaoService.listarSolicitacaoUsuario().pipe(timeout(5000)).subscribe({
      next: (solicitacoes) => {
        this.limparTimeoutCarregamento();
        this.dataSource.data = solicitacoes;
        console.log(solicitacoes);

        
        this.carregando = false;
        this.erroAoCarregar = false;
        this.cdf.detectChanges();
      },
      error: () => {
        this.limparTimeoutCarregamento();
        this.carregando = false;
        this.erroAoCarregar = true;
        this.cdf.detectChanges();
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

  verDetalhes(solicitacao: any): void {
    this.router.navigate(['/usuario/solicitacoes', solicitacao.id], {
      state: { solicitacao }
    });
  }

  obterClasseStatus(status: string): string {
    switch (status?.toUpperCase()) {
      case 'APROVADA':
      case 'APROVADO':
        return 'status-aprovado';
      case 'REPROVADA':
      case 'REPROVADO':
        return 'status-reprovado';
      case 'PENDENTE':
        return 'status-pendente';
      case 'VINCULADA':
      case 'DOADO':
        return 'status-entregue';
      default:
        return 'status-default';
    }
  }

  obterTextoStatus(status: string): string {
    switch (status?.toUpperCase()) {
      case 'APROVADA':
        return 'Aprovada';
      case 'REPROVADA':
        return 'Reprovada';
      case 'VINCULADA':
        return 'Vinculada';
      case 'DOADO':
        return 'Doado';
      case 'PENDENTE':
        return 'Pendente';
      default:
        return status;
    }
  }

  tentarNovamente(): void {
    // chamda de api 
    this.buscarSolicitacoes();
  }

  private iniciarTimeoutCarregamento(): void {
    this.limparTimeoutCarregamento();

    this.timeoutCarregamento = setTimeout(() => {
      if (!this.carregando) {
        return;
      }

      this.carregando = false;
      this.erroAoCarregar = true;
      this.cdf.detectChanges();
    }, 5000);
  }

  private limparTimeoutCarregamento(): void {
    if (this.timeoutCarregamento) {
      clearTimeout(this.timeoutCarregamento);
      this.timeoutCarregamento = undefined;
    }
  }
}
