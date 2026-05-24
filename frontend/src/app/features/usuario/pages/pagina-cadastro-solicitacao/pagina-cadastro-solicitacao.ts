import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SolicitacaoDTO } from '../../../../core/dto/solicitacao.dto';
import { SolicitacaoService } from '../../../../core/services/solicitacao.service';
import { DialogBaseComponent } from '../../../../shared/dialogs/dialog-base/dialog-base';

@Component({
  selector: 'app-pagina-cadastro-solicitacao',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './pagina-cadastro-solicitacao.html',
  styleUrl: './pagina-cadastro-solicitacao.css'
})
export class PaginaCadastroSolicitacao {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private solicitacaoService = inject(SolicitacaoService);
  private dialog = inject(MatDialog);

  tiposEquipamento = [
    { valor: 'COMPUTADOR', label: 'Computador' },
    { valor: 'NOTEBOOK', label: 'Notebook' },
    { valor: 'MONITOR', label: 'Monitor' },
    { valor: 'TECLADO', label: 'Teclado' },
    { valor: 'MOUSE', label: 'Mouse' }
  ];

  form = this.fb.group({
    equipamento: ['', Validators.required],
    curso: ['', Validators.required],
    grr: ['', Validators.required],
    motivo: ['', [Validators.required, Validators.minLength(10)]],
    semComputador: [false, Validators.requiredTrue],
    matriculaAtiva: [false, Validators.requiredTrue]
  });

  voltar(): void {
    this.router.navigate(['/usuario/listar-solicitacoes']);
  }

  cadastrar(formDirective: FormGroupDirective): void {
    const dados: SolicitacaoDTO = {
      equipamento: this.form.value.equipamento!,
      curso: this.form.value.curso!,
      grr: this.form.value.grr!,
      motivo: this.form.value.motivo!,
      semComputador: this.form.value.semComputador!,
      ativo: this.form.value.matriculaAtiva!
    };

    this.solicitacaoService.cadastrarSolicitacao(dados).subscribe({
      next: () => {
        this.dialog.open(DialogBaseComponent, {
          width: '420px',
          disableClose: true,
          data: {
            tipo: 'success',
            icone: 'celebration',
            titulo: 'Solicitação registrada com sucesso!',
            mensagem: '',
            mostrarConfirmar: false
          }
        });

        this.resetarFormulario(formDirective);
      },
      error: () => {
        this.dialog.open(DialogBaseComponent, {
          width: '420px',
          data: {
            tipo: 'error',
            titulo: 'Erro ao cadastrar solicitação',
            mensagem: 'Não foi possível registrar sua solicitação. Tente novamente.',
            textoConfirmar: 'OK'
          }
        });
      }
    });
  }

  confirmar(formDirective: FormGroupDirective): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cadastrar(formDirective);

    console.log('Dados da solicitação:', this.form.value);
  }

  cancelar(formDirective: FormGroupDirective): void {
    this.resetarFormulario(formDirective);
  }

  resetarFormulario(formDirective: FormGroupDirective): void {
    this.form.reset({
      equipamento: '',
      curso: '',
      grr: '',
      motivo: '',
      semComputador: false,
      matriculaAtiva: false
    });

    formDirective.resetForm({
      equipamento: '',
      curso: '',
      grr: '',
      motivo: '',
      semComputador: false,
      matriculaAtiva: false
    });
  }

  get curso() {
    return this.form.get('curso');
  }

  get equipamento() {
    return this.form.get('equipamento');
  }

  get grr() {
    return this.form.get('grr');
  }

  get motivo() {
    return this.form.get('motivo');
  }

  get semComputador() {
    return this.form.get('semComputador');
  }

  get matriculaAtiva() {
    return this.form.get('matriculaAtiva');
  }
}
