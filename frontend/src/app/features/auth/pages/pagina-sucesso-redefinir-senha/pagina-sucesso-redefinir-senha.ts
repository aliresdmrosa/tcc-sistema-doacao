import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-pagina-sucesso-redefinir-senha',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './pagina-sucesso-redefinir-senha.html',
  styleUrl: './pagina-sucesso-redefinir-senha.css',
})
export class PaginaSucessoRedefinirSenha {
  private router = inject(Router);

  voltarLogin(): void {
    this.router.navigate(['/login']);
  }
}
