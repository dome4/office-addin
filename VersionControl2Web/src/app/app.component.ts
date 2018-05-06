import { Component, ViewChild } from '@angular/core';
import { OnInit, AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';

// office-ui-fabric variable
declare let fabric: any;


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit{
  title = 'app';


  ngAfterViewInit() {

    var DropdownHTMLElements = document.querySelectorAll('.ms-Dropdown');
    for (var i = 0; i < DropdownHTMLElements.length; ++i) {
      let Dropdown = new fabric['Dropdown'](DropdownHTMLElements[i]);
    }
  }

  



}
