import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-pagina-redefinir-senha',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatSnackBarModule],
  templateUrl: './pagina-redefinir-senha.html',
  styleUrl: './pagina-redefinir-senha.css'
})
export class PaginaRedefinirSenha {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  carregando = false;

  redefinirSenhaForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  redefinirSenha(): void {
    if (this.redefinirSenhaForm.invalid) {
      this.redefinirSenhaForm.markAllAsTouched();
      return;
    }

    this.carregando = true;

    // chamar api
    setTimeout(() => {
      this.router.navigate(['/auth/pagina-mensagem-redefinir-senha']);
      this.carregando = false;
    }, 1000);
  }

  voltar(): void {
    this.router.navigate(['/auth/login']);
  }

  campoTemErro(nomeCampo: string, erro: string): boolean {
    const campo = this.redefinirSenhaForm.get(nomeCampo);
    return !!campo && campo.hasError(erro) && campo.touched;
  }
}