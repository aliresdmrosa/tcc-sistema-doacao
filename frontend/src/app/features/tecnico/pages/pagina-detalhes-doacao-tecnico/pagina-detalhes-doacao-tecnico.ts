import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
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
import { DoacaoService } from '../../../../core/services/doacao.service';
import { DoacaoDTO } from '../../../../core/dto/daocao.dto';

interface DetalhesDoacaoTecnico {
  id: string;
  nome: string;
  cpf: string;
  equipamento: string;
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
export class PaginaDetalhesDoacaoTecnico implements OnInit {
  ngOnInit(): void {
    this.carregarDoacaoDaApi();
  }

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private doacaoService = inject(DoacaoService);

  idDoacao = this.route.snapshot.paramMap.get('id');

  doacao ?: DoacaoDTO;


  form = this.fb.group({
    nome: [{ value: this.doacao?.nome, disabled: true }],
    cpf: [{ value: this.doacao?.cpf, disabled: true }],
    equipamento: [{ value: this.doacao?.equipamento, disabled: true }],
    quantidade: [{ value: this.doacao?.quantidade, disabled: true }],
    descricao: [{ value: this.doacao?.descricao, disabled: true }],
    imagem: [{ value: "http://localhost:8080" + this.doacao?.url, disabled: true }],
    estadoConservacao: [{ value: this.doacao?.statusConservacao, disabled: true }]
  });

  // depois, chamada api
  carregarDoacaoDaApi(): void {
    this.doacaoService.listarDoacoesReverReparoPorId(Number(this.idDoacao)).subscribe({
      next: (doacao) => {
        this.doacao = doacao;
        this.form.patchValue(doacao);
        console.log('Doação carregada:', doacao);
      },
      error: (error) => {
        console.error('Erro ao carregar os detalhes da doação:', error);
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/tecnico/doacoes']);
  }

  aprovar(): void {
    const dialogRef = this.dialog.open(ModalAprovacao, {
      width: '520px'
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado && this.doacao) {
        console.log('Aprovar doação:', this.doacao.id, resultado);

        this.doacaoService.aprovarDoacao(this.doacao.id, resultado.justificativa).subscribe({
          next: () => {
            console.log('Doação aprovada com sucesso');
            this.router.navigate(['/tecnico/doacoes']);
          },
          error: (error) => {
            console.error('Erro ao aprovar a doação:', error);
          }
        });
      }
    });
  }

  reprovar(): void {
    const dialogRef = this.dialog.open(ModalReprovacao, {
      width: '520px'
    });

    dialogRef.afterClosed().subscribe(justificativa => {
      if (justificativa && this.doacao) {
        console.log('Reprovar doação:', this.doacao.id, justificativa);
        this.doacaoService.reprovarDoacao(this.doacao.id, justificativa).subscribe({
          next: () => {
            console.log('Doação reprovada com sucesso');
            this.router.navigate(['/tecnico/doacoes']);
          },
          error: (error) => {
            console.error('Erro ao reprovar a doação:', error);
          }
        });
      }
    });
  }

  enviarParaReparo(): void {
    console.log('Enviar para reparo:', this.doacao?.id);

    // chamada api para marcar como reparo

    this.router.navigate(['/tecnico/doacoes', this.doacao?.id, 'reparo']);
  }
}
