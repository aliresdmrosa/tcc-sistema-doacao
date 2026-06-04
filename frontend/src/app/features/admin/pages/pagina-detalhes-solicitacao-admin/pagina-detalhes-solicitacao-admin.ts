import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DialogBaseComponent } from '../../../../shared/dialogs/dialog-base/dialog-base';
import { CURSOS } from '../../../../shared/utils/form-validations';

type StatusAnalise = 'PENDENTE' | 'APROVADA' | 'REPROVADA' | 'VINCULADA' | 'DOADO';

interface DetalhesSolicitacaoAdmin {
  id: string;
  nome: string;
  grr: string;
  curso: string;
  status: StatusAnalise;
  dataCadastro: string;
  dataUltimaModificacao: string;
  equipamentoSolicitado: string;
  justificativa: string;
  declaracaoComputador: boolean;
  declaracaoMatricula: boolean;
}

interface EquipamentoAtribuido {
  id: string;
  nome: string;
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
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './pagina-detalhes-solicitacao-admin.html',
  styleUrls: ['./pagina-detalhes-solicitacao-admin.css']
})
export class PaginaDetalhesSolicitacaoAdmin {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  idSolicitacao = this.route.snapshot.paramMap.get('id');
  modoEdicao = false;
  equipamentoAtribuido: EquipamentoAtribuido | null = this.buscarEquipamentoAtribuido();
  private dadosAntesDaEdicao?: DetalhesSolicitacaoAdmin;
  cursos = CURSOS;
  tiposEquipamento = [
    { valor: 'COMPUTADOR', label: 'Computador' },
    { valor: 'NOTEBOOK', label: 'Notebook' },
    { valor: 'MONITOR', label: 'Monitor' },
    { valor: 'TECLADO', label: 'Teclado' },
    { valor: 'MOUSE', label: 'Mouse' }
  ];

  // mock
  solicitacao: DetalhesSolicitacaoAdmin = {
    id: this.idSolicitacao ?? '1',
    nome: 'Maria da Luz',
    grr: '20202020',
    curso: 'TADS',
    status: this.buscarStatusSolicitacao() ?? 'PENDENTE',
    dataCadastro: '01/05/2025',
    dataUltimaModificacao: '01/05/2025',
    equipamentoSolicitado: 'COMPUTADOR',
    justificativa: 'Sou estudante de Análise de Sistemas por motivos econômicos não consigo obter computador para estudo, gostaria de participar do programa de doação.',
    declaracaoComputador: true,
    declaracaoMatricula: true
  };

  form = this.fb.group({
    nome: [{ value: this.solicitacao.nome, disabled: true }],
    grr: [{ value: this.solicitacao.grr, disabled: true }],
    curso: [{ value: this.solicitacao.curso, disabled: true }],
    equipamentoSolicitado: [{ value: this.solicitacao.equipamentoSolicitado, disabled: true }],
    justificativa: [{ value: this.solicitacao.justificativa, disabled: true }],
    declaracaoComputador: [{ value: this.solicitacao.declaracaoComputador, disabled: true }],
    declaracaoMatricula: [{ value: this.solicitacao.declaracaoMatricula, disabled: true }]
  });

  get podeConcluirAnalise(): boolean {
    return this.solicitacao.status === 'PENDENTE';
  }

  get podeReabrirAnalise(): boolean {
    return this.solicitacao.status !== 'PENDENTE';
  }

  // chamada api
  carregarSolicitacaoDaApi(): void {
  }

  voltar(): void {
    const voltarPara = this.route.snapshot.queryParamMap.get('voltarPara');

    if (voltarPara?.startsWith('/admin/')) {
      this.router.navigateByUrl(voltarPara);
      return;
    }

    this.router.navigate(['/admin/solicitacoes']);
  }

  editar(): void {
    this.dadosAntesDaEdicao = { ...this.solicitacao };
    this.modoEdicao = true;
    this.form.enable();
  }

  salvarEdicao(): void {
    const dados = this.form.getRawValue();

    this.solicitacao = {
      ...this.solicitacao,
      nome: dados.nome ?? '',
      grr: dados.grr ?? '',
      curso: dados.curso ?? '',
      dataUltimaModificacao: this.obterDataAtual(),
      equipamentoSolicitado: dados.equipamentoSolicitado ?? '',
      justificativa: dados.justificativa ?? '',
      declaracaoComputador: !!dados.declaracaoComputador,
      declaracaoMatricula: !!dados.declaracaoMatricula
    };

    this.modoEdicao = false;
    this.form.disable();
    this.snackBar.open('Solicitação atualizada com sucesso!', 'Fechar', { duration: 3000 });
  }

  cancelarEdicao(): void {
    if (this.dadosAntesDaEdicao) {
      this.solicitacao = { ...this.dadosAntesDaEdicao };
      this.preencherFormulario();
    }

    this.modoEdicao = false;
    this.form.disable();
  }

  aprovar(): void {
    if (!this.podeConcluirAnalise) {
      this.snackBar.open('Esta ação só pode ser feita quando a solicitação está pendente.', 'Fechar', {
        duration: 3500
      });
      return;
    }

    const dialogRef = this.dialog.open(DialogBaseComponent, {
      width: '420px',
      disableClose: true,
      data: {
        tipo: 'confirm',
        titulo: 'Aprovar solicitação?',
        mensagem: 'Confirme para alterar o status desta solicitação para aprovada.',
        textoConfirmar: 'Confirmar',
        textoCancelar: 'Cancelar',
        mostrarCancelar: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmou) => {
      if (!confirmou) {
        return;
      }

      this.solicitacao = {
        ...this.solicitacao,
        status: 'APROVADA',
        dataUltimaModificacao: this.obterDataAtual()
      };

      this.preencherFormulario();
      this.snackBar.open('Solicitação aprovada com sucesso!', 'Fechar', { duration: 3000 });
      this.atribuirEquipamento();
    });
  }

  reprovar(): void {
    this.confirmarAlteracaoStatus(
      'Reprovar solicitação?',
      'Confirme para alterar o status desta solicitação para reprovada.',
      'REPROVADA',
      'Solicitação reprovada com sucesso!'
    );
  }

  reabrirAnalise(): void {
    if (!this.podeReabrirAnalise) {
      this.snackBar.open('A análise só pode ser reaberta quando a solicitação não está pendente.', 'Fechar', {
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
        mensagem: 'Confirme para voltar esta solicitação para pendente.',
        textoConfirmar: 'Confirmar',
        textoCancelar: 'Cancelar',
        mostrarCancelar: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmou) => {
      if (!confirmou) {
        return;
      }

      this.solicitacao = {
        ...this.solicitacao,
        status: 'PENDENTE',
        dataUltimaModificacao: this.obterDataAtual()
      };
      this.limparEquipamentoAtribuido();

      this.preencherFormulario();
      this.snackBar.open('Análise reaberta com sucesso!', 'Fechar', { duration: 3000 });
    });
  }

  atribuirEquipamento(): void {
    this.router.navigate(['/admin/atribuir-equipamento'], {
      queryParams: {
        solicitacaoId: this.solicitacao.id
      }
    });
  }

  deletar(): void {
    const dialogRef = this.dialog.open(DialogBaseComponent, {
      width: '420px',
      disableClose: true,
      data: {
        tipo: 'confirm',
        titulo: 'Deseja excluir esta solicitação?',
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

      this.snackBar.open('Solicitação excluída com sucesso!', 'Fechar', { duration: 3000 });
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
      case 'PENDENTE':
        return 'status-pendente';
      case 'VINCULADA':
      case 'DOADO':
        return 'status-entregue';
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
      this.snackBar.open('Esta ação só pode ser feita quando a solicitação está pendente.', 'Fechar', {
        duration: 3500
      });
      return;
    }

    this.solicitacao = {
      ...this.solicitacao,
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
      this.snackBar.open('Esta ação só pode ser feita quando a solicitação está pendente.', 'Fechar', {
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
      nome: this.solicitacao.nome,
      grr: this.solicitacao.grr,
      curso: this.solicitacao.curso,
      equipamentoSolicitado: this.solicitacao.equipamentoSolicitado,
      justificativa: this.solicitacao.justificativa,
      declaracaoComputador: this.solicitacao.declaracaoComputador,
      declaracaoMatricula: this.solicitacao.declaracaoMatricula
    });
  }

  private buscarEquipamentoAtribuido(): EquipamentoAtribuido | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const id = this.idSolicitacao ?? '1';
    const dados = localStorage.getItem(`solicitacao:${id}:equipamentoAtribuido`);

    if (!dados) {
      return null;
    }

    try {
      return JSON.parse(dados) as EquipamentoAtribuido;
    } catch {
      return null;
    }
  }

  private limparEquipamentoAtribuido(): void {
    this.equipamentoAtribuido = null;

    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.removeItem(`solicitacao:${this.solicitacao.id}:equipamentoAtribuido`);
  }

  private buscarStatusSolicitacao(): StatusAnalise | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const id = this.idSolicitacao ?? '1';
    const status = localStorage.getItem(`solicitacao:${id}:status`) as StatusAnalise | null;

    return status;
  }

  private obterDataAtual(): string {
    return new Date().toLocaleDateString('pt-BR');
  }
}
