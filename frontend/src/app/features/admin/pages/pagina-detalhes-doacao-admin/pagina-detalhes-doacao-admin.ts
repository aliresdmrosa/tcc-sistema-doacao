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
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DialogBaseComponent } from '../../../../shared/dialogs/dialog-base/dialog-base';

type StatusAnalise = 'PENDENTE' | 'REPARO' | 'APROVADA' | 'REPROVADA' | 'EM_ESTOQUE' | 'VINCULADA' | 'DOADO';

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
    MatSelectModule,
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
  tiposItens: string[] = [
    'COMPUTADOR',
    'NOTEBOOK',
    'MONITOR',
    'TECLADO',
    'MOUSE'
  ];

  // mock
  doacao: DetalhesDoacaoAdmin = {
    id: this.idDoacao ?? '1',
    nomeDoador: 'Vitoria Lais Souza',
    cpf: '000.000.000-00',
    tipoItem: 'COMPUTADOR',
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

  get podeMarcarReparo(): boolean {
    return this.doacao.status === 'PENDENTE';
  }

  get podeConcluirAnalise(): boolean {
    return this.doacao.status === 'PENDENTE' || this.doacao.status === 'REPARO';
  }

  get podeReabrirAnalise(): boolean {
    return this.doacao.status !== 'PENDENTE';
  }

  get podeMarcarEmEstoque(): boolean {
    return this.doacao.status === 'APROVADA';
  }

  get imagemUrl(): string | null {
    const imagem = this.doacao.imagem?.trim();

    if (!imagem || !/^https?:\/\//.test(imagem) && !imagem.startsWith('/')) {
      return null;
    }

    return imagem.startsWith('/') ? `http://localhost:8080${imagem}` : imagem;
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
    this.snackBar.open('Doação atualizada com sucesso!', 'Fechar', { duration: 3000 });
  }

  cancelarEdicao(): void {
    if (this.dadosAntesDaEdicao) {
      this.doacao = { ...this.dadosAntesDaEdicao };
      this.preencherFormulario();
    }

    this.modoEdicao = false;
    this.form.disable();
  }

  marcarReparo(): void {
    if (!this.podeMarcarReparo) {
      this.snackBar.open('A doação só pode ser marcada como reparo quando está pendente.', 'Fechar', {
        duration: 3500
      });
      return;
    }

    this.alterarStatus('REPARO', 'Doação marcada como reparo.');
  }

  marcarEmEstoque(): void {
    if (!this.podeMarcarEmEstoque) {
      this.snackBar.open('A doação só pode ir para estoque depois de aprovada.', 'Fechar', {
        duration: 3500
      });
      return;
    }

    const dialogRef = this.dialog.open(DialogBaseComponent, {
      width: '420px',
      disableClose: true,
      data: {
        tipo: 'confirm',
        titulo: 'Mover para estoque?',
        mensagem: 'Confirme que o equipamento foi recebido e está disponível em estoque.',
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
        status: 'EM_ESTOQUE',
        dataUltimaModificacao: this.obterDataAtual()
      };

      this.preencherFormulario();
      this.snackBar.open('Doação marcada como em estoque!', 'Fechar', { duration: 3000 });
      this.router.navigate(['/admin/atribuir-equipamento'], {
        queryParams: {
          doacaoId: this.doacao.id,
          tipo: this.doacao.tipoItem
        },
        state: {
          doacao: this.doacao
        }
      });
    });
  }

  aprovar(): void {
    this.confirmarAlteracaoStatus(
      'Aprovar doação?',
      'Confirme para alterar o status desta doação para aprovada.',
      'APROVADA',
      'Doação aprovada com sucesso!'
    );
  }

  reprovar(): void {
    this.confirmarAlteracaoStatus(
      'Reprovar doação?',
      'Confirme para alterar o status desta doação para reprovada.',
      'REPROVADA',
      'Doação reprovada com sucesso!'
    );
  }

  reabrirAnalise(): void {
    if (!this.podeReabrirAnalise) {
      this.snackBar.open('A análise só pode ser reaberta quando a doação não está pendente.', 'Fechar', {
        duration: 3500
      });
      return;
    }

    const dialogRef = this.dialog.open(DialogBaseComponent, {
      width: '420px',
      disableClose: true,
      data: {
        tipo: 'confirm',
        titulo: 'Reabrir análise?',
        mensagem: 'Confirme para voltar esta doação para pendente.',
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
        status: 'PENDENTE',
        dataUltimaModificacao: this.obterDataAtual()
      };

      this.preencherFormulario();
      this.snackBar.open('Análise reaberta com sucesso!', 'Fechar', { duration: 3000 });
    });
  }

  deletar(): void {
    const dialogRef = this.dialog.open(DialogBaseComponent, {
      width: '420px',
      disableClose: true,
      data: {
        tipo: 'confirm',
        titulo: 'Deseja excluir esta doação?',
        mensagem: 'Essa ação será permanente.',
        textoConfirmar: 'Confirmar',
        textoCancelar: 'Cancelar',
        mostrarCancelar: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmou) => {
      if (!confirmou) {
        return;
      }

      this.snackBar.open('Doação excluída com sucesso!', 'Fechar', { duration: 3000 });
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
      case 'REPARO':
        return 'status-analise';
      case 'EM_ESTOQUE':
      case 'VINCULADA':
      case 'DOADO':
        return 'status-entregue';
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
      case 'REPARO':
        return 'Reparo';
      case 'EM_ESTOQUE':
        return 'Em estoque';
      case 'VINCULADA':
        return 'Vinculada';
      case 'DOADO':
        return 'Doado';
      case 'PENDENTE':
        return 'Pendente';
      default:
        return status;
    }
  }

  private alterarStatus(status: StatusAnalise, mensagem: string): void {
    if (!this.podeConcluirAnalise) {
      this.snackBar.open('Esta ação só pode ser feita quando a doação está pendente ou em reparo.', 'Fechar', {
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
      this.snackBar.open('Esta ação só pode ser feita quando a doação está pendente ou em reparo.', 'Fechar', {
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
