import { Component, OnInit } from '@angular/core';
import * as go from 'gojs/release/go-debug.js';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  selector: 'app-requirement',
  templateUrl: './requirement.component.html',
  styleUrls: ['./requirement.component.css']
})
export class RequirementComponent implements AfterViewInit {

  constructor() { }

  ngAfterViewInit() {

    var $ = go.GraphObject.make;
    var myDiagram =
      $(go.Diagram, "myDiagramDiv");

  }

}
