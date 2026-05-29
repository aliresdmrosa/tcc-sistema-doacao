import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-pagina-mensagem-redefinir-senha',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './pagina-mensagem-redefinir-senha.html',
  styleUrl: './pagina-mensagem-redefinir-senha.css',
})
export class PaginaMensagemRedefinirSenha {
  private router = inject(Router);
  email = history.state?.email || 'seu e-mail';

  voltarLogin(): void {
    this.router.navigate(['/login']);
  }

  abrirNovaSenha(): void {
    this.router.navigate(['/nova-senha']);
  }
}
