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

// depois, importar service

interface HistoricoReparo {
  id: string;
  equipamento: string;
  dataInicio: string;
  dataFinalizacao: string;
  estado: string;
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

  displayedColumns: string[] = [
    'id',
    'equipamento',
    'dataInicio',
    'dataFinalizacao',
    'estado',
    'acoes'
  ];

  // mock
  historicoMock: HistoricoReparo[] = [
    {
      id: '001',
      equipamento: 'Computador',
      dataInicio: '01/05/2025',
      dataFinalizacao: '01/05/2025',
      estado: 'ENTREGUE'
    },
    {
      id: '002',
      equipamento: 'Notebook',
      dataInicio: '01/05/2025',
      dataFinalizacao: '01/05/2025',
      estado: 'ENTREGUE'
    },
    {
      id: '003',
      equipamento: 'Monitor',
      dataInicio: '01/05/2025',
      dataFinalizacao: '01/05/2025',
      estado: 'EM ANÁLISE'
    },
    {
      id: '004',
      equipamento: 'Teclado',
      dataInicio: '01/05/2025',
      dataFinalizacao: '01/05/2025',
      estado: 'EM REPARO'
    },
    {
      id: '005',
      equipamento: 'Mouse',
      dataInicio: '01/05/2025',
      dataFinalizacao: '-',
      estado: 'EM REPARO'
    },
    {
      id: '006',
      equipamento: 'Notebook',
      dataInicio: '02/05/2025',
      dataFinalizacao: '04/05/2025',
      estado: 'ENTREGUE'
    },
    {
      id: '007',
      equipamento: 'Computador',
      dataInicio: '03/05/2025',
      dataFinalizacao: '-',
      estado: 'EM ANÁLISE'
    },
    {
      id: '008',
      equipamento: 'Monitor',
      dataInicio: '04/05/2025',
      dataFinalizacao: '05/05/2025',
      estado: 'ENTREGUE'
    }
  ];

  dataSource = new MatTableDataSource<HistoricoReparo>();

  termoPesquisa = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // injetar service aqui

  ngOnInit(): void {

    // mock
    this.carregarDadosMock();

    // chamada api
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  // mock
  carregarDadosMock(): void {
    this.dataSource.data = this.historicoMock;
  }

  // chamada api
  buscarHistoricoDaApi(): void {
  }

  pesquisar(): void {
    const termo = this.termoPesquisa.trim().toLowerCase();

    this.dataSource.filterPredicate = (historico: HistoricoReparo, filtro: string) => {
      return (
        historico.id.toLowerCase().includes(filtro) ||
        historico.equipamento.toLowerCase().includes(filtro) ||
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