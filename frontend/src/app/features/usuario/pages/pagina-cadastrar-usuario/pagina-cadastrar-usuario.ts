import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { UsuarioCadastroRequest } from '../../../../core/models/usuario.model';

@Component({
  selector: 'app-pagina-cadastrar-usuario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    RouterLink
  ],
  templateUrl: './pagina-cadastrar-usuario.html',
  styleUrl: './pagina-cadastrar-usuario.css'
})
export class PaginaCadastrarUsuario {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private snackBar = inject(MatSnackBar);

  carregando = false;

  cadastroForm = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    cpf: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]]
  });

  salvar(): void {
    if (this.cadastroForm.invalid) {
      this.cadastroForm.markAllAsTouched();
      return;
    }

    this.carregando = true;

    const dados: UsuarioCadastroRequest = {
      nome: this.cadastroForm.value.nome!,
      cpf: this.cadastroForm.value.cpf!,
      email: this.cadastroForm.value.email!,
      senha: this.cadastroForm.value.senha!
    };

    this.usuarioService.cadastrarUsuario(dados).subscribe({
      next: () => {
        this.snackBar.open('Usuário cadastrado com sucesso!', 'Fechar', {
          duration: 3000
        });
        this.cadastroForm.reset();
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao cadastrar usuário:', erro);

        this.snackBar.open('Erro ao cadastrar usuário.', 'Fechar', {
          duration: 3000
        });

        this.carregando = false;
      }
    });
  }

  campoTemErro(nomeCampo: string, erro: string): boolean {
    const campo = this.cadastroForm.get(nomeCampo);
    return !!campo && campo.hasError(erro) && campo.touched;
  }
}
