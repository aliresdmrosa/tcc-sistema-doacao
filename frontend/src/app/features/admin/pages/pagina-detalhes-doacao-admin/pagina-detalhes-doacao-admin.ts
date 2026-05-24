import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatMenuModule } from '@angular/material/menu';

interface DetalhesDoacaoAdmin {
  id: string;
  nomeDoador: string;
  cpf: string;
  tipoItem: string;
  descricao: string;
  imagem: string;
  estadoConservacao: string;
  dataCadastro: string;
  dataUltimaModificacao: string;
}

@Component({
  selector: 'app-pagina-detalhes-doacao-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  templateUrl: './pagina-detalhes-doacao-admin.html',
  styleUrls: ['./pagina-detalhes-doacao-admin.css']
})
export class PaginaDetalhesDoacaoAdmin {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  idDoacao = this.route.snapshot.paramMap.get('id');

  // mock
  doacao: DetalhesDoacaoAdmin = {
    id: this.idDoacao ?? '1',
    nomeDoador: 'Vitória Laís Souza',
    cpf: '000.000.000-00',
    tipoItem: 'Computador',
    descricao: 'Ex tela quebrada',
    imagem: 'Aqui ficam as imagens a serem analisadas',
    estadoConservacao: 'USADO',
    dataCadastro: '04/10/2022',
    dataUltimaModificacao: '05/10/2022'
  };

  form = this.fb.group({
    nomeDoador: [{ value: this.doacao.nomeDoador, disabled: true }],
    cpf: [{ value: this.doacao.cpf, disabled: true }],
    tipoItem: [{ value: this.doacao.tipoItem, disabled: true }],
    descricao: [{ value: this.doacao.descricao, disabled: true }],
    imagem: [{ value: this.doacao.imagem, disabled: true }],
    estadoConservacao: [{ value: this.doacao.estadoConservacao, disabled: true }]
  });

  // depois, chamada api
  carregarDoacaoDaApi(): void {
  }

  voltar(): void {
    this.router.navigate(['/admin/doacoes']);
  }

  verPerfil(): void {
    this.router.navigate(['/admin/usuarios', this.doacao.id]);
  }

  editar(): void {
    console.log('Editar doação:', this.doacao.id);

    // depois, navegar para tela de edição
    // this.router.navigate(['/admin/doacoes/editar', this.doacao.id]);
  }

  aprovar(): void {
    console.log('Aprovar doação:', this.doacao.id);

    // chamada api para aprovar
  }

  reprovar(): void {
    console.log('Reprovar doação:', this.doacao.id);

    // chamada api para reprovar
  }

  deletar(): void {
    console.log('Deletar doação:', this.doacao.id);

    // chamada api para deletar
  }
}
