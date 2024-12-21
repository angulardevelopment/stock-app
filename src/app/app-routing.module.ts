import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StockComponent } from './stock/stock.component';
import { ItemListingComponent } from './item-listing/item-listing.component';
import { ItemPriceComponent } from './item-price/item-price.component';
import { GalleryComponent } from './gallery/gallery.component';
import { CryptocurrencyTrackerComponent } from './cryptocurrency-tracker/cryptocurrency-tracker.component';

const routes: Routes = [
{ path: 'StockComponent', component: StockComponent },
{ path: 'ItemListingComponent', component: ItemListingComponent },
{ path: 'ItemPriceComponent', component: ItemPriceComponent },
{ path: 'GalleryComponent', component: GalleryComponent },
{ path: 'CryptocurrencyTrackerComponent', component: CryptocurrencyTrackerComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
