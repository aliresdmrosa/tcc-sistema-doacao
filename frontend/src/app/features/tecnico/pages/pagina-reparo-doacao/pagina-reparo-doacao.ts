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
  statusDoacao = 'REPARO';

  displayedColumns: string[] = [
    'data',
    'dataFim',
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
  descricao = '';
  private indiceEdicao: number | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  get podeAdicionarReparo(): boolean {
    const reparos = this.dataSource.data;

    if (reparos.length === 0) {
      return true;
    }

    const ultimoReparo = reparos[reparos.length - 1];
    return !!ultimoReparo.dataFim;
  }

  get podeConcluirDoacao(): boolean {
    const reparos = this.dataSource.data;
    return this.statusDoacao !== 'ESTOQUE' && reparos.length > 0 && reparos.every((reparo) => !!reparo.dataFim);
  }

  get editandoReparo(): boolean {
    return this.indiceEdicao !== null;
  }

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
    const idDoacao = Number(this.idDoacao);

    if (!Number.isFinite(idDoacao)) {
      console.error('Id da doacao invalido:', this.idDoacao);
      return;
    }

    this.reparoService.listarReparosDoacao(idDoacao).subscribe({
      next: (dados) => {
        console.log('Dados do historico de reparos da doacao:', dados);
        this.dataSource.data = dados;
      },
      error: (erro) => {
        console.error('Erro ao buscar historico de reparos:', erro);
      }
    });
  }

  concluirReparo(): void {
    if (!this.podeConcluirDoacao) {
      console.warn('Conclua todos os reparos antes de enviar a doacao para estoque');
      return;
    }

    const ultimoReparo = this.dataSource.data[this.dataSource.data.length - 1];

    this.reparoService.concluirReparo(ultimoReparo.id, 'Doacao enviada para estoque').subscribe({
      next: () => {
        console.log('Doacao enviada para estoque com sucesso');
        this.buscarHistoricoDaApi();
        this.atualizarStatusDoacao('ESTOQUE');
      }
      ,
      error: (erro) => console.error('Erro ao concluir doacao:', erro)
    });

  }

  concluirReparoItem(reparo: ReparoHistorico): void {
    this.reparoService.concluirReparoItem(reparo.id).subscribe({
      next: () => {
        console.log('Reparo concluido com sucesso');
        this.buscarHistoricoDaApi();
      },
      error: (erro) => console.error('Erro ao concluir reparo:', erro)
    });

  }
      

  salvarReparo(): void {

    if (!this.descricao.trim()) {
      console.warn('Preencha a descrição do reparo');
      return;
    }

    if (this.indiceEdicao !== null) {
      const reparosAtualizados = [...this.dataSource.data];
      const indice = this.indiceEdicao;
      const reparoEditado = reparosAtualizados[indice];

      this.reparoService.atualizarDescricaoReparo(reparoEditado.id, this.descricao.trim()).subscribe({
        next: (reparoAtualizado) => {
          reparosAtualizados[indice] = reparoAtualizado;
          this.dataSource.data = reparosAtualizados;
          this.resetarFormulario();
        },
        error: (erro) => console.error('Erro ao atualizar descricao do reparo:', erro)
      });
      return;
    }

    if (!this.podeAdicionarReparo) {
      console.warn('Conclua o ultimo reparo antes de adicionar um novo');
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
        next: (reparoSalvo) => this.finalizarCadastroReparo(reparoSalvo),
        error: (erro) => console.error('Erro ao salvar reparo:', erro)
      });
      return;
    }

    this.finalizarCadastroReparo(novoReparo);
  }

  private finalizarCadastroReparo(novoReparo: ReparoHistorico): void {
    this.dataSource.data = [...this.dataSource.data, novoReparo];
    this.atualizarStatusDoacao('REPARO');
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

  private atualizarStatusDoacao(status: string): void {
    setTimeout(() => {
      this.statusDoacao = status;
    });
  }

}
