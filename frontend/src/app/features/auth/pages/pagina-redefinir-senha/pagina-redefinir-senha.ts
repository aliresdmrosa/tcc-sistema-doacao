import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
export class PaginaRedefinirSenha implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);


  carregando = false;

  redefinirSenhaForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.router.navigate(['/nova-senha'], { queryParams: { token } });
    }
  }

  redefinirSenha(): void {
    if (this.redefinirSenhaForm.invalid) {
      this.redefinirSenhaForm.markAllAsTouched();
      return;
    }

    this.carregando = true;
    const email = this.redefinirSenhaForm.value.email ?? '';

    this.authService.solicitarRecuperacaoSenha(email).subscribe({
      next: () => {
        this.router.navigate(['/mensagem-redefinir-senha'], {
          state: { email }
        });
      },
      error: () => {
        this.snackBar.open('Não foi possível enviar o e-mail de recuperação.', 'Fechar', {
          duration: 4000
        });
        this.carregando = false;
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/login']);
  }

  campoTemErro(nomeCampo: string, erro: string): boolean {
    const campo = this.redefinirSenhaForm.get(nomeCampo);
    return !!campo && campo.hasError(erro) && campo.touched;
  }
}
