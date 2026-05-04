import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  standalone: false
})
export class CardComponent {
  // Datos que recibiremos de la API de CheapShark
  @Input() title: string = '';
  @Input() thumb: string = '';
  @Input() salePrice: string = '';
  @Input() normalPrice: string = '';
  @Input() savings: string = '';
  @Input() storeLogo: string = '';

  // Extra UI state
  @Input() dealRating: string = '';
  @Input() isFavorite: boolean = false;

  // Interactions
  @Output() select = new EventEmitter<void>();
  @Output() toggleFavorite = new EventEmitter<void>();

  onSelect() {
    this.select.emit();
  }

  onToggleFavorite(event: Event) {
    event.stopPropagation();
    this.toggleFavorite.emit();
  }
}