import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BasicComponent } from './basic/basic.component';
import { StockComponent } from './stock/stock.component';

const routes: Routes = [{ path: 'formulas', component: StockComponent },
{ path: 'basic', component: BasicComponent },
{ path: '', component: StockComponent },];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
