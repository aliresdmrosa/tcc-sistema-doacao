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
import { ReparoService } from '../../../../core/services/reparo.service';

interface ReparoHistorico {
  id: number;
  idDoacao: number;
  idTecnico: number;
  equipamentoDoacao: string;
  descricao: string;
  dataInicio: string;
  dataFim?: string | null;
  conclusao?: string | null;
}

@Component({
  selector: 'app-pagina-reparo-doacao',
  standalone: true,
  imports: [ CommonModule, FormsModule, MatTableModule, MatPaginatorModule, MatIconModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatCardModule ],
  templateUrl: './pagina-reparo-doacao.html',
  styleUrls: ['./pagina-reparo-doacao.css']
})
export class PaginaReparoDoacaoComponent implements AfterViewInit, OnInit {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private reparoService = inject(ReparoService);

  idDoacao = this.route.snapshot.paramMap.get('id') ?? '1234';
  statusDoacao = 'APROVADO_REPARO';

  displayedColumns: string[] = [
    'data',
    'tecnico',
    'descricao',
    'acoes'
  ];

  // // mock
  // historicoMock: ReparoHistorico[] = [
  //   {
  //     data: '10/05/2025',
  //     tecnico: 'João',
  //     descricao: 'Troca de teclado iniciada.'
  //   },
  //   {
  //     data: '12/05/2025',
  //     tecnico: 'João',
  //     descricao: 'Teste inicial realizado.'
  //   }
  // ];

  dataSource = new MatTableDataSource<ReparoHistorico>();

  tecnico = 'João';
  descricao = 'Teclado com defeito, precisa trocar';
  private indiceEdicao: number | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {

    // mock
    // this.carregarDadosMock();

    // chamada api
    this.buscarHistoricoDaApi();
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
    this.reparoService.listarReparoTecnico().subscribe({
      next: (dados) => {
        console.log('Dados do historico de reparos:', dados);
        this.dataSource.data = dados;
      },
      error: (erro) => {
        console.error('Erro ao buscar historico de reparos:', erro);
      }
    });
  }

  salvarReparo(): void {

    if (!this.descricao.trim()) {
      console.warn('Preencha a descrição do reparo');
      return;
    }

    if (this.indiceEdicao !== null) {
      const reparosAtualizados = [...this.dataSource.data];
      reparosAtualizados[this.indiceEdicao] = {
        ...reparosAtualizados[this.indiceEdicao],
        descricao: this.descricao.trim()
      };
      this.dataSource.data = reparosAtualizados;
      this.resetarFormulario();
      return;
    }

    const novoReparo: ReparoHistorico = {
      id: 0,
      idDoacao: Number(this.idDoacao),
      idTecnico: 1, // Substituir com o ID do técnico logado
      equipamentoDoacao: '', // Substituir com o nome do equipamento
      descricao: this.descricao.trim(),
      dataInicio: this.formatarDataAtual(),
      
    };

    const idNumerico = Number(this.idDoacao);
    if (Number.isFinite(idNumerico)) {
      this.reparoService.salvarReparo(idNumerico, novoReparo.descricao).subscribe({
        next: () => this.finalizarCadastroReparo(novoReparo),
        error: (erro) => console.error('Erro ao salvar reparo:', erro)
      });
      return;
    }

    this.finalizarCadastroReparo(novoReparo);
  }

  private finalizarCadastroReparo(novoReparo: ReparoHistorico): void {
    this.dataSource.data = [...this.dataSource.data, novoReparo];
    this.statusDoacao = 'REPARO';
    this.resetarFormulario();
  }

  editarDescricao(reparo: ReparoHistorico): void {
    const indice = this.dataSource.data.indexOf(reparo);

    if (indice < 0) {
      return;
    }

    this.indiceEdicao = indice;
    this.descricao = reparo.descricao;
  }
  
  voltar(): void {
    this.router.navigate(['/tecnico/doacoes']);
  }

  private resetarFormulario(): void {
    this.descricao = '';
    this.indiceEdicao = null;
  }

  private formatarDataAtual(): string {
    return new Date().toLocaleDateString('pt-BR');
  }

}
