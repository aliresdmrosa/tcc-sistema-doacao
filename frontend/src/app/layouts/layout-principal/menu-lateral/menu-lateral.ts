import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';  

@Component({
  selector: 'app-menu-lateral',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './menu-lateral.html',
  styleUrl: './menu-lateral.css'
})
export class MenuLateral {
  private authService = inject(AuthService);
  private router = inject(Router);

  get perfil(): string | null {
    const urlAtual = this.router.url.split('?')[0];

    if (urlAtual.startsWith('/admin')) {
      return 'ADMINISTRADOR';
    }

    if (urlAtual.startsWith('/tecnico')) {
      return 'TECNICO';
    }

    if (urlAtual.startsWith('/usuario')) {
      return 'USUARIO';
    }

    return this.authService.getPerfil();
  }
}
