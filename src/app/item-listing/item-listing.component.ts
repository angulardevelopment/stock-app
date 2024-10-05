import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-item-listing',
  templateUrl: './item-listing.component.html',
  styleUrls: ['./item-listing.component.scss']
})
export class ItemListingComponent implements OnInit {
  heroes = [
    {id: 1, name:'banana clip'},
    {id: 2, name:'chain'},
    {id: 5, name:'bangles'},
    {id: 3, name:'earings'},
    {id: 4, name:'tika'}
];

  constructor() { }

  ngOnInit(): void {
  }

}
