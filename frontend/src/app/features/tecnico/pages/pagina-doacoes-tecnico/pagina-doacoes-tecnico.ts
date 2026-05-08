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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';

// depois, importar service  

interface DoacaoTecnico {
  id: string;
  cpf: string;
  nome: string;
  equipamento: string;
  dataCadastro: string;
  dataUltimaAtualizacao: string;
  estado: string;
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
  ],
  templateUrl: './pagina-doacoes-tecnico.html',
  styleUrls: ['./pagina-doacoes-tecnico.css']
})
export class PaginaDoacoesTecnicoComponent implements AfterViewInit, OnInit {

  private router = inject(Router); // 👈 AQUI

  displayedColumns: string[] = [
    'id',
    'cpf',
    'nome',
    'equipamento',
    'dataCadastro',
    'dataUltimaAtualizacao',
    'estado',
    'acoes'
  ];

  // mock
  doacoesMock: DoacaoTecnico[] = [
    {
      id: '001',
      cpf: '010.100.555-85',
      nome: 'Maria',
      equipamento: 'Computador',
      dataCadastro: '01/05/2025',
      dataUltimaAtualizacao: '01/05/2025',
      estado: 'REVER'
    },
    {
      id: '002',
      cpf: '123.456.789-10',
      nome: 'José',
      equipamento: 'Notebook',
      dataCadastro: '02/05/2025',
      dataUltimaAtualizacao: '02/05/2025',
      estado: 'REVER'
    },
    {
      id: '003',
      cpf: '987.654.321-00',
      nome: 'Ana',
      equipamento: 'Monitor',
      dataCadastro: '03/05/2025',
      dataUltimaAtualizacao: '03/05/2025',
      estado: 'REPARO'
    },
    {
      id: '004',
      cpf: '222.333.444-55',
      nome: 'Carlos',
      equipamento: 'Desktop',
      dataCadastro: '04/05/2025',
      dataUltimaAtualizacao: '04/05/2025',
      estado: 'REVER'
    },
    {
      id: '005',
      cpf: '111.222.333-44',
      nome: 'Fernanda',
      equipamento: 'Notebook',
      dataCadastro: '05/05/2025',
      dataUltimaAtualizacao: '05/05/2025',
      estado: 'REPARO'
    }
  ];

  dataSource = new MatTableDataSource<DoacaoTecnico>();

  termoPesquisa = '';
  dataFiltro: Date | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // injetar service aqui

  ngOnInit(): void {

    // mock
    this.carregarDadosMock();

    // chamda api  
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  // mock
  carregarDadosMock(): void {
    this.dataSource.data = this.doacoesMock;
  }

  // chamda api 
  buscarDoacoesDaApi(): void {
  }

  pesquisar(): void {
    const termo = this.termoPesquisa.trim().toLowerCase();

    this.dataSource.filterPredicate = (doacao: DoacaoTecnico, filtro: string) => {
      return (
        doacao.nome.toLowerCase().includes(filtro) ||
        doacao.id.toLowerCase().includes(filtro) ||
        doacao.cpf.toLowerCase().includes(filtro) ||
        doacao.equipamento.toLowerCase().includes(filtro)
      );
    };

    this.dataSource.filter = termo;
  }

  limparPesquisa(): void {
    this.termoPesquisa = '';
    this.dataSource.filter = '';
  }

  aplicarFiltroData(): void {
    if (!this.dataFiltro) {
      this.dataSource.data = this.doacoesMock;
      return;
    }

    const dataSelecionada = this.formatarData(this.dataFiltro);

    this.dataSource.data = this.doacoesMock.filter(
      doacao => doacao.dataCadastro === dataSelecionada
    );
  }

  limparFiltroData(): void {
    this.dataFiltro = null;
    this.dataSource.data = this.doacoesMock;
  }

  verDetalhes(doacao: DoacaoTecnico): void {
    this.router.navigate(['/tecnico/doacoes', doacao.id]); // 👈 NAVEGAÇÃO
  }

  private formatarData(data: Date): string {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();

    return `${dia}/${mes}/${ano}`;
  }
}