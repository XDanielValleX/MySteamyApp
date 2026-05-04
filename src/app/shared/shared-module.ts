import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

// Importamos los componentes generados
import { CardComponent } from './components/card/card.component';
import { InputComponent } from './components/input/input.component';

@NgModule({
  declarations: [
    CardComponent,
    InputComponent
  ],
  imports: [
    CommonModule,
    IonicModule // Necesario para usar etiquetas <ion-*> dentro de los componentes
  ],
  exports: [
    // Los exportamos para que las páginas Deals y Favorite puedan usarlos
    CardComponent,
    InputComponent,
    CommonModule,
    IonicModule
  ]
})
export class SharedModule { }