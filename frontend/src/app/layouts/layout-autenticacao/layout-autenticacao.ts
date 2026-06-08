import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout-autenticacao',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './layout-autenticacao.html',
  styleUrl: './layout-autenticacao.css'
})
export class LayoutAutenticacao {
  constructor(private router: Router) {}

  usarLayoutLateral(): boolean {
    const caminho = this.router.url.split('?')[0].split('#')[0];
    return caminho === '/' || caminho === '/login' || caminho === '/cadastro';
  }
}
