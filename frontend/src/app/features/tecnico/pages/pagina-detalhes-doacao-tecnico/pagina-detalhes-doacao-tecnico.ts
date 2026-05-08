import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { ModalAprovacao } from './modal-aprovacao/modal-aprovacao';
import { ModalReprovacao } from './modal-reprovacao/modal-reprovacao';

interface DetalhesDoacaoTecnico {
  id: string;
  nome: string;
  cpf: string;
  equipamento: string;
  quantidade: number;
  descricao: string;
  imagem: string;
  estadoConservacao: string;
  dataCadastro: string;
  dataUltimaModificacao: string;
}

@Component({
  selector: 'app-pagina-detalhes-doacao-tecnico',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatRadioModule, MatButtonModule,
    MatIconModule, MatDialogModule ],
  templateUrl: './pagina-detalhes-doacao-tecnico.html',
  styleUrls: ['./pagina-detalhes-doacao-tecnico.css']
})
export class PaginaDetalhesDoacaoTecnico {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);

  idDoacao = this.route.snapshot.paramMap.get('id');

  // mock
  doacao: DetalhesDoacaoTecnico = {
    id: this.idDoacao ?? '1',
    nome: 'Vitória Laís Souza',
    cpf: '000.000.000-00',
    equipamento: 'Computador',
    quantidade: 1,
    descricao: 'Minha doação foi reprovada pela IA, porém está em bom estado. Solicito análise do técnico.',
    imagem: '',
    estadoConservacao: 'USADO',
    dataCadastro: '04/10/2022',
    dataUltimaModificacao: '05/10/2022'
  };

  form = this.fb.group({
    nome: [{ value: this.doacao.nome, disabled: true }],
    cpf: [{ value: this.doacao.cpf, disabled: true }],
    equipamento: [{ value: this.doacao.equipamento, disabled: true }],
    quantidade: [{ value: this.doacao.quantidade, disabled: true }],
    descricao: [{ value: this.doacao.descricao, disabled: true }],
    imagem: [{ value: this.doacao.imagem, disabled: true }],
    estadoConservacao: [{ value: this.doacao.estadoConservacao, disabled: true }]
  });

  // depois, chamada api
  carregarDoacaoDaApi(): void {
  }

  voltar(): void {
    this.router.navigate(['/tecnico/doacoes']);
  }

  aprovar(): void {
    const dialogRef = this.dialog.open(ModalAprovacao, {
      width: '520px'
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        console.log('Aprovar doação:', this.doacao.id, resultado);

        // chamada api para aprovar
      }
    });
  }

  reprovar(): void {
    const dialogRef = this.dialog.open(ModalReprovacao, {
      width: '520px'
    });

    dialogRef.afterClosed().subscribe(justificativa => {
      if (justificativa) {
        console.log('Reprovar doação:', this.doacao.id, justificativa);

        // chamada api para reprovar
      }
    });
  }

  enviarParaReparo(): void {
    console.log('Enviar para reparo:', this.doacao.id);

    // chamada api para marcar como reparo

    this.router.navigate(['/tecnico/doacoes', this.doacao.id, 'reparo']);
  }
}