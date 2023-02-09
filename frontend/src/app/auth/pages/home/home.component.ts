import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: [
    `
    .card-fondo{
      background: rgba(0,0,0,0.2) !important;
      box-shadow: 0px 0px 4px 5px rgba(0.21, 0.21, 0.21, 0.21), 0px 0px 4px 4px rgba(0.24, 0.24, 0.24, 0.24) !important;
    }
    `
  ]
})
export class HomeComponent  {};
