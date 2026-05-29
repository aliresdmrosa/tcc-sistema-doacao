import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginRequest } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-pagina-login',
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
  templateUrl: './pagina-login.html',
  styleUrl: './pagina-login.css'
})
export class PaginaLogin {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  carregando = false;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]]
  });

  entrar(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.carregando = true;

    const dados: LoginRequest = {
      email: this.loginForm.value.email ?? '',
      senha: this.loginForm.value.senha ?? ''
    };

    this.authService.login(dados).subscribe({
      next: () => {
        this.snackBar.open('Login realizado com sucesso!', 'Fechar', {
          duration: 3000
        });

        const perfil = this.authService.getPerfil();

        if (perfil === 'ADMINISTRADOR') {
          this.router.navigate(['/admin']);
        } else if (perfil === 'TECNICO') {
          this.router.navigate(['/tecnico']);
        } else {
          this.router.navigate(['/usuario']);
        }

        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao fazer login:', erro);

        this.snackBar.open('E-mail ou senha inválidos.', 'Fechar', {
          duration: 3000
        });

        this.carregando = false;
      }
    });
  }

  campoTemErro(nomeCampo: string, erro: string): boolean {
    const campo = this.loginForm.get(nomeCampo);
    return !!campo && campo.hasError(erro) && campo.touched;
  }
}
