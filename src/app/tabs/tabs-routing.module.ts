import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'deals',
        loadChildren: () => import('../deals/deals.module').then(m => m.DealsPageModule)
      },
      {
        path: 'favorite',
        loadChildren: () => import('../favorite/favorite.module').then(m => m.FavoritePageModule)
      },
      {
        // Ruta por defecto cuando entras a /tabs
        path: '',
        redirectTo: '/tabs/deals',
        pathMatch: 'full'
      }
    ]
  },
  {
    // Ruta por defecto al abrir la app
    path: '',
    redirectTo: '/tabs/deals',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}