import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FavoritePageRoutingModule } from './favorite-routing.module';

import { SharedModule } from '../shared/shared-module';

import { FavoritePage } from './favorite.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    FavoritePageRoutingModule
  ],
  declarations: [FavoritePage]
})
export class FavoritePageModule {}
