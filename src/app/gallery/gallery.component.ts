import { Component, OnInit } from '@angular/core';
declare var baguetteBox;
@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    baguetteBox.run('.cards-gallery', { animation: 'slideIn'});
    if (document.fullscreenElement) {
      setTimeout(() => document.exitFullscreen(), 1000);
  }
  }

}
