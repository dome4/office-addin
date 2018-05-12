import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import * as go from 'gojs';
import { RequirementService } from '../services/requirement.service';
import { Requirement } from '../models/requirement';
import { Observable } from 'rxjs';
import 'rxjs';

// office-ui-fabric variable
declare let fabric: any;

@Component({
  selector: 'app-requirement',
  templateUrl: './requirement.component.html',
  styleUrls: ['./requirement.component.css']
})
export class RequirementComponent implements OnInit {

  /*
   * flowchart model
   */
  model: go.Model = new go.GraphLinksModel(
    
    [
      { key: 1, text: "Alpha", color: "lightblue" },
      { key: 2, text: "Beta", color: "orange" },
      { key: 3, text: "Gamma", color: "lightgreen" },
      { key: 4, text: "Delta", color: "pink" }
    ],
    [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 2 },
      { from: 3, to: 4 },
      { from: 4, to: 1 }
    ]
    
    // ToDo: Typisierung macht noch Probleme, Erstellung der Klasse anschauen
  );

  @ViewChild('text')
  private textField: ElementRef;

  data: any;
  node: go.Node;

  /*
   * in dropdown selected requirement
   */
  public selectedRequirement: Requirement = null;

  /*
   * requirements observable
   */
  public requirements$: Observable<Requirement[]> = null;

  /*
   * constructor
   */
  constructor(private requirementService: RequirementService) {}


  ngOnInit() {
    this.requirements$ = this.requirementService.getRequirements();
  }

  /*
   *
   */
  // ToDo: what exactly does this method?
  showDetails(node: go.Node | null) {
    this.node = node;
    if (node) {
      // copy the editable properties into a separate Object
      this.data = {
        text: node.data.text,
        color: node.data.color
      };
    } else {
      this.data = null;
    }
  }

  onCommitDetails() {
    if (this.node) {
      const model = this.node.diagram.model;
      // copy the edited properties back into the node's model data,
      // all within a transaction
      model.startTransaction();
      model.setDataProperty(this.node.data, "text", this.data.text);
      model.setDataProperty(this.node.data, "color", this.data.color);
      model.commitTransaction("modified properties");
    }
  }

  onCancelChanges() {
    // wipe out anything the user may have entered
    this.showDetails(this.node);
  }

  /*
   * method is executed whenever something changes in the model
   */ 
  onModelChanged(c: go.ChangedEvent) {
    // who knows what might have changed in the selected node and data?
    this.showDetails(this.node);

    // create new requirement only if requirement has been currently choosen
    // else no changes are made
    if (this.selectedRequirement) {

      let newRequirement = new Requirement();
      newRequirement._id = this.selectedRequirement._id;
      newRequirement.name = this.selectedRequirement.name;
      newRequirement.description = this.selectedRequirement.description;
      // json model
      newRequirement.jsonModel = this.model.toJson();

      console.log('changed');
      console.log(newRequirement);

      // ToDo: request is not send without subscribe-method -> why?
      this.requirementService.updateRequirement(newRequirement).subscribe(
        (requirement) => {
          // ToDo update current requirement
          // this.requirements$.next([]); -> next() only exists for Subjects
          // Issue
        
        },
        (error) => {
          console.log('error while updating requirement due to user changes:');         
          console.error(error);
        }
      );
    }
  }

  /*
   * change selectedRequirement-variable
   */
  onSelectedRequirement(requirement: Requirement) {

    // set selected requirement
    this.selectedRequirement = requirement;

    // load requirement model
    this.model = go.Model.fromJson(this.selectedRequirement.jsonModel);
    // ToDo complete

  }

}
