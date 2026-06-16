import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';
import { SENHA_FORTE_REGEX } from '../../../../shared/utils/form-validations';

@Component({
  selector: 'app-pagina-nova-senha',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './pagina-nova-senha.html',
  styleUrl: './pagina-nova-senha.css',
})
export class PaginaNovaSenha {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  carregando = false;
  ocultarSenha = true;
  ocultarConfirmarSenha = true;

  form = this.fb.group({
    senha: ['', [Validators.required, Validators.pattern(SENHA_FORTE_REGEX)]],
    confirmarSenha: ['', [Validators.required]]
  });

  enviar(): void {
    if (this.form.invalid || !this.senhasIguais()) {
      this.form.markAllAsTouched();
      return;
    }

    this.carregando = true;

    const token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!token) {
      this.snackBar.open('Token de recuperação não encontrado.', 'Fechar', {
        duration: 4000
      });
      this.carregando = false;
      return;
    }

    this.authService.redefinirSenha({
      token,
      novaSenha: this.form.value.senha ?? '',
      confirmarSenha: this.form.value.confirmarSenha ?? ''
    }).subscribe({
      next: () => {
        this.carregando = false;
        this.router.navigate(['/sucesso-redefinir-senha']);
      },
      error: () => {
        this.snackBar.open('Não foi possível redefinir a senha.', 'Fechar', {
          duration: 4000
        });
        this.carregando = false;
      }
    });
  }

  voltarLogin(): void {
    this.router.navigate(['/login']);
  }

  campoTemErro(nomeCampo: string, erro: string): boolean {
    const campo = this.form.get(nomeCampo);
    return !!campo && campo.hasError(erro) && campo.touched;
  }

  senhasIguais(): boolean {
    return this.form.value.senha === this.form.value.confirmarSenha;
  }

  mostrarErroConfirmacao(): boolean {
    const campo = this.form.get('confirmarSenha');
    return !!campo && campo.touched && !this.senhasIguais();
  }
}
