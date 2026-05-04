import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DealsPageRoutingModule } from './deals-routing.module';

import { SharedModule } from '../shared/shared-module';

import { DealsPage } from './deals.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    DealsPageRoutingModule
  ],
  declarations: [DealsPage]
})
export class DealsPageModule {}
