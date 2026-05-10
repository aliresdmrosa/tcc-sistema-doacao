import { CommonModule } from '@angular/common';
import { Component, ViewChild, AfterViewInit, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { ReparoService } from '../../../../core/services/reparo.service';

// depois, importar service

interface HistoricoReparo {
  id: string;
  equipamentoDoacao: string;
  dataInicio: string;
  dataFim: string;
  estado: string;
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
    MatCardModule,
  ],
  templateUrl: './pagina-historico-reparos.html',
  styleUrls: ['./pagina-historico-reparos.css']
})
export class PaginaHistoricoReparosComponent implements AfterViewInit, OnInit {

  private router = inject(Router);
  private reparoService = inject(ReparoService);

  displayedColumns: string[] = [
    'id',
    'equipamento',
    'dataInicio',
    'dataFinalizacao',
    'descrição',
    'acoes'
  ];

  

  dataSource = new MatTableDataSource<HistoricoReparo>();

  termoPesquisa = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // injetar service aqui

  ngOnInit(): void {

    this.reparoService.listarReparoTecnico().subscribe({
      next: (dados) => {
        console.log('Dados do histórico de reparos:', dados);
        this.dataSource.data = dados;
      },
      error: (erro) => {
        console.error('Erro ao buscar histórico de reparos:', erro);
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  // // mock
  // carregarDadosMock(): void {
  //   this.dataSource.data = this.historicoMock;
  // }

  // chamada api
  buscarHistoricoDaApi(): void {
  }

  pesquisar(): void {
    const termo = this.termoPesquisa.trim().toLowerCase();

    this.dataSource.filterPredicate = (historico: HistoricoReparo, filtro: string) => {
      return (
        historico.id.toLowerCase().includes(filtro) ||
        historico.equipamentoDoacao.toLowerCase().includes(filtro) ||
        historico.estado.toLowerCase().includes(filtro)
      );
    };

    this.dataSource.filter = termo;
  }

  limparPesquisa(): void {
    this.termoPesquisa = '';
    this.dataSource.filter = '';
  }

  verDetalhes(historico: HistoricoReparo): void {
    console.log('Ver detalhes do reparo:', historico);

    // depois, rota para detalhes do histórico/reparo
    // this.router.navigate(['/tecnico/historico', historico.id]);
  }
}