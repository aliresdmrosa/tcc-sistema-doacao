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
import { DoacaoService } from '../../../../core/services/doacao.service';
 

interface DoacaoTecnico {
  id?: number;
  cpf?: string;
  nome?: string;
  equipamento?: string;
  dataCadastro?: string;
  dataUltimaAtualizacao?: string;
  estado?: string;
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

  private router = inject(Router); 
  private doacaoService = inject(DoacaoService);

  displayedColumns: string[] = [
    'id',
    'cpf',
    'nome',
    'equipamento',
    'dataCadastro',
    'dataUltimaAtualizacao',
    'status',
    'acoes'
  ];

  

  dataSource = new MatTableDataSource<DoacaoTecnico>();

  termoPesquisa = '';
  dataFiltro: Date | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;


  ngOnInit(): void {
    this.buscarDoacoesDaApi();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }


  // chamda api 
  buscarDoacoesDaApi(): void {
    this.doacaoService.listarDoacoesReverReparo().subscribe({
      next: (doacoes) => {
        console.log('Doações recebidas da API:', doacoes);
        this.dataSource.data = doacoes.map(doacao => ({
          id: doacao.id,
          cpf: doacao.cpf,
          nome: doacao.nome,
          equipamento: doacao.equipamento,
          dataCadastro: doacao.dataCadastro,
          dataUltimaAtualizacao: doacao.dataAlteracaoStatus,
          status: doacao.status
        }));
      },
      error: (error) => {
        console.error('Erro ao carregar doações:', error);
       
      }
    });
  }

  pesquisar(): void {
    const termo = this.termoPesquisa.trim().toLowerCase();

    this.dataSource.filterPredicate = (doacao: DoacaoTecnico, filtro: string): boolean => {
  const termo = filtro.trim().toLowerCase();

  return (doacao.nome || '').toLowerCase().includes(termo) ||
         (doacao.cpf || '').includes(termo) ||
         (doacao.equipamento || '').toLowerCase().includes(termo);
};

    this.dataSource.filter = termo;
  }

  limparPesquisa(): void {
    this.termoPesquisa = '';
    this.dataSource.filter = '';
  }

  aplicarFiltroData(): void {
    if (!this.dataFiltro) {
      this.dataSource.data = this.dataSource.data; // Mantém os dados atuais sem filtro
      return;
    }

    const dataSelecionada = this.formatarData(this.dataFiltro);

    this.dataSource.data = this.dataSource.data.filter(
      doacao => doacao.dataCadastro === dataSelecionada
    );
  }

  limparFiltroData(): void {
    this.dataFiltro = null;
    this.dataSource.data = this.dataSource.data;
  }

  verDetalhes(doacao: DoacaoTecnico): void {
    this.router.navigate(['/tecnico/doacoes', doacao.id]); //NAVEGAÇÃO
  }

  private formatarData(data: Date): string {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();

    return `${dia}/${mes}/${ano}`;
  }
}