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
        formData.append('quantidade', dados.quantidade.toString());
        formData.append('descricao', dados.descricao);
        formData.append('conservacao', dados.conservacao);
        formData.append('imagem', dados.imagem); 
    return this.http.post<FormData>(this.apiUrl, formData);
    }

    obterDadosDashboard(): Observable<Dashboard> {
      return this.http.get<Dashboard>(`${this.apiUrl}/dashboard`);
  }

    listarDoacoesUsuario(): Observable<DoacaoDTO[]> {
        return this.http.get<DoacaoDTO[]>(`${this.apiUrl}/usuario`);
    }

      listarDoacoesReverReparo(): Observable<DoacaoDTO[]> {
        return this.http.get<DoacaoDTO[]>(`${this.apiUrl}/tecnico`);
    }

    listarDoacoesReverReparoPorId(id: number): Observable<DoacaoDTO> {
      return this.http.get<DoacaoDTO>(`${this.apiUrl}/tecnico/${id}`);
  }




}