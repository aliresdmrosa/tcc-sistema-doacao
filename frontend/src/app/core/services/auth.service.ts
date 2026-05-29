import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/login';

  login(dados: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, dados).pipe(
      tap((resposta) => {
        localStorage.setItem('token', resposta.token);
        localStorage.setItem('email', resposta.email);
        localStorage.setItem('perfil', this.normalizarPerfil(resposta.perfil));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('perfil');
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  getPerfil(): string | null {
    if (typeof window === 'undefined') return null;
    return this.normalizarPerfil(localStorage.getItem('perfil'));
  }

  isAutenticado(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.getPerfil() === 'ADMINISTRADOR';
  }

  isTecnico(): boolean {
    return this.getPerfil() === 'TECNICO';
  }

  isUsuario(): boolean {
    return this.getPerfil() === 'USUARIO';
  }

  private normalizarPerfil(perfil: string | null | undefined): string {
    if (!perfil) return '';

    return perfil
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace('ROLE_', '')
      .trim();
  }
}
