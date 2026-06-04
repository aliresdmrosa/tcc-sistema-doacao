import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario, UsuarioCadastroRequest, TecnicoCadastroRequest, AdminCadastroRequest, UsuarioAtualizacaoRequest } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080/usuarios';

  listarUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  cadastrarUsuario(dados: UsuarioCadastroRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, dados);
  }

  cadastrarTecnico(dados: TecnicoCadastroRequest): Observable<Usuario> {
    const payload = {
      usuario: {
        nome: dados.nome,
        cpf: dados.cpf,
        email: dados.email,
        senha: dados.senha
      },
      curso: dados.curso,
      grr: dados.grr
    };

    return this.http.post<Usuario>(`${this.apiUrl}/tecnico`, payload);
  }

  cadastrarAdmin(dados: AdminCadastroRequest): Observable<Usuario> {
    const payload = {
      usuario: {
        nome: dados.nome,
        cpf: dados.cpf,
        email: dados.email,
        senha: dados.senha
      }
    };

    return this.http.post<Usuario>(`${this.apiUrl}/admin`, payload);
  }

  atualizarUsuario(id: number, dados: UsuarioAtualizacaoRequest): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${id}`, dados);
  }

  desativarPerfil(id: number): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${id}/desativar`, {});
  }

  reativarPerfil(id: number): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${id}/reativar`, {});
  }

  deletarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
