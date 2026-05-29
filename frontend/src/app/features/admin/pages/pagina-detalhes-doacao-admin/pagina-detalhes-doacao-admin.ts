import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DialogBaseComponent } from '../../../../shared/dialogs/dialog-base/dialog-base';

type StatusAnalise = 'PENDENTE' | 'EM_ANALISE' | 'APROVADA' | 'REPROVADA';

interface DetalhesDoacaoAdmin {
  id: string;
  nomeDoador: string;
  cpf: string;
  tipoItem: string;
  descricao: string;
  imagem: string;
  estadoConservacao: string;
  status: StatusAnalise;
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
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './pagina-detalhes-doacao-admin.html',
  styleUrls: ['./pagina-detalhes-doacao-admin.css']
})
export class PaginaDetalhesDoacaoAdmin {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  idDoacao = this.route.snapshot.paramMap.get('id');
  modoEdicao = false;
  private dadosAntesDaEdicao?: DetalhesDoacaoAdmin;

  // mock
  doacao: DetalhesDoacaoAdmin = {
    id: this.idDoacao ?? '1',
    nomeDoador: 'Vitoria Lais Souza',
    cpf: '000.000.000-00',
    tipoItem: 'Computador',
    descricao: 'Ex tela quebrada',
    imagem: 'Aqui ficam as imagens a serem analisadas',
    estadoConservacao: 'USADO',
    status: 'PENDENTE',
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

  get podeMarcarEmAnalise(): boolean {
    return this.doacao.status === 'PENDENTE';
  }

  get podeConcluirAnalise(): boolean {
    return this.doacao.status === 'PENDENTE' || this.doacao.status === 'EM_ANALISE';
  }

  get podeReabrirAnalise(): boolean {
    return this.doacao.status === 'APROVADA' || this.doacao.status === 'REPROVADA';
  }

  // depois, chamada api
  carregarDoacaoDaApi(): void {
  }

  voltar(): void {
    const voltarPara = this.route.snapshot.queryParamMap.get('voltarPara');

    if (voltarPara?.startsWith('/admin/')) {
      this.router.navigateByUrl(voltarPara);
      return;
    }

    this.router.navigate(['/admin/doacoes']);
  }

  verPerfil(): void {
    this.router.navigate(['/admin/usuarios', this.doacao.id]);
  }

  editar(): void {
    this.dadosAntesDaEdicao = { ...this.doacao };
    this.modoEdicao = true;
    this.form.enable();
  }

  salvarEdicao(): void {
    const dados = this.form.getRawValue();

    this.doacao = {
      ...this.doacao,
      nomeDoador: dados.nomeDoador ?? '',
      cpf: dados.cpf ?? '',
      tipoItem: dados.tipoItem ?? '',
      descricao: dados.descricao ?? '',
      imagem: dados.imagem ?? '',
      estadoConservacao: dados.estadoConservacao ?? '',
      dataUltimaModificacao: this.obterDataAtual()
    };

    this.modoEdicao = false;
    this.form.disable();
    this.snackBar.open('Doacao atualizada com sucesso!', 'Fechar', { duration: 3000 });
  }

  cancelarEdicao(): void {
    if (this.dadosAntesDaEdicao) {
      this.doacao = { ...this.dadosAntesDaEdicao };
      this.preencherFormulario();
    }

    this.modoEdicao = false;
    this.form.disable();
  }

  marcarEmAnalise(): void {
    if (!this.podeMarcarEmAnalise) {
      this.snackBar.open('A doacao so pode ser marcada em analise quando esta pendente.', 'Fechar', {
        duration: 3500
      });
      return;
    }

    this.alterarStatus('EM_ANALISE', 'Doacao marcada como em analise.');
  }

  aprovar(): void {
    this.confirmarAlteracaoStatus(
      'Aprovar doacao?',
      'Confirme para alterar o status desta doacao para aprovada.',
      'APROVADA',
      'Doacao aprovada com sucesso!'
    );
  }

  reprovar(): void {
    this.confirmarAlteracaoStatus(
      'Reprovar doacao?',
      'Confirme para alterar o status desta doacao para reprovada.',
      'REPROVADA',
      'Doacao reprovada com sucesso!'
    );
  }

  reabrirAnalise(): void {
    if (!this.podeReabrirAnalise) {
      this.snackBar.open('A analise so pode ser reaberta quando a doacao esta aprovada ou reprovada.', 'Fechar', {
        duration: 3500
      });
      return;
    }

    const dialogRef = this.dialog.open(DialogBaseComponent, {
      width: '420px',
      disableClose: true,
      data: {
        tipo: 'confirm',
        titulo: 'Reabrir analise?',
        mensagem: 'Confirme para voltar esta doacao para em analise.',
        textoConfirmar: 'Confirmar',
        textoCancelar: 'Cancelar',
        mostrarCancelar: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmou) => {
      if (!confirmou) {
        return;
      }

      this.doacao = {
        ...this.doacao,
        status: 'EM_ANALISE',
        dataUltimaModificacao: this.obterDataAtual()
      };

      this.preencherFormulario();
      this.snackBar.open('Analise reaberta com sucesso!', 'Fechar', { duration: 3000 });
    });
  }

  deletar(): void {
    const dialogRef = this.dialog.open(DialogBaseComponent, {
      width: '420px',
      disableClose: true,
      data: {
        tipo: 'confirm',
        titulo: 'Deseja excluir esta doacao?',
        mensagem: 'Essa acao sera permanente.',
        textoConfirmar: 'Confirmar',
        textoCancelar: 'Cancelar',
        mostrarCancelar: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmou) => {
      if (!confirmou) {
        return;
      }

      this.snackBar.open('Doacao excluida com sucesso!', 'Fechar', { duration: 3000 });
      this.voltar();
    });
  }

  obterClasseStatus(status: string): string {
    switch (status?.toUpperCase()) {
      case 'APROVADA':
      case 'APROVADO':
        return 'status-aprovado';
      case 'REPROVADA':
      case 'REPROVADO':
        return 'status-reprovado';
      case 'EM_ANALISE':
        return 'status-analise';
      case 'PENDENTE':
        return 'status-pendente';
      default:
        return 'status-default';
    }
  }

  obterTextoStatus(status: string): string {
    switch (status?.toUpperCase()) {
      case 'APROVADA':
        return 'Aprovada';
      case 'REPROVADA':
        return 'Reprovada';
      case 'EM_ANALISE':
        return 'Em analise';
      case 'PENDENTE':
        return 'Pendente';
      default:
        return status;
    }
  }

  private alterarStatus(status: StatusAnalise, mensagem: string): void {
    if (!this.podeConcluirAnalise) {
      this.snackBar.open('Esta acao so pode ser feita quando a doacao esta pendente ou em analise.', 'Fechar', {
        duration: 3500
      });
      return;
    }

    this.doacao = {
      ...this.doacao,
      status,
      dataUltimaModificacao: this.obterDataAtual()
    };

    this.preencherFormulario();
    this.snackBar.open(mensagem, 'Fechar', { duration: 3000 });
  }

  private confirmarAlteracaoStatus(
    titulo: string,
    mensagem: string,
    status: StatusAnalise,
    mensagemSucesso: string
  ): void {
    if (!this.podeConcluirAnalise) {
      this.snackBar.open('Esta acao so pode ser feita quando a doacao esta pendente ou em analise.', 'Fechar', {
        duration: 3500
      });
      return;
    }

    const dialogRef = this.dialog.open(DialogBaseComponent, {
      width: '420px',
      disableClose: true,
      data: {
        tipo: 'confirm',
        titulo,
        mensagem,
        textoConfirmar: 'Confirmar',
        textoCancelar: 'Cancelar',
        mostrarCancelar: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmou) => {
      if (!confirmou) {
        return;
      }

      this.alterarStatus(status, mensagemSucesso);
    });
  }

  private preencherFormulario(): void {
    this.form.patchValue({
      nomeDoador: this.doacao.nomeDoador,
      cpf: this.doacao.cpf,
      tipoItem: this.doacao.tipoItem,
      descricao: this.doacao.descricao,
      imagem: this.doacao.imagem,
      estadoConservacao: this.doacao.estadoConservacao
    });
  }

  private obterDataAtual(): string {
    return new Date().toLocaleDateString('pt-BR');
  }
}
