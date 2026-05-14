import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';

interface DetalhesSolicitacaoAdmin {
  id: string;
  nome: string;
  grr: string;
  curso: string;
  dataCadastro: string;
  equipamentoSolicitado: string;
  justificativa: string;
  declaracaoComputador: boolean;
  declaracaoMatricula: boolean;
}

@Component({
  selector: 'app-pagina-detalhes-solicitacao-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatCheckboxModule
  ],
  templateUrl: './pagina-detalhes-solicitacao-admin.html',
  styleUrls: ['./pagina-detalhes-solicitacao-admin.css']
})
export class PaginaDetalhesSolicitacaoAdmin {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  idSolicitacao = this.route.snapshot.paramMap.get('id');

  // mock
  solicitacao: DetalhesSolicitacaoAdmin = {
    id: this.idSolicitacao ?? '1',
    nome: 'Maria da Luz',
    grr: '20202020',
    curso: 'Análise e Desenvolvimento de Sistemas',
    dataCadastro: '01/05/2025',
    equipamentoSolicitado: 'Computador',
    justificativa: 'Sou estudante de Análise de Sistemas por motivos econômicos não consigo obter computador para estudo, gostaria de participar do programa de doação.',
    declaracaoComputador: true,
    declaracaoMatricula: true
  };

  form = this.fb.group({
    nome: [{ value: this.solicitacao.nome, disabled: true }],
    grr: [{ value: this.solicitacao.grr, disabled: true }],
    curso: [{ value: this.solicitacao.curso, disabled: true }],
    dataCadastro: [{ value: this.solicitacao.dataCadastro, disabled: true }],
    equipamentoSolicitado: [{ value: this.solicitacao.equipamentoSolicitado, disabled: true }],
    justificativa: [{ value: this.solicitacao.justificativa, disabled: true }],
    declaracaoComputador: [{ value: this.solicitacao.declaracaoComputador, disabled: true }],
    declaracaoMatricula: [{ value: this.solicitacao.declaracaoMatricula, disabled: true }]
  });

  // chamada api
  carregarSolicitacaoDaApi(): void {
  }

  voltar(): void {
    this.router.navigate(['/admin/solicitacoes']);
  }

  editar(): void {
    console.log('Editar solicitação:', this.solicitacao.id);

    // depois, navegar para tela de edição
    // this.router.navigate(['/admin/solicitacoes/editar', this.solicitacao.id]);
  }

  aprovar(): void {
    console.log('Aprovar solicitação:', this.solicitacao.id);

    // chamada api para aprovar
  }

  reprovar(): void {
    console.log('Reprovar solicitação:', this.solicitacao.id);

    // chamada api para reprovar
  }

  deletar(): void {
    console.log('Deletar solicitação:', this.solicitacao.id);

    // chamada api para deletar
  }
}