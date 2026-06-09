import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { TecnicoCadastroRequest } from '../../../../core/models/usuario.model';
import { CURSOS, SENHA_FORTE_REGEX, apenasNumeros, formatarCpf, normalizarGrr } from '../../../../shared/utils/form-validations';

@Component({
  selector: 'app-pagina-cadastrar-tecnico',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './pagina-cadastrar-tecnico.html',
  styleUrl: './pagina-cadastrar-tecnico.css'
})
export class PaginaCadastrarTecnico {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  carregando = false;
  ocultarSenha = true;
  cursos = CURSOS;

  tecnicoForm = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.pattern(SENHA_FORTE_REGEX)]],
    grr: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    curso: ['', [Validators.required]]
  });

  voltar(): void {
    this.router.navigate(['/admin/usuarios']);
  }

  salvar(formDirective: FormGroupDirective): void {
    if (this.tecnicoForm.invalid) {
      this.tecnicoForm.markAllAsTouched();
      return;
    }

    this.carregando = true;

    const dados: TecnicoCadastroRequest = {
      nome: this.tecnicoForm.value.nome ?? '',
      cpf: apenasNumeros(this.tecnicoForm.value.cpf),
      email: this.tecnicoForm.value.email ?? '',
      senha: this.tecnicoForm.value.senha ?? '',
      grr: this.tecnicoForm.value.grr ?? '',
      curso: this.tecnicoForm.value.curso ?? ''
    };

    this.usuarioService.cadastrarTecnico(dados).subscribe({
      next: () => {
        this.snackBar.open('Aluno técnico cadastrado com sucesso!', 'Fechar', {
          duration: 3000
        });

        this.resetarFormulario(formDirective);
        this.definirCarregando(false);

        this.router.navigate(['/admin/usuarios']);
      },
      error: (erro) => {
        console.error('Erro ao cadastrar técnico:', erro);

        if (erro.status === 403) {
          this.snackBar.open('Você não tem permissão para cadastrar aluno técnico.', 'Fechar', {
            duration: 4000
          });
        } else if (erro.status === 409) {
          this.snackBar.open('Não foi possível cadastrar. Verifique se o e-mail já existe.', 'Fechar', {
            duration: 4000
          });
        } else {
          this.snackBar.open('Erro ao cadastrar aluno técnico.', 'Fechar', {
            duration: 3000
          });
        }

        this.definirCarregando(false);
      }
    });
  }

  cancelar(formDirective: FormGroupDirective): void {
    this.resetarFormulario(formDirective);
  }

  private resetarFormulario(formDirective: FormGroupDirective): void {
    formDirective.resetForm();
    this.ocultarSenha = true;
  }

  private definirCarregando(valor: boolean): void {
    setTimeout(() => {
      this.carregando = valor;
    });
  }

  campoTemErro(nomeCampo: string, erro: string): boolean {
    const campo = this.tecnicoForm.get(nomeCampo);
    return !!campo && campo.hasError(erro) && campo.touched;
  }

  aplicarMascaraCpf(): void {
    const campo = this.tecnicoForm.get('cpf');
    campo?.setValue(formatarCpf(campo.value), { emitEvent: false });
  }

  aplicarMascaraGrr(): void {
    const campo = this.tecnicoForm.get('grr');
    campo?.setValue(normalizarGrr(campo.value), { emitEvent: false });
  }
}
