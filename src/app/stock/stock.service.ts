import { Injectable } from '@angular/core';
import { NSEData } from './model';
import { NSEKEYS, OPTIONSTRATEGYKEYS } from './test';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  // spotprice = 39110;
  // gap = 200;
  // lotsize = 25;
  // lotsize = 50;

  constructor() { }


  IronCondor(val, spotprice, gap, lotsize) {

    const otmcall = spotprice + gap;
    let otmcallshortdata = this.closest(val, otmcall, NSEKEYS.STRIKE);
    otmcallshortdata['type'] = NSEKEYS.CALL;
    otmcallshortdata['type1'] = NSEKEYS.SHORT;
    otmcallshortdata['lot'] = 1;
    otmcallshortdata['quantity'] = otmcallshortdata['lot'] * lotsize;




    const otmput = spotprice - gap;
    let otmputshortdata = this.closest(val, otmput, NSEKEYS.STRIKE);
    otmputshortdata['type'] = NSEKEYS.PUT;
    otmputshortdata['type1'] = NSEKEYS.SHORT;
    otmputshortdata['lot'] = 1;
    otmputshortdata['quantity'] = otmputshortdata['lot'] * lotsize;

    const otmcalllong = otmcall + 100;
    let otmcalllongdata = this.closest(val, otmcalllong, NSEKEYS.STRIKE);
    otmcalllongdata['type'] = NSEKEYS.CALL;
    otmcalllongdata['type1'] = NSEKEYS.LONG;
    otmcalllongdata['lot'] = 1;
    otmcalllongdata['quantity'] = otmcalllongdata['lot'] * lotsize;

    const otmputlong = otmput - 100;
    let otmputlongdata = this.closest(val, otmputlong, NSEKEYS.STRIKE);
    otmputlongdata['type'] = NSEKEYS.PUT;
    otmputlongdata['type1'] = NSEKEYS.LONG;
    otmputlongdata['lot'] = 1;
    otmputlongdata['quantity'] = otmputlongdata['lot'] * lotsize;

    // upper breakeven  Lower breakeven   expiration prediction  
    // console.log(otmcallshortdata[NSEKEYS.STRIKEPRICE], otmcallshortdata[NSEKEYS.LTP], NSEKEYS.SHORT);
    // console.log(otmputshortdata[NSEKEYS.STRIKEPRICE], otmputshortdata[NSEKEYS.LTP_1], NSEKEYS.SHORT);
    // console.log(otmcalllongdata[NSEKEYS.STRIKEPRICE], otmcalllongdata[NSEKEYS.LTP], NSEKEYS.LONG);
    // console.log(otmputlongdata[NSEKEYS.STRIKEPRICE], otmputlongdata[NSEKEYS.LTP_1], NSEKEYS.LONG);

    // strategydata = [{strike: otmcallshortdata[NSEKEYS.STRIKEPRICE], price: otmcallshortdata[NSEKEYS.LTP], type: NSEKEYS.CALL},
    // {strike: otmputshortdata[NSEKEYS.STRIKEPRICE], price: otmputshortdata[NSEKEYS.LTP_1], type: NSEKEYS.PUT},
    // {strike: otmcalllongdata[NSEKEYS.STRIKEPRICE], price: otmcalllongdata[NSEKEYS.LTP], type: NSEKEYS.CALL},
    // {strike: otmputlongdata[NSEKEYS.STRIKEPRICE], price: otmputlongdata[NSEKEYS.LTP_1], type: NSEKEYS.PUT},
    // ];

    // strategydata = [{strike: otmcallshortdata, type: NSEKEYS.CALL},
    // {strike: otmputshortdata, type: NSEKEYS.PUT},
    // {strike: otmcalllongdata, type: NSEKEYS.CALL},
    // {strike: otmputlongdata, type: NSEKEYS.PUT},
    // ];
    // console.log();


    const strategydata = [otmcallshortdata,
      otmputshortdata, otmcalllongdata, otmputlongdata
    ];
    return strategydata;


    // console.log(strategydata, 'strategydata');

  }


  updatedstrategydata(val, strategydata, strat) {
    let nextdata = [];
    for (const iterator of strategydata) {
      // console.log(iterator, 'iterator');

      const bnuj = this.findstrike(val, iterator[NSEKEYS.STRIKE], NSEKEYS.STRIKE);
      // if (iterator.type == NSEKEYS.CALL) {
      //   console.log(bnuj[NSEKEYS.LTP], bnuj);
      bnuj['type'] = iterator.type;
      bnuj['type1'] = iterator.type1;
      bnuj['lot'] = iterator.lot;
      bnuj['quantity'] = iterator.quantity;
      nextdata.push(bnuj);
      // } else {
      // console.log(bnuj[NSEKEYS.LTP_1], bnuj);
      // this.nextdata.push(bnuj);

      // }

    }
    // this.pointschange('shortb');
    const prof = this.pointschange(strat, strategydata, nextdata);
    return { nextdata, prof };
  }


  pointschange(typ, strategydata, nextdata) {
    // console.log(nextdata, 'nextdata');

    // ltp,call, strike
    let pointDiffs = [];
    for (let index = 0; index < strategydata.length; index++) {
      const element = strategydata[index];
      for (let j = 0; j < nextdata.length; j++) {
        // const element1 = nextdata[j];
        if (element.type == NSEKEYS.CALL && element[NSEKEYS.STRIKE] == nextdata[j][NSEKEYS.STRIKE]) {
          let d1;

          // if (typ == OPTIONSTRATEGYKEYS.IRONCONDOR) {
          //   d1 = nextdata[j][NSEKEYS.LTP] - element[NSEKEYS.LTP];

          // }
          // else if (typ == OPTIONSTRATEGYKEYS.SHORTCALLBUTTERFLY) {
            d1 = this.pointsltpdifference(element, nextdata, j);

          // }
          nextdata[j]['d1'] = d1 * nextdata[j]['lot'];
          const d2 = this.profitloassstatus(d1, element);
          nextdata[j]['d2'] = d2;

          pointDiffs.push(d1);
          console.log(d1, d2, 'ccd');
        } else if (element.type == NSEKEYS.PUT && element[NSEKEYS.STRIKE] == nextdata[j][NSEKEYS.STRIKE]) {
          const d1 = nextdata[j][NSEKEYS.LTP_1] - element[NSEKEYS.LTP_1];
          nextdata[j]['d1'] = d1 * nextdata[j]['lot'];

          const d2 = this.profitloassstatus(d1, element);
          nextdata[j]['d2'] = d2;

          pointDiffs.push(d1);

          console.log(d1, d2, 'bjh');

        }
      }

    }
    const prof = this.calcprofit(pointDiffs);
    // strategydata = nextdata;
    // console.log(strategydata , 'rg');
    return prof;
  }

  pointsltpdifference(element, nextdata, j) {
    let d1;
    if ((element.type1 == NSEKEYS.LONG)) {
      d1 = nextdata[j][NSEKEYS.LTP] - element[NSEKEYS.LTP];
    } else if ((element.type1 == NSEKEYS.SHORT)) {
      d1 = element[NSEKEYS.LTP] - nextdata[j][NSEKEYS.LTP];
    } 
    // else if (element.type1 == NSEKEYS.SHORT) {
    //   d1 = element[NSEKEYS.LTP] - nextdata[j][NSEKEYS.LTP];
    // } else if (element.type1 == NSEKEYS.SHORT) {
    //   d1 = element[NSEKEYS.LTP] - nextdata[j][NSEKEYS.LTP];
    // }
    return d1;
  }

  calcprofit(pointDiffs) {
    var result = pointDiffs.reduce(function (acc, obj) { return acc + obj; }, 0);
    console.log(result, 'calcprofit');
    return result;
  }

  profitloassstatus(d, val) {
    let fbf;
    if (d > 0 && val.type1 == NSEKEYS.SHORT) {
      fbf = NSEKEYS.LOSS;
    } else if (d > 0 && val.type1 == NSEKEYS.LONG) {
      fbf = NSEKEYS.PROFIT;
    } else if (d < 0 && val.type1 == NSEKEYS.SHORT) {
      fbf = NSEKEYS.PROFIT;
    } else if (d < 0 && val.type1 == NSEKEYS.LONG) {
      fbf = NSEKEYS.LOSS;
    }
    return fbf;
  }


  closest(arr, needle, key): NSEData {
    // console.log(arr, needle, key, 'valval');
    const nj = arr.reduce((a, b) => {
      return Math.abs(b[key] - needle) < Math.abs(a[key] - needle) ? b : a;
    });
    return nj;

  }

  findstrike(arr, val, key) {
    var result = arr.find(item => item[key] === val);
    return result;
  }


  SHORTCALLBUTTERFLY(val, spotprice, gap, lotsize) {
    const atmcall = spotprice;
    let otmcallshortdata: NSEData = this.closest(val, atmcall, NSEKEYS.STRIKE);
    otmcallshortdata['type'] = NSEKEYS.CALL;
    otmcallshortdata['type1'] = NSEKEYS.LONG;
    otmcallshortdata['lot'] = 2;
    otmcallshortdata['quantity'] = otmcallshortdata['lot'] * lotsize;

    const itmcall = spotprice - gap;
    let otmputshortdata = this.closest(val, itmcall, NSEKEYS.STRIKE);
    otmputshortdata['type'] = NSEKEYS.CALL;
    otmputshortdata['type1'] = NSEKEYS.SHORT;
    otmputshortdata['lot'] = 1;
    otmputshortdata['quantity'] = otmputshortdata['lot'] * lotsize;

    const otmcall = spotprice + gap;
    let otmcalllongdata = this.closest(val, otmcall, NSEKEYS.STRIKE);
    otmcalllongdata['type'] = NSEKEYS.CALL;
    otmcalllongdata['type1'] = NSEKEYS.SHORT;
    otmcalllongdata['lot'] = 1;
    otmcalllongdata['quantity'] = otmcalllongdata['lot'] * lotsize;
    const strategydata = [otmcallshortdata,
      otmputshortdata, otmcalllongdata
    ];



    // console.log(strategydata, 'strategyd');
    return strategydata;

  }

  LONGCALLBUTTERFLY(val, spotprice, gap, lotsize){
    const atmcall = spotprice;
    let otmcallshortdata = this.closest(val, atmcall, NSEKEYS.STRIKE);
    otmcallshortdata['type'] = NSEKEYS.CALL;
    otmcallshortdata['type1'] = NSEKEYS.SHORT;
    otmcallshortdata['lot'] = 2;
    otmcallshortdata['quantity'] = otmcallshortdata['lot'] * lotsize;

    const itmcall = spotprice - gap;
    let otmputshortdata = this.closest(val, itmcall, NSEKEYS.STRIKE);
    otmputshortdata['type'] = NSEKEYS.CALL;
    otmputshortdata['type1'] = NSEKEYS.LONG;
    otmputshortdata['lot'] = 1;
    otmputshortdata['quantity'] = otmputshortdata['lot'] * lotsize;

    const otmcall = spotprice + gap;
    let otmcalllongdata = this.closest(val, otmcall, NSEKEYS.STRIKE);
    otmcalllongdata['type'] = NSEKEYS.CALL;
    otmcalllongdata['type1'] = NSEKEYS.LONG;
    otmcalllongdata['lot'] = 1;
    otmcalllongdata['quantity'] = otmcalllongdata['lot'] * lotsize;
    const strategydata = [otmcallshortdata,
      otmputshortdata, otmcalllongdata
    ];



    // console.log(strategydata, 'strategyd');
    return strategydata;

  }

  BULLPUTSPREAD(val, spotprice, gap, lotsize){
    const itmcall = spotprice- gap;
    let otmcallshortdata = this.closest(val, itmcall, NSEKEYS.STRIKE);
    otmcallshortdata['type'] = NSEKEYS.PUT;
    otmcallshortdata['type1'] = NSEKEYS.SHORT;
    otmcallshortdata['lot'] = 1;
    otmcallshortdata['quantity'] = otmcallshortdata['lot'] * lotsize;

    const otmput = spotprice + gap;
    let otmcalllongdata = this.closest(val, otmput, NSEKEYS.STRIKE);
    otmcalllongdata['type'] = NSEKEYS.PUT;
    otmcalllongdata['type1'] = NSEKEYS.LONG;
    otmcalllongdata['lot'] = 1;
    otmcalllongdata['quantity'] = otmcalllongdata['lot'] * lotsize;
    const strategydata = [otmcallshortdata,
       otmcalllongdata
    ];



    // console.log(strategydata, 'strategyd');
    return strategydata;

  }

  LONGSTRANGLE(val, spotprice, gap, lotsize){
    const otpcall = spotprice+ gap;
    let otmcallshortdata = this.closest(val, otpcall, NSEKEYS.STRIKE);
    otmcallshortdata['type'] = NSEKEYS.CALL;
    otmcallshortdata['type1'] = NSEKEYS.LONG;
    otmcallshortdata['lot'] = 1;
    otmcallshortdata['quantity'] = otmcallshortdata['lot'] * lotsize;

    const otmput = spotprice + gap;
    let otmcalllongdata = this.closest(val, otmput, NSEKEYS.STRIKE);
    otmcalllongdata['type'] = NSEKEYS.PUT;
    otmcalllongdata['type1'] = NSEKEYS.LONG;
    otmcalllongdata['lot'] = 1;
    otmcalllongdata['quantity'] = otmcalllongdata['lot'] * lotsize;
    const strategydata = [otmcallshortdata,
       otmcalllongdata
    ];



    // console.log(strategydata, 'strategyd');
    return strategydata;
  }

  LONGSTRADDLE(val, spotprice, gap, lotsize){
    const otpcall = spotprice;
    let otmcallshortdata = this.closest(val, otpcall, NSEKEYS.STRIKE);
    const clone = JSON.parse(JSON.stringify(otmcallshortdata));

    clone['type'] = NSEKEYS.CALL;
    clone['type1'] = NSEKEYS.LONG;
    clone['lot'] = 1;
    clone['quantity'] = clone['lot'] * lotsize;

    const otmput = spotprice;
    let otmcalllongdata = this.closest(val, otmput, NSEKEYS.STRIKE);
    const clone2 = JSON.parse(JSON.stringify(otmcalllongdata));

    clone2['type'] = NSEKEYS.PUT;
    clone2['type1'] = NSEKEYS.LONG;
    clone2['lot'] = 1;
    clone2['quantity'] = clone2['lot'] * lotsize;
    const strategydata = [clone,
       clone2
    ];



    // console.log(strategydata, 'strategyd');
    return strategydata;
  }

  atm(){

  }

  otm(){

  }

  SHORTSTRADDLE(val, spotprice, gap, lotsize){
    const otpcall = spotprice;
    let otmcallshortdata = this.closest(val, otpcall, NSEKEYS.STRIKE);
    const clone = JSON.parse(JSON.stringify(otmcallshortdata));

    clone['type'] = NSEKEYS.CALL;
    clone['type1'] = NSEKEYS.SHORT;
    clone['lot'] = 1;
    clone['quantity'] = clone['lot'] * lotsize;

    const otmput = spotprice;
    let otmcalllongdata = this.closest(val, otmput, NSEKEYS.STRIKE);
    const clone2 = JSON.parse(JSON.stringify(otmcalllongdata));

    clone2['type'] = NSEKEYS.PUT;
    clone2['type1'] = NSEKEYS.SHORT;
    clone2['lot'] = 1;
    clone2['quantity'] = clone2['lot'] * lotsize;
    const strategydata = [clone,
       clone2
    ];



    // console.log(strategydata, 'strategyd');
    return strategydata;
  }
}
