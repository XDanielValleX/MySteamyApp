import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  // URL base de la API de CheapShark
  private baseUrl: string = 'https://www.cheapshark.com/api/1.0';

  constructor(private http: HttpClient) { }

  // Método genérico para peticiones GET
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`);
  }
}