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

interface DoacaoAdmin {
  id: string;
  cpf: string;
  nome: string;
  equipamento: string;
  dataCadastro: Date;
  dataUltimaAtualizacao: Date;
  status: string;
}

@Component({
  selector: 'app-pagina-listar-doacao-admin',
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
  templateUrl: './pagina-listar-doacao.html',
  styleUrls: ['./pagina-listar-doacao.css']
})
export class PaginaListarDoacaoAdmin implements AfterViewInit {
  private router = inject(Router);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  carregando = false;
  erroAoCarregar = false;

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

  doacoes: DoacaoAdmin[] = [
    {
      id: '001',
      cpf: '010.100.555-85',
      nome: 'Maria',
      equipamento: 'Computador',
      dataCadastro: new Date(2025, 4, 1),
      dataUltimaAtualizacao: new Date(2025, 4, 1),
      status: 'APROVADA'
    },
    {
      id: '002',
      cpf: 'XXX.XXX.XXX-XX',
      nome: 'José',
      equipamento: 'Notebook',
      dataCadastro: new Date(2025, 4, 1),
      dataUltimaAtualizacao: new Date(2025, 4, 1),
      status: 'REPROVADA'
    },
    {
      id: '003',
      cpf: 'XXX.XXX.XXX-XX',
      nome: 'Ana',
      equipamento: 'Monitor',
      dataCadastro: new Date(2025, 4, 1),
      dataUltimaAtualizacao: new Date(2025, 4, 1),
      status: 'EM ANÁLISE'
    },
    {
      id: '004',
      cpf: 'XXX.XXX.XXX-XX',
      nome: 'Lucas',
      equipamento: 'Teclado',
      dataCadastro: new Date(2025, 4, 1),
      dataUltimaAtualizacao: new Date(2025, 4, 1),
      status: 'PENDENTE'
    },
    {
      id: '005',
      cpf: 'XXX.XXX.XXX-XX',
      nome: 'Mariana',
      equipamento: 'Mouse',
      dataCadastro: new Date(2025, 4, 1),
      dataUltimaAtualizacao: new Date(2025, 4, 1),
      status: 'APROVADA'
    },
    {
      id: '006',
      cpf: 'XXX.XXX.XXX-XX',
      nome: 'Pedro',
      equipamento: 'Impressora',
      dataCadastro: new Date(2025, 4, 1),
      dataUltimaAtualizacao: new Date(2025, 4, 1),
      status: 'PENDENTE'
    }
  ];

  dataSource = new MatTableDataSource<DoacaoAdmin>(this.doacoes);

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
      this.dataSource.data = this.doacoes;
    }, 800);
  }

  verDetalhes(doacao: DoacaoAdmin): void {
    this.router.navigate(['/admin/doacoes', doacao.id]);
  }

  editar(doacao: DoacaoAdmin): void {
    console.log('Editar doação:', doacao.id);

    // rota futura
    // this.router.navigate(['/admin/doacoes/editar', doacao.id]);
  }

  excluir(doacao: DoacaoAdmin): void {
    console.log('Excluir doação:', doacao.id);
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
      statusNormalizado.includes('analise')
    ) {
      return 'status-pendente';
    }

    return 'status-default';
  }
}