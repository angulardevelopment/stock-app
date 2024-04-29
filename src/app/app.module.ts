import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StockComponent } from './stock/stock.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ItemPriceComponent } from './item-price/item-price.component';
import { ItemListingComponent } from './item-listing/item-listing.component';
import { GalleryComponent } from './gallery/gallery.component';
@NgModule({
  declarations: [
    AppComponent,
    StockComponent,
    ItemPriceComponent,
    ItemListingComponent,
    GalleryComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
