import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
import { ReparoService } from '../../../../core/services/reparo.service';

interface HistoricoReparo {
  id: string;
  idDoacao: number;
  equipamentoDoacao: string;
  dataInicio: string;
  dataFim: string;
  descricao: string;
  conclusao: string;
}

@Component({
  selector: 'app-pagina-historico-reparos',
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
  templateUrl: './pagina-historico-reparos.html',
  styleUrls: ['./pagina-historico-reparos.css']
})
export class PaginaHistoricoReparosComponent implements AfterViewInit, OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private reparoService = inject(ReparoService);
  private cdr = inject(ChangeDetectorRef);

  displayedColumns: string[] = [
    'id',
    'idDoacao',
    'equipamento',
    'dataInicio',
    'dataFinalizacao',
    'descricao',
    'acoes'
  ];

  dataSource = new MatTableDataSource<HistoricoReparo>();
  termoPesquisa = '';
  carregando = false;
  erroAoCarregar = false;
  idTecnicoAdmin = Number(this.route.snapshot.paramMap.get('id'));
  private timeoutCarregamento?: ReturnType<typeof setTimeout>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    this.carregarHistorico();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  carregarHistorico(): void {
    this.carregando = true;
    this.erroAoCarregar = false;
    this.iniciarTimeoutCarregamento();

    const requisicao = this.idTecnicoAdmin
      ? this.reparoService.listarReparoTecnicoPorId(this.idTecnicoAdmin)
      : this.reparoService.listarReparoTecnico();

    requisicao.pipe(timeout(5000)).subscribe({
      next: (dados) => {
        this.limparTimeoutCarregamento();
        console.log('Dados do historico de reparos:', dados);
        this.dataSource.data = dados;
        this.carregando = false;
        this.erroAoCarregar = false;
        this.cdr.detectChanges();
      },
      error: (erro) => {
        this.limparTimeoutCarregamento();
        console.error('Erro ao buscar historico de reparos:', erro);
        this.carregando = false;
        this.erroAoCarregar = true;
        this.cdr.detectChanges();
      }
    });
  }

  tentarNovamente(): void {
    this.carregarHistorico();
  }

  pesquisar(): void {
    const termo = this.termoPesquisa.trim().toLowerCase();

    this.dataSource.filterPredicate = (historico: HistoricoReparo, filtro: string) => {
      return (
        String(historico.id).toLowerCase().includes(filtro) ||
        String(historico.idDoacao).toLowerCase().includes(filtro) ||
        historico.equipamentoDoacao.toLowerCase().includes(filtro) ||
        historico.descricao.toLowerCase().includes(filtro)
      );
    };

    this.dataSource.filter = termo;
  }

  limparPesquisa(): void {
    this.termoPesquisa = '';
    this.dataSource.filter = '';
  }

  voltarParaDetalhesTecnico(): void {
    if (this.idTecnicoAdmin) {
      this.router.navigate(['/admin/tecnicos', this.idTecnicoAdmin]);
    }
  }

  verDetalhes(historico: HistoricoReparo): void {
    if (this.idTecnicoAdmin) {
      this.router.navigate([
        '/admin/tecnicos',
        this.idTecnicoAdmin,
        'reparos',
        historico.id
      ]);
      return;
    }

    this.router.navigate(['/tecnico/doacoes', historico.idDoacao, 'reparo'], {
      state: { historico }
    });
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
}
