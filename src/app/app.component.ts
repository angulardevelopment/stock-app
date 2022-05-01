import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'averaging';
  // showNav = 'true';

  constructor(){
    // localStorage.setItem('val', this.showNav);
  }
}
