import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import getUrls from 'get-urls';

import * as linkify from 'linkifyjs';
import linkifyHtml from 'linkify-html';

@Component({
  selector: 'app-basic',
  templateUrl: './basic.component.html',
  styleUrls: ['./basic.component.scss']
})
export class BasicComponent implements OnInit {
  @ViewChild("myDiv") divView: ElementRef;

  constructor() { }

  ngOnInit(): void {



  }

  ngAfterViewInit(){
// console.log(getUrls(this.divView.nativeElement.innerHTML));

const options = { defaultProtocol: 'https' , target:"_blank"};
this.divView.nativeElement.innerHTML = linkifyHtml(this.divView.nativeElement.innerHTML, options);


  }

}
