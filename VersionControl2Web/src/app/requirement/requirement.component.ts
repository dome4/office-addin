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
      $(go.Diagram, "myDiagramDiv",
        {
          "undoManager.isEnabled": true // enable Ctrl-Z to undo and Ctrl-Y to redo
        });

    var myModel = $(go.Model);
    // in the model data, each node is represented by a JavaScript object:
    myModel.nodeDataArray = [
      { key: "Alpha" },
      { key: "Beta" },
      { key: "Gamma" }
    ];
    myDiagram.model = myModel;

  }

}
