import { Component, OnInit } from '@angular/core';
import { GameService } from '../shared/services/game';
import { Browser } from '@capacitor/browser';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-deals',
  templateUrl: './deals.page.html',
  styleUrls: ['./deals.page.scss'],
  standalone: false
})
export class DealsPage implements OnInit {
  topDeals: any[] = [];
  searchResults: any[] = [];

  isSearching: boolean = false;
  isLoading: boolean = true;

  favoriteGameId: string | null = null;

  isDetailsOpen: boolean = false;
  selectedDeal: any | null = null;

  readonly topDealsSkeleton = Array.from({ length: 5 });
  readonly resultsSkeleton = Array.from({ length: 6 });

  constructor(private gameService: GameService) { }

  ngOnInit() {
    void this.restoreFavorite();
    this.loadInitialData();
  }

  ionViewWillEnter() {
    void this.restoreFavorite();
  }

  async restoreFavorite() {
    const { value } = await Preferences.get({ key: 'favoriteGame' });
    this.favoriteGameId = value ?? null;
  }

  loadInitialData() {
    this.isLoading = true;
    // 1. Descargamos las tiendas primero
    this.gameService.getStores().subscribe({
      next: () => {
        // 2. Luego descargamos las mejores ofertas
        this.gameService.getTopDeals().subscribe({
          next: (deals) => {
            this.topDeals = deals;
            this.isLoading = false;
          },
          error: () => {
            this.topDeals = [];
            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.topDeals = [];
        this.isLoading = false;
      }
    });
  }

  handleSearch(query: string) {
    // Si el buscador está vacío, volvemos a la vista normal
    if (!query || query.trim() === '') {
      this.isSearching = false;
      this.searchResults = [];
      this.isLoading = false;
      return;
    }

    this.isSearching = true;
    this.isLoading = true;

    // Buscamos en la API
    this.gameService.searchDeals(query).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.isLoading = false;
      },
      error: () => {
        this.searchResults = [];
        this.isLoading = false;
      }
    });
  }

  // Utilidad para extraer el logo cruzando el ID
  getLogo(storeID: string) {
    return this.gameService.getStoreLogo(storeID);
  }

  getStoreName(storeID: string) {
    return this.gameService.getStoreName(storeID);
  }

  isFavorite(deal: any): boolean {
    if (!this.favoriteGameId) return false;
    return String(deal?.gameID ?? '') === this.favoriteGameId;
  }

  async onToggleFavorite(deal: any) {
    const gameID = String(deal?.gameID ?? '');
    if (!gameID) return;

    // Toggle: si ya es favorito, lo quitamos.
    if (this.favoriteGameId === gameID) {
      await Preferences.remove({ key: 'favoriteGame' });
      this.favoriteGameId = null;
      return;
    }

    await Preferences.set({ key: 'favoriteGame', value: gameID });
    this.favoriteGameId = gameID;
  }

  openDetails(deal: any) {
    this.selectedDeal = deal;
    this.isDetailsOpen = true;
  }

  closeDetails() {
    this.isDetailsOpen = false;
  }

  onDetailsDidDismiss() {
    this.isDetailsOpen = false;
    this.selectedDeal = null;
  }

  async viewDeal(dealID: string | undefined) {
    if (!dealID) return;
    const url = `https://www.cheapshark.com/redirect?dealID=${dealID}`;
    await Browser.open({ url });
  }
}