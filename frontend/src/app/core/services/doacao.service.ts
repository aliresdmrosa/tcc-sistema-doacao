import { HttpClient } from "@angular/common/http";
import { Doacao } from "../models/doacao.mode";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { Dashboard } from "../models/dashboard.model";
import { DoacaoDTO } from "../dto/daocao.dto";


@Injectable({
  providedIn: 'root'
})

export class DoacaoService {
  
  
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/doacao';

    cadastrarDoacao(dados: Doacao): Observable<FormData> {
        const formData = new FormData();
        formData.append('equipamento', dados.equipamento);
        formData.append('quantidade', '1');
        formData.append('descricao', dados.descricao);
        formData.append('conservacao', dados.conservacao);
        dados.imagens.forEach((imagem) => formData.append('imagens', imagem));
    return this.http.post<FormData>(this.apiUrl, formData);
    }

    obterDadosDashboard(): Observable<Dashboard> {
      return this.http.get<Dashboard>(`${this.apiUrl}/dashboard`);
  }

    listarDoacoesUsuario(): Observable<DoacaoDTO[]> {
        return this.http.get<DoacaoDTO[]>(`${this.apiUrl}/usuario`);
    }

    listarTodasDoacoes(): Observable<DoacaoDTO[]> {
      return this.http.get<DoacaoDTO[]>(`${this.apiUrl}`);
  }

      listarDoacoesTecnico(): Observable<DoacaoDTO[]> {
        return this.http.get<DoacaoDTO[]>(`${this.apiUrl}/tecnico`);
    }

    listarDoacoesReverReparoPorId(id: number): Observable<DoacaoDTO> {
      return this.http.get<DoacaoDTO>(`${this.apiUrl}/tecnico/${id}`);
  }

    aprovarDoacao(id: number, motivo: string): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/aprovar/${id}`, { motivo });
    }

    reprovarDoacao(id: number, motivo: string): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/reprovar/${id}`, { motivo });
    }

    doacaoId(id: number): Observable<DoacaoDTO> {
      return this.http.get<DoacaoDTO>(`${this.apiUrl}/${id}`);
    }

    atualizarDoacao(id: number, dados: {
      equipamento: string;
      descricao: string;
      conservacao: string;
      imagem: File;
    }): Observable<DoacaoDTO> {
      const formData = new FormData();
      formData.append('equipamento', dados.equipamento);
      formData.append('quantidade', '1');
      formData.append('descricao', dados.descricao);
      formData.append('conservacao', dados.conservacao);
      formData.append('imagens', dados.imagem);

      return this.http.patch<DoacaoDTO>(`${this.apiUrl}/${id}`, formData);
    }

    deletarDoacao(id: number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }




}
