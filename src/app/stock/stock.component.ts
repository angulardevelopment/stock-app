import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as XLSX from 'xlsx';
import { CommonService } from '../common.service';
import linkifyHtml from 'linkify-html';
import { NSEData } from './model';
import { NSEKEYS } from './test';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css'],
})
export class StockComponent implements OnInit {
  @ViewChild("myDiv") divView: ElementRef;

  firstBuyPrice;
  firstShare;
  totalFirstPrice;
  secondBuyPrice;
  secondShare;
  totalSecondPrice;
  averagePrice;
  totalShares;
  totalAmount;
  form: FormGroup;
  // file;
  // arrayBuffer;
  totalValue = '0';
  // finalJson = {};
  // counter = 0;
  // allData = [];
  spotprice = 39110;
  gap = 200;
  lotsize = 25;
  strategydata;
  nextdata = [];
  pointDiffs = [];

  constructor(private fb: FormBuilder, private comm: CommonService) {

    this.comm.showNav = false;

  }

  ngOnInit() {
    this.form = this.fb.group({
      numVal1: '',
      numVal2: '',
    });
  }
  ngAfterViewInit() {
    // console.log(getUrls(this.divView.nativeElement.innerHTML));

    // const options = { defaultProtocol: 'https' , target:"_blank"};
    // this.divView.nativeElement.innerHTML = linkifyHtml(this.divView.nativeElement.innerHTML, options);


  }
  getFirstTotal() {
    if (this.firstShare) {


      this.totalFirstPrice = this.firstBuyPrice * this.firstShare;
    }
  }

  getSecondTotal() {
    if (this.secondShare) {


      this.totalSecondPrice = this.secondBuyPrice * this.secondShare;
      const avg = (this.totalFirstPrice + this.totalSecondPrice) /
        (this.firstShare + this.secondShare);
      this.averagePrice = avg.toFixed(2);

      this.totalShares = this.firstShare + this.secondShare;
      this.totalAmount = this.totalSecondPrice + this.totalFirstPrice;
    }
  }


  priceChangePercent(numVal1, numVal2) {

    this.totalValue = (((numVal2 - numVal1) / numVal1) * 100).toFixed(2);


  }

  // submit(nums) {
  //   this.priceChangePercent(nums.numVal1, nums.numVal2);
  // }


  optionChainData(event) {
    // this.finalJson = {};
    const file = event.target.files[0];
    let fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);
    fileReader.onload = (e) => {
      const arrayBuffer = fileReader.result;
      const data = new Uint8Array(arrayBuffer as ArrayBuffer);
      let arr = new Array();
      for (var i = 0; i != data.length; ++i)
        arr[i] = String.fromCharCode(data[i]);
      const bstr = arr.join('');
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const first_sheet_name = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[first_sheet_name];
      const val: NSEData[] = XLSX.utils.sheet_to_json(worksheet, { raw: true });
      // var arraylist = XLSX.utils.sheet_to_json(worksheet, { raw: true });
      // this.allData = val;

      this.getMaxElem(val, NSEKEYS.VOLUME, NSEKEYS.CALL);

      const callVolume = this.getFinalSum(val, NSEKEYS.VOLUME);

      const callOI = this.getFinalSum(val, NSEKEYS.OI);

      const highOicall = this.getMaxElem(val, NSEKEYS.OI, NSEKEYS.CALL);

      this.getMaxElem(val, NSEKEYS.CHNGINOI, NSEKEYS.CALL);

      this.getMaxElem(val, NSEKEYS.VOLUME_1, NSEKEYS.PUT);

      const highOiput = this.getMaxElem(val, NSEKEYS.OI_1, NSEKEYS.PUT);

      this.getMaxElem(val, NSEKEYS.CHNGINOI_1, NSEKEYS.PUT);

      const putVolume = this.getFinalSum(val, NSEKEYS.VOLUME_1);

      const putOi = this.getFinalSum(val, NSEKEYS.OI_1);

      this.PCRvolumeData(callVolume, putVolume);

      this.PCROIData(callOI, putOi);

      this.safeStrike(highOicall, highOiput);

      this.IronCondor(val);

      // this.SHORTCALLBUTTERFLY(val);

    };
  }

  // check not 0
  // val-> volume data, 
  checkNumber(val: number) {
    return isNaN(val) ? 0 : val;
  }

  // find top 3 data
  // arr-> option chain data
  // key-> column name
  // type-> call, put
  getMaxElem(arr: NSEData[], key: string, type: string) {

    arr.sort((a, b) =>
      this.checkNumber(a[key]) < this.checkNumber(b[key])
        ? 1
        : this.checkNumber(a[key]) > this.checkNumber(b[key])
          ? -1
          : 0
    );

    let ltp = 0, ltp2 = 0, ltp3 = 0;
    let oi = 0, oi2 = 0, oi3 = 0;

    if (type == NSEKEYS.PUT) {
      ltp = arr[0][NSEKEYS.LTP_1];
      ltp2 = arr[1][NSEKEYS.LTP_1];
      ltp3 = arr[2][NSEKEYS.LTP_1];

      oi = arr[0][NSEKEYS.OI_1];
      oi2 = arr[1][NSEKEYS.OI_1];
      oi3 = arr[2][NSEKEYS.OI_1];
    } else {
      ltp = arr[0][NSEKEYS.LTP];
      ltp2 = arr[1][NSEKEYS.LTP];
      ltp3 = arr[2][NSEKEYS.LTP];

      oi = arr[0][NSEKEYS.OI];
      oi2 = arr[1][NSEKEYS.OI];
      oi3 = arr[2][NSEKEYS.OI];
    }
    // let aerf = type == 'put' ? arr[0]['LTP_1'] : arr[0]['LTP'];
    // let aerf2 = type == 'put' ? arr[1]['LTP_1'] : arr[1]['LTP'];

    // let aerf3 = type == 'put' ? arr[2]['LTP_1'] : arr[2]['LTP'];

    // let aerf4 = type == 'put' ? arr[0]['OI_1'] : arr[0]['OI'];
    // let aerf5 = type == 'put' ? arr[1][NSEKEYS.OI_1] : arr[1][NSEKEYS.OI];

    // let aerf6 = type == 'put' ? arr[2][NSEKEYS.OI_1] : arr[2][NSEKEYS.OI];

    let abc = `Top ${key} STRIKE ${arr[0][NSEKEYS.STRIKEPRICE]} First highest ${type} LTP ${ltp} OI data ${oi}`;
    let abc2 = `Top ${key} STRIKE', ${arr[1][NSEKEYS.STRIKEPRICE]} Second highest ${type} LTP ${ltp2} OI data ${oi2}`;
    let abc3 = `Top ${key} STRIKE', ${arr[2][NSEKEYS.STRIKEPRICE]} Third highest ${type} LTP ${ltp3} OI data ${oi3}`;

    // const d = { key1: abc, key2: abc2, key3: abc3 };
    // this.finalJson[this.counter] = d;
    console.log(abc, abc2, abc3, 'oi analysi');

    // this.counter++;
    // console.log(abc);
    // console.log(abc2);
    // console.log(abc3);
    // console.log(arr.slice(0, 3));
    return arr[0][NSEKEYS.STRIKEPRICE];
  }

  // retutrn total sum
  // arr-> option chain data
  // key-> column name
  getFinalSum(arr: NSEData[], key: string) {
    const result = arr.reduce(
      (sum, cur) => sum + this.checkNumber(cur[key]),
      0
    );
    // console.log(`${result} total ${key} ${type}`);
    return result;
  }

  PCRvolumeData(call: number, put: number) {
    let ratio = ((put) / (call)).toFixed(2);
    console.log(ratio, 'PCR volume');

    // this.finalJson['PCR volume'] = ratio;
  }

  PCROIData(call: number, put: number) {
    let ratio = ((put) / (call)).toFixed(2);
    console.log(ratio, 'PCR OI');

    // this.finalJson['PCR OI'] = ratio;
  }

  safeStrike(highcall: number, highputoi: number) {
    const safe = (highcall + highputoi) / 2;
    console.log(safe, 'Safe strike');

    // this.finalJson['Safe strike'] = safe;
  }


  IronCondor(val) {

    const otmcall = this.spotprice + this.gap;
    let otmcallshortdata = this.closest(val, otmcall, NSEKEYS.STRIKEPRICE);
    otmcallshortdata['type'] = NSEKEYS.CALL;
    otmcallshortdata['type1'] = NSEKEYS.SHORT;

    const otmput = this.spotprice - this.gap;
    let otmputshortdata = this.closest(val, otmput, NSEKEYS.STRIKEPRICE);
    otmputshortdata['type'] = NSEKEYS.PUT;
    otmputshortdata['type1'] = NSEKEYS.SHORT;

    const otmcalllong = otmcall + 100;
    let otmcalllongdata = this.closest(val, otmcalllong, NSEKEYS.STRIKEPRICE);
    otmcalllongdata['type'] = NSEKEYS.CALL;
    otmcalllongdata['type1'] = NSEKEYS.LONG;

    const otmputlong = otmput - 100;
    let otmputlongdata = this.closest(val, otmputlong, NSEKEYS.STRIKEPRICE);
    otmputlongdata['type'] = NSEKEYS.PUT;
    otmputlongdata['type1'] = NSEKEYS.LONG;

    // strike - price/premium - lot - total - upper breakeven  Lower breakeven   expiration prediction  
    // points change after 10 min, new price, profit
    // console.log(otmcallshortdata[NSEKEYS.STRIKEPRICE], otmcallshortdata[NSEKEYS.LTP], NSEKEYS.SHORT);
    // console.log(otmputshortdata[NSEKEYS.STRIKEPRICE], otmputshortdata[NSEKEYS.LTP_1], NSEKEYS.SHORT);
    // console.log(otmcalllongdata[NSEKEYS.STRIKEPRICE], otmcalllongdata[NSEKEYS.LTP], NSEKEYS.LONG);
    // console.log(otmputlongdata[NSEKEYS.STRIKEPRICE], otmputlongdata[NSEKEYS.LTP_1], NSEKEYS.LONG);

    // this.strategydata = [{strike: otmcallshortdata[NSEKEYS.STRIKEPRICE], price: otmcallshortdata[NSEKEYS.LTP], type: NSEKEYS.CALL},
    // {strike: otmputshortdata[NSEKEYS.STRIKEPRICE], price: otmputshortdata[NSEKEYS.LTP_1], type: NSEKEYS.PUT},
    // {strike: otmcalllongdata[NSEKEYS.STRIKEPRICE], price: otmcalllongdata[NSEKEYS.LTP], type: NSEKEYS.CALL},
    // {strike: otmputlongdata[NSEKEYS.STRIKEPRICE], price: otmputlongdata[NSEKEYS.LTP_1], type: NSEKEYS.PUT},
    // ];

    // this.strategydata = [{strike: otmcallshortdata, type: NSEKEYS.CALL},
    // {strike: otmputshortdata, type: NSEKEYS.PUT},
    // {strike: otmcalllongdata, type: NSEKEYS.CALL},
    // {strike: otmputlongdata, type: NSEKEYS.PUT},
    // ];

    this.strategydata = [otmcallshortdata,
      otmputshortdata, otmcalllongdata, otmputlongdata
    ];



    console.log(this.strategydata, 'strategydata');

  }

  comparestrategydata(event) {
    const file = event.target.files[0];
    let fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);
    fileReader.onload = (e) => {
      const arrayBuffer = fileReader.result;
      const data = new Uint8Array(arrayBuffer as ArrayBuffer);
      let arr = new Array();
      for (var i = 0; i != data.length; ++i)
        arr[i] = String.fromCharCode(data[i]);
      const bstr = arr.join('');
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const first_sheet_name = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[first_sheet_name];
      const val: NSEData[] = XLSX.utils.sheet_to_json(worksheet, { raw: true });


      for (const iterator of this.strategydata) {
        // console.log(iterator, 'iterator');

        const bnuj = this.findstrike(val, iterator[NSEKEYS.STRIKEPRICE], NSEKEYS.STRIKEPRICE);
        // if (iterator.type == NSEKEYS.CALL) {
        //   console.log(bnuj[NSEKEYS.LTP], bnuj);
        this.nextdata.push(bnuj);
        // } else {
        // console.log(bnuj[NSEKEYS.LTP_1], bnuj);
        // this.nextdata.push(bnuj);

        // }

      }
      this.pointschange();
    }
  }



  pointschange() {
    console.log(this.nextdata, 'nextdata');

    // ltp,call, strike

    for (let index = 0; index < this.strategydata.length; index++) {
      const element = this.strategydata[index];
      for (let j = 0; j < this.nextdata.length; j++) {
        // const element1 = this.nextdata[j];
        if (element.type == NSEKEYS.CALL && element[NSEKEYS.STRIKEPRICE] == this.nextdata[j][NSEKEYS.STRIKEPRICE]) {
          const d1 = this.nextdata[j][NSEKEYS.LTP] - element[NSEKEYS.LTP];

          const d2 = this.profitloasscalc(d1, element);
          this.pointDiffs.push(d1);
          console.log(d1, d2, 'ccd');
        } else if (element.type == NSEKEYS.PUT && element[NSEKEYS.STRIKEPRICE] == this.nextdata[j][NSEKEYS.STRIKEPRICE]) {
          const d1 = this.nextdata[j][NSEKEYS.LTP_1] - element[NSEKEYS.LTP_1];
          const d2 = this.profitloasscalc(d1, element);
          this.pointDiffs.push(d1);

          console.log(d1, d2, 'bjh');

        }
      }

    }
    this.calcprofit();
    // this.strategydata = this.nextdata;
    // console.log(this.strategydata , 'rg');

  }

  calcprofit() {
    var result = this.pointDiffs.reduce(function (acc, obj) { return acc + obj; }, 0);
    console.log(result, 'calcprofit');

  }

  profitloasscalc(d, val) {
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


  closest(arr, needle, key) {
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


  SHORTCALLBUTTERFLY(val) {
    const atmcall = this.spotprice;
    let otmcallshortdata = this.closest(val, atmcall, NSEKEYS.STRIKEPRICE);
    otmcallshortdata['type'] = NSEKEYS.CALL;
    otmcallshortdata['type1'] = NSEKEYS.LONG;

    const itmcall = this.spotprice - this.gap;
    let otmputshortdata = this.closest(val, itmcall, NSEKEYS.STRIKEPRICE);
    otmputshortdata['type'] = NSEKEYS.CALL;
    otmputshortdata['type1'] = NSEKEYS.SHORT;

    const otmcall = this.spotprice + this.gap;
    let otmcalllongdata = this.closest(val, otmcall, NSEKEYS.STRIKEPRICE);
    otmcalllongdata['type'] = NSEKEYS.CALL;
    otmcalllongdata['type1'] = NSEKEYS.SHORT;

    // const otmputlong = otmput - 100;
    // let otmputlongdata = this.closest(val, otmputlong, NSEKEYS.STRIKEPRICE);
    // otmputlongdata['type'] = NSEKEYS.PUT;
    // otmputlongdata['type1'] = NSEKEYS.LONG;

    this.strategydata = [otmcallshortdata,
      otmputshortdata, otmcalllongdata
    ];



    console.log(this.strategydata, 'strategyd');

  }
}
