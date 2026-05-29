import { HttpClient } from "@angular/common/http";
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



}