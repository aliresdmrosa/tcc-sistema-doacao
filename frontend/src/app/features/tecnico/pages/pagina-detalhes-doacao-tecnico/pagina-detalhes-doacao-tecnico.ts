import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { DoacaoDTO } from '../../../../core/dto/daocao.dto';
import { DoacaoService } from '../../../../core/services/doacao.service';
import { DialogBaseComponent } from '../../../../shared/dialogs/dialog-base/dialog-base';
import { ModalReprovacao } from './modal-reprovacao/modal-reprovacao';

@Component({
  selector: 'app-pagina-detalhes-doacao-tecnico',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './pagina-detalhes-doacao-tecnico.html',
  styleUrls: ['./pagina-detalhes-doacao-tecnico.css']
})

export class PaginaDetalhesDoacaoTecnico implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private doacaoService = inject(DoacaoService);

  idDoacao = this.route.snapshot.paramMap.get('id');
  doacao?: DoacaoDTO;
  imagens: string[] = [];
  tiposItens: string[] = [
    'COMPUTADOR',
    'NOTEBOOK',
    'MONITOR',
    'TECLADO',
    'MOUSE'
  ];

  form = this.fb.group({
    nome: [{ value: '', disabled: true }],
    cpf: [{ value: '', disabled: true }],
    equipamento: [{ value: '', disabled: true }],
    descricao: [{ value: '', disabled: true }],
    imagem: [{ value: '', disabled: true }],
    estadoConservacao: [{ value: '', disabled: true }]
  });

  ngOnInit(): void {
    this.carregarDoacaoDaApi();
  }

  get doacaoAprovada(): boolean {
    const status = this.doacao?.status?.toUpperCase();
    return status === 'APROVADA' || status === 'APROVADO';
  }

  carregarDoacaoDaApi(): void {
    this.doacaoService.doacaoId(Number(this.idDoacao)).subscribe({
      next: (doacao) => {
        this.doacao = doacao;
        this.form.patchValue({
          nome: doacao.nome ?? '',
          cpf: doacao.cpf ?? '',
          equipamento: doacao.equipamento ?? '',
          descricao: doacao.descricao ?? '',
  
          estadoConservacao: doacao.statusConservacao ?? ''
        });
        this.imagens = doacao.imagens?.map(
          imagem => `http://localhost:8080${imagem.url}`
        ) ?? [];
        console.log('Doacao carregada:', doacao);
      },
      error: (error) => {
        console.error('Erro ao carregar os detalhes da doacao:', error);
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/tecnico/doacoes']);
  }

  aprovar(): void {
    const dialogRef = this.dialog.open(DialogBaseComponent, {
      width: '420px',
      disableClose: true,
      data: {
        tipo: 'confirm',
        titulo: 'Aprovar doação?',
        mensagem: 'Confirme para alterar o status desta doação para aprovada.',
        textoConfirmar: 'Confirmar',
        textoCancelar: 'Cancelar',
        mostrarCancelar: true
      }
    });

    dialogRef.afterClosed().subscribe(confirmou => {
      if (confirmou && this.doacao) {
        console.log('Aprovar doacao:', this.doacao.id);

        this.doacaoService.aprovarDoacao(this.doacao.id, '').subscribe({
          next: () => {
            console.log('Doacao aprovada com sucesso');
            this.router.navigate(['/tecnico/doacoes']);
          },
          error: (error) => {
            console.error('Erro ao aprovar a doacao:', error);
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
        console.log('Reprovar doacao:', this.doacao.id, justificativa);
        this.doacaoService.reprovarDoacao(this.doacao.id, justificativa).subscribe({
          next: () => {
            console.log('Doacao reprovada com sucesso');
            this.router.navigate(['/tecnico/doacoes']);
          },
          error: (error) => {
            console.error('Erro ao reprovar a doacao:', error);
          }
        });
      }
    });
  }

  enviarParaReparo(): void {
    if (!this.doacaoAprovada) {
      return;
    }

    console.log('Enviar para reparo:', this.doacao?.id);
    this.router.navigate(['/tecnico/doacoes', this.doacao?.id, 'reparo']);
  }
  obterClasseStatus(status?: string): string {
    switch (status?.toUpperCase()) {
      case 'APROVADA':
      case 'APROVADO':
        return 'status-aprovado';
      case 'REPROVADA':
      case 'REPROVADO':
        return 'status-reprovado';
      case 'REPARO':
      case 'EM_ANALISE':
        return 'status-analise';
      case 'PENDENTE':
        return 'status-pendente';
      case 'EM_ESTOQUE':
      case 'VINCULADA':
      case 'DOADO':
        return 'status-entregue';
      default:
        return 'status-default';
    }
  }

  obterTextoStatus(status?: string): string {
    switch (status?.toUpperCase()) {
      case 'APROVADA':
      case 'APROVADO':
        return 'Aprovada';
      case 'REPROVADA':
      case 'REPROVADO':
        return 'Reprovada';
      case 'REPARO':
        return 'Reparo';
      case 'EM_ANALISE':
        return 'Em análise';
      case 'PENDENTE':
        return 'Pendente';
      case 'EM_ESTOQUE':
        return 'Em estoque';
      case 'VINCULADA':
        return 'Vinculada';
      case 'DOADO':
        return 'Doado';
      default:
        return status ?? 'Status desconhecido';
    }
  }
}
