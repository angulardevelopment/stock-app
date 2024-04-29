import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as XLSX from 'xlsx';
import { CommonService } from '../common.service';
import linkifyHtml from 'linkify-html';
import { NSEData } from './model';
import { NSEKEYS, OPTIONSTRATEGYKEYS } from './test';
import { StockService } from './stock.service';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css'],
})
export class StockComponent implements OnInit {
  @ViewChild('myDiv') divView: ElementRef;

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
  finalJson = {};
  counter = 0;
  allstrategyData = {};
  // allData1 = [];

  // spotprice = 39178;
  // gap = 500;
  // lotsize = 25;

  spotprice = 0;
  lotsize = 0;
  gap = 0; // 200
  // lotsize = 50;

  // strategydata = [];
  // nextdata = [];
  // pointDiffs = [];
  nsekeys = NSEKEYS;
  // fian;
  // breakeven;
  margin = 0.2; //20%
  allData = [];
  constructor(
    private fb: FormBuilder,
    private comm: CommonService,
    private stock: StockService
  ) {
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
      this.totalSecondPrice = (this.secondBuyPrice * this.secondShare).toFixed(
        2
      );
      const avg =
        (this.totalFirstPrice + this.totalSecondPrice) /
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
    // if (this.spotprice && this.lotsize && this.gap) {
    this.finalJson = {};
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
      const val: NSEData[] = XLSX.utils.sheet_to_json(worksheet, {
        raw: true,
      });
      // var arraylist = XLSX.utils.sheet_to_json(worksheet, { raw: true });
      this.allData = val;
      console.log(val, 'fg');
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

      // console.log(
      //   this.allstrategyData,
      //   this.spotprice,
      //   'this.allstrategyData'
      // );
    };
    // } else {
    //   event.target.value = '';

    //   alert('fill data');
    // }
  }

  // check not 0
  // val-> volume data,
  checkNumber(val: number) {
    // if(val!= '-')
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

    let ltp = 0,
      ltp2 = 0,
      ltp3 = 0;
    let oi = 0,
      oi2 = 0,
      oi3 = 0;

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

    let abc = `Top ${key} STRIKE ${
      arr[0][NSEKEYS.STRIKE]
    } First highest ${type} LTP ${ltp} OI data ${oi}`;
    let abc2 = `Top ${key} STRIKE', ${
      arr[1][NSEKEYS.STRIKE]
    } Second highest ${type} LTP ${ltp2} OI data ${oi2}`;
    let abc3 = `Top ${key} STRIKE', ${
      arr[2][NSEKEYS.STRIKE]
    } Third highest ${type} LTP ${ltp3} OI data ${oi3}`;

    const d = { key1: abc, key2: abc2, key3: abc3 };
    this.finalJson[this.counter] = d;
    // console.log(abc, abc2, abc3, 'oi analysi');

    this.counter++;
    // console.log(abc);
    // console.log(abc2);
    // console.log(abc3);
    // console.log(arr.slice(0, 3));
    return arr[0][NSEKEYS.STRIKE];
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
    let ratio = (put / call).toFixed(2);
    // console.log(ratio, 'PCR volume');

    this.finalJson['PCR volume'] = ratio;
  }

  PCROIData(call: number, put: number) {
    let ratio = (put / call).toFixed(2);
    // console.log(ratio, 'PCR OI');

    this.finalJson['PCR OI'] = ratio;
  }

  safeStrike(highcall: number, highputoi: number) {
    const safe =
      (parseFloat(highcall.toString().replace(/,/, '')) +
        parseFloat(highputoi.toString().replace(/,/, ''))) /
      2;
    // console.log(safe,parseFloat(highcall.toString().replace(/,/, '')), highputoi.toString().split(','), 'Safe strike');

    this.finalJson['Safe strike'] = safe;
  }

  // comparestrategydata(event) {
  //   const file = event.target.files[0];
  //   let fileReader = new FileReader();
  //   fileReader.readAsArrayBuffer(file);
  //   fileReader.onload = (e) => {
  //     const arrayBuffer = fileReader.result;
  //     const data = new Uint8Array(arrayBuffer as ArrayBuffer);
  //     let arr = new Array();
  //     for (var i = 0; i != data.length; ++i)
  //       arr[i] = String.fromCharCode(data[i]);
  //     const bstr = arr.join('');
  //     const workbook = XLSX.read(bstr, { type: 'binary' });
  //     const first_sheet_name = workbook.SheetNames[0];
  //     const worksheet = workbook.Sheets[first_sheet_name];
  //     const val: NSEData[] = XLSX.utils.sheet_to_json(worksheet, { raw: true });
  //     this.allData1 = val;

  //   }
  // }

  stratwgiesData() {
    const val = this.allData;
    this.ironcondor(val);
    this.SHORTCALLBUTTERFLY(val);
    this.LONGCALLBUTTERFLY(val);
    this.BULLPUTSPREAD(val);
    this.LONGSTRANGLE(val);
    this.LONGSTRADDLE(val);
    this.SHORTSTRADDLE(val);
  }

  ironcondor(val) {
    const strategydata = this.stock.IronCondor(
      val,
      this.spotprice,
      this.gap,
      this.lotsize
    );
    // console.log(this.strategydata, 'IronCondor');
    // this.allData.push({'ironcondor': strategydata});
    this.allstrategyData['ironcondor'] = strategydata;
  }

  SHORTCALLBUTTERFLY(val) {
    const strategydata = this.stock.SHORTCALLBUTTERFLY(
      val,
      this.spotprice,
      this.gap,
      this.lotsize
    );
    // console.log(this.strategydata, 'SHORTCALLBUTTERFLY');
    // this.allData.push({'SHORTCALLBUTTERFLY': strategydata});
    this.allstrategyData['SHORTCALLBUTTERFLY'] = strategydata;
  }

  // a11(val, strategydata) {

  //   const { nextdata, prof } = this.stock.updatedstrategydata(val, strategydata, OPTIONSTRATEGYKEYS.IRONCONDOR);
  //   this.nextdata = nextdata;
  //   this.fian = prof;
  //   console.log(nextdata, prof, 'IronCondor upd');

  // }

  // a22(val, strategydata) {

  //   const { nextdata, prof } = this.stock.updatedstrategydata(val, strategydata, OPTIONSTRATEGYKEYS.SHORTCALLBUTTERFLY);
  //   this.nextdata = nextdata;
  //   this.fian = prof;
  //   console.log(nextdata, prof, 'SHORTCALLBUTTERFLY up');

  // }

  LONGCALLBUTTERFLY(val) {
    const strategydata = this.stock.LONGCALLBUTTERFLY(
      val,
      this.spotprice,
      this.gap,
      this.lotsize
    );
    // console.log(this.strategydata, 'IronCondor');
    // this.allData.push({'LONGCALLBUTTERFLY': strategydata});
    this.allstrategyData['LONGCALLBUTTERFLY'] = strategydata;
  }

  // a33(val, strategydata) {

  //   const { nextdata, prof } = this.stock.updatedstrategydata(val, strategydata, OPTIONSTRATEGYKEYS.LONGCALLBUTTERFLY);
  //   this.nextdata = nextdata;
  //   this.fian = prof;
  //   console.log(nextdata, prof, 'SHORTCALLBUTTERFLY up');

  // }

  BULLPUTSPREAD(val) {
    const strategydata = this.stock.BULLPUTSPREAD(
      val,
      this.spotprice,
      this.gap,
      this.lotsize
    );
    // this.allData.push({'BULLPUTSPREAD': strategydata});
    this.allstrategyData['BULLPUTSPREAD'] = strategydata;
  }

  LONGSTRANGLE(val) {
    const strategydata = this.stock.LONGSTRANGLE(
      val,
      this.spotprice,
      this.gap,
      this.lotsize
    );
    // this.allData.push({'LONGSTRANGLE': strategydata});
    this.allstrategyData['LONGSTRANGLE'] = strategydata;
  }

  LONGSTRADDLE(val) {
    const strategydata = this.stock.LONGSTRADDLE(
      val,
      this.spotprice,
      this.gap,
      this.lotsize
    );
    // this.allData.push({'LONGSTRADDLE': strategydata});
    this.allstrategyData['LONGSTRADDLE'] = strategydata;
  }

  SHORTSTRADDLE(val) {
    const strategydata = this.stock.SHORTSTRADDLE(
      val,
      this.spotprice,
      this.gap,
      this.lotsize
    );
    // this.allData.push({'SHORTSTRADDLE': strategydata});
    this.allstrategyData['SHORTSTRADDLE'] = strategydata;
  }
}
