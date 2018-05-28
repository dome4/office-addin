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
   * change selectedRequirement-variable
   */
  onSelectedRequirement(requirement: Requirement) {

    // set selected requirement
    this.selectedRequirement = requirement;

  }

}
