import { HttpClient } from "@angular/common/http";
import { HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class ReparoService {
  private apiUrl = 'http://localhost:8080/reparo';
  private http = inject(HttpClient);


  listarReparoTecnico(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tecnico`);
  }

  listarReparosDoacao(idDoacao: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${idDoacao}`);
  }

  salvarReparo(idDoacao: number, descricao: string): Observable<any> {
    const params = new HttpParams()
      .set('id_doacao', idDoacao)
      .set('descricao', descricao);

    return this.http.post<any>(this.apiUrl, null, { params });
  }

  concluirReparo(id: number, motivo: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/concluir/${id}`, motivo);
  }


}
