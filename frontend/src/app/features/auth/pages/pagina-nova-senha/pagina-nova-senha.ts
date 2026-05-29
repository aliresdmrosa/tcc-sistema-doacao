import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
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
    MatButtonModule
  ],
  templateUrl: './pagina-nova-senha.html',
  styleUrl: './pagina-nova-senha.css',
})
export class PaginaNovaSenha {
  private fb = inject(FormBuilder);
  private router = inject(Router);

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

    // chamar api
    setTimeout(() => {
      this.carregando = false;
      this.router.navigate(['/sucesso-redefinir-senha']);
    }, 800);
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
