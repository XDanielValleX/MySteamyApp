import { Injectable } from '@angular/core';
import { HttpService } from '../../core/services/http';
import { Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  // Guardaremos las tiendas en memoria para no consultarlas múltiples veces
  private stores: any[] = [];

  constructor(private httpService: HttpService) { }

  // 1. Obtener todas las tiendas
  getStores(): Observable<any> {
    // Si ya están en memoria, evitamos otra llamada.
    if (this.stores.length > 0) {
      return of(this.stores);
    }

    return this.httpService.get<any>('/stores').pipe(
      tap(data => this.stores = data) // Guardamos la respuesta en la variable local
    );
  }

  // 2. Obtener las 5 mejores ofertas (Top Deals)
  getTopDeals(): Observable<any> {
    return this.httpService.get<any>('/deals?pageSize=5');
  }

  // 3. Buscar ofertas por título
  searchDeals(query: string): Observable<any> {
    const encodedQuery = encodeURIComponent(query.trim());
    return this.httpService.get<any>(`/deals?title=${encodedQuery}`);
  }

  // 4. Detalle de un juego por ID
  getGameDetails(id: string): Observable<any> {
    return this.httpService.get<any>(`/games?id=${id}`);
  }

  // Utilidad: Buscar el logo de la tienda usando su storeID
  getStoreLogo(storeID: string): string {
    const store = this.stores.find(s => s.storeID === storeID);
    // CheapShark devuelve la ruta incompleta para las imágenes
    return store ? `https://www.cheapshark.com${store.images.logo}` : '';
  }

  // Utilidad: Buscar el nombre de la tienda usando su storeID
  getStoreName(storeID: string): string {
    const store = this.stores.find(s => s.storeID === storeID);
    return store?.storeName ?? '';
  }
}