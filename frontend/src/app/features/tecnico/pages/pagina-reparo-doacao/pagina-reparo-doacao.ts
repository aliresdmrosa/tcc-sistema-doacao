import { CommonModule } from '@angular/common';
import { Component, ViewChild, AfterViewInit, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';

// depois, importar service

interface ReparoHistorico {
  data: string;
  tecnico: string;
  descricao: string;
  status: string;
}

@Component({
  selector: 'app-pagina-reparo-doacao',
  standalone: true,
  imports: [ CommonModule, FormsModule, MatTableModule, MatPaginatorModule, MatIconModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatCardModule, MatSelectModule ],
  templateUrl: './pagina-reparo-doacao.html',
  styleUrls: ['./pagina-reparo-doacao.css']
})
export class PaginaReparoDoacaoComponent implements AfterViewInit, OnInit {

  private router = inject(Router);
  private route = inject(ActivatedRoute);

  idDoacao = this.route.snapshot.paramMap.get('id') ?? '1234';

  displayedColumns: string[] = [
    'data',
    'tecnico',
    'descricao',
    'status'
  ];

  // mock
  historicoMock: ReparoHistorico[] = [
    {
      data: '10/05/2025',
      tecnico: 'João',
      descricao: 'Troca de teclado iniciada.',
      status: 'Em reparo'
    },
    {
      data: '12/05/2025',
      tecnico: 'João',
      descricao: 'Teste inicial realizado.',
      status: 'Em reparo'
    }
  ];

  dataSource = new MatTableDataSource<ReparoHistorico>();

  tecnico = 'João';
  dataReparo = '2025-05-12';
  novoStatus = 'EM_REPARO';
  descricao = 'Teclado com defeito, precisa trocar';

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

  salvarReparo(): void {

    if (!this.descricao || !this.tecnico) {
      console.warn('Preencha os campos obrigatórios');
      return;
    }

    const novoReparo: ReparoHistorico = {
      data: this.formatarData(this.dataReparo),
      tecnico: this.tecnico,
      descricao: this.descricao,
      status: this.obterTextoStatus(this.novoStatus)
    };

    this.dataSource.data = [...this.dataSource.data, novoReparo];

    console.log('Salvar reparo:', novoReparo);

    // chamada api para salvar reparo

    this.resetarFormulario();
  }

  cancelar(): void {
    this.router.navigate(['/tecnico/doacoes']);
  }

  voltar(): void {
    this.router.navigate(['/tecnico/doacoes']);
  }

  private resetarFormulario(): void {
    this.descricao = '';
    this.novoStatus = 'EM_REPARO';
    this.dataReparo = '';
  }

  private formatarData(data: string): string {
    const partes = data.split('-');

    if (partes.length !== 3) {
      return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  private obterTextoStatus(status: string): string {
    if (status === 'EM_REPARO') return 'Em reparo';
    if (status === 'REPARO_CONCLUIDO') return 'Reparo concluído';
    if (status === 'FINALIZADO') return 'Finalizado';

    return status;
  }
}
