import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { SolicitacaoDTO } from "../dto/solicitacao.dto";
import { Observable } from "rxjs";
import { SolicitacaoResponseDTO } from "../dto/solicitacao.response";

@Injectable({
  providedIn: 'root'
})



export class SolicitacaoService {

    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/solicitacao';

    cadastrarSolicitacao(dados: SolicitacaoDTO): Observable<SolicitacaoDTO> {
        return this.http.post<SolicitacaoDTO>(this.apiUrl, dados);
    }
    listarSolicitacaoUsuario(): Observable<SolicitacaoResponseDTO[]> {
        return this.http.get<SolicitacaoResponseDTO[]>(`${this.apiUrl}/usuario`);
    }

    listarSolicitacoesPorUsuario(idUsuario: number): Observable<SolicitacaoResponseDTO[]> {
        return this.http.get<SolicitacaoResponseDTO[]>(`${this.apiUrl}/usuario/${idUsuario}`);
    }

    listarTodasSolicitacao(): Observable<SolicitacaoResponseDTO[]> {
        return this.http.get<SolicitacaoResponseDTO[]>(this.apiUrl);
    }

    excluirSolicitacao(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    obterSolicitacaoPorId(id: number): Observable<SolicitacaoResponseDTO> {
        return this.http.get<SolicitacaoResponseDTO>(`${this.apiUrl}/${id}`);
    }

    atualizarSolicitacao(id: number, dados: SolicitacaoDTO): Observable<SolicitacaoResponseDTO> {
        return this.http.patch<SolicitacaoResponseDTO>(`${this.apiUrl}/${id}`, dados);
    }

    aprovarSolicitacao(id: number): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/aprovar/${id}`, {});
    }

    reprovarSolicitacao(id: number): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/reprovar/${id}`, {});
    }

}
