import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { RequirementService } from '../services/requirement.service';
import { Requirement } from '../models/requirement';
import { Observable } from 'rxjs';
import 'rxjs';
import { trigger, transition, animate, state, style } from '@angular/animations';

// office-ui-fabric variable
declare let fabric: any;

@Component({
  animations: [
    trigger('nextNode', [
      state('inactive', style({
        backgroundColor: 'blue'
      })),
      state('active', style({
        backgroundColor: 'red'
      })),
      transition('active <=> inactive', animate(1000))
      ])
  ],
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
  private requirements$: Observable<Requirement[]> = null;

  /*
   * requirements array
   */
  public requirements: Requirement[] = [];

  /*
   * constructor
   */
  constructor(private requirementService: RequirementService) {}

  ngOnInit() {
    this.requirements$ = this.requirementService.getRequirements();

    this.requirements$.subscribe(
      (requirements: Requirement[]) => {
        this.requirements = requirements;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  /*
   * change selectedRequirement-variable
   */
  onSelectedRequirement(requirement: Requirement) {

    // set selected requirement
    this.selectedRequirement = requirement;
    console.log('requirement selected');
    console.log(this.selectedRequirement);

  }

}
