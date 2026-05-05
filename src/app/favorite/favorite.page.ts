import { Component } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { Preferences } from '@capacitor/preferences';
import { GameService } from '../shared/services/game';
import { refreshWidget } from '../shared/services/widget';

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.page.html',
  styleUrls: ['./favorite.page.scss'],
  standalone: false
})
export class FavoritePage {

  isLoading: boolean = true;

  favoriteGameId: string | null = null;
  favoriteDeal: any | null = null;

  isDetailsOpen: boolean = false;
  selectedDeal: any | null = null;

  readonly favoriteSkeleton = Array.from({ length: 1 });

  constructor(private gameService: GameService) { }

  ngOnInit() {
    // Preferimos ionViewWillEnter para refrescar al volver desde Deals.
  }

  ionViewWillEnter() {
    void this.loadFavorite();
  }

  async loadFavorite() {
    this.isLoading = true;

    const { value } = await Preferences.get({ key: 'favoriteGame' });
    this.favoriteGameId = value ?? null;

    if (!this.favoriteGameId) {
      this.favoriteDeal = null;
      this.isLoading = false;
      return;
    }

    // Aseguramos el catálogo de stores (para logos)
    this.gameService.getStores().subscribe({
      next: () => this.fetchFavoriteGameDetails(this.favoriteGameId as string),
      error: () => this.fetchFavoriteGameDetails(this.favoriteGameId as string)
    });
  }

  fetchFavoriteGameDetails(gameId: string) {
    this.gameService.getGameDetails(gameId).subscribe({
      next: (data) => {
        const info = data?.info;
        const deals = Array.isArray(data?.deals) ? data.deals : [];

        // Elegimos el mejor deal (precio más bajo)
        const bestDeal = deals
          .map((d: any) => ({ ...d, __price: Number(d.price) }))
          .sort((a: any, b: any) => a.__price - b.__price)[0];

        if (!bestDeal) {
          this.favoriteDeal = null;
          this.isLoading = false;
          return;
        }

        this.favoriteDeal = {
          title: info?.title ?? 'Favorite',
          thumb: info?.thumb ?? '',
          salePrice: bestDeal?.price ?? '',
          normalPrice: bestDeal?.retailPrice ?? '',
          savings: bestDeal?.savings ?? '',
          storeID: bestDeal?.storeID ?? '',
          dealID: bestDeal?.dealID ?? ''
        };

        this.isLoading = false;
      },
      error: () => {
        this.favoriteDeal = null;
        this.isLoading = false;
      }
    });
  }

  getLogo(storeID: string) {
    return this.gameService.getStoreLogo(storeID);
  }

  getStoreName(storeID: string) {
    return this.gameService.getStoreName(storeID);
  }

  async clearFavorite() {
    await Preferences.remove({ key: 'favoriteGame' });
    this.favoriteGameId = null;
    this.favoriteDeal = null;
    await refreshWidget(null);
  }

  openDetails() {
    if (!this.favoriteDeal) return;
    this.selectedDeal = this.favoriteDeal;
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
