import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-item-price',
  templateUrl: './item-price.component.html',
  styleUrls: ['./item-price.component.scss'],
  standalone: false
})
export class ItemPriceComponent implements OnInit {
//   ItemCodes
// checkbox replace
// old product price
  ngOnInit(): void {}

  form: FormGroup;
  isReplace = false;
  heroes = HEROES;
  selectedHero?: Hero;
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      purchaseprice: new FormControl('', Validators.minLength(2)),
      discount: '',
      maxDiscount: '',
      finalVal: '',
      oldProductPrice: '',
    });
  }

  calculatePurchasePrice() {

    let purchaseprice = this.form.value.purchaseprice.split('');
    let price = '';
    let purchasepriceLen = purchaseprice.length;
    if (purchasepriceLen >=2) {
    for (var i = 0; i < purchasepriceLen; i++) {
      const purchasepriceval =purchaseprice[i].toUpperCase();
      if (purchasepriceval == 'Z') {
        price = price.concat('0');
      } else if (purchasepriceval == 'A') {
        price = price.concat('1');
      } else if (purchasepriceval == 'B') {
        price = price.concat('2');
      } else if (purchasepriceval == 'C') {
        price = price.concat('3');
      } else if (purchasepriceval == 'D') {
        price = price.concat('4');
      } else if (purchasepriceval == 'E') {
        price = price.concat('5');
      } else if (purchasepriceval == 'F') {
        price = price.concat('6');
      } else if (purchasepriceval == 'G') {
        price = price.concat('7');
      } else if (purchasepriceval == 'H') {
        price = price.concat('8');
      } else if (purchasepriceval == 'I') {
        price = price.concat('9');
      } else {
        console.log('valid')
      }
    }
    let finalPrice = 3 * +price;

    if (this.form.value.oldProductPrice) {
      let finalPriceReplaceItem = this.form.value.oldProductPrice + finalPrice;
      this.form.get('finalVal').setValue(finalPriceReplaceItem);
    } else {
      this.form.get('finalVal').setValue(finalPrice);
    }
  }
  }

  calculateDiscount() {
    let discountedPrice =
      this.form.value.finalVal -
      (this.form.value.discount * this.form.value.finalVal) / 100;
    this.form.get('finalVal').setValue(discountedPrice);
  }

  calculateMaxDiscount() {
    let finalDiscountedPrice =
      this.form.value.finalVal -
      (this.form.value.maxDiscount * this.form.value.finalVal) / 100;
    this.form.get('finalVal').setValue(finalDiscountedPrice);
  }

  calculateReplacedProductPrice() {}

  submit(f: any) {
    console.log(f, 's');
  }

  closeReplace() {
    this.isReplace = false;
    this.form.get('oldProductPrice').setValue('');
  }



  onSelect(hero: Hero): void {
    this.selectedHero = hero;
  }
}

export interface Hero {
  id: number;
  name: string;
}

export const HEROES: Hero[] = [
  {id: 1, name:'banana clip'},
  {id: 2, name:'chain'},
  {id: 5, name:'bangles'},
  {id: 3, name:'earings'},
  {id: 4, name:'tika'}
];
