import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css'],
})
export class StockComponent implements OnInit {
  firstBuyPrice;
  firstShare;
  totalFirstPrice;
  secondBuyPrice;
  secondShare;
  totalSecondPrice;
  averagePrice;
  totalShares;
  totalAmount;

  constructor() {}

  ngOnInit() {}

  getFirstTotal() {
    this.totalFirstPrice = this.firstBuyPrice * this.firstShare;
  }

  getSecondTotal() {
    this.totalSecondPrice = this.secondBuyPrice * this.secondShare;
    this.averagePrice =
      (this.totalFirstPrice + this.totalSecondPrice) /
      (this.firstShare + this.secondShare);
    this.totalShares = this.firstShare + this.secondShare;
    this.totalAmount = this.totalSecondPrice + this.totalFirstPrice;
  }


}
