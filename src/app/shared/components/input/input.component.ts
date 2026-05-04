import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  standalone: false
})
export class InputComponent {
  // Emitimos el texto que el usuario escribe hacia la página principal
  @Output() search = new EventEmitter<string>();

  onSearchChange(event: any) {
    this.search.emit(event?.detail?.value ?? '');
  }
}