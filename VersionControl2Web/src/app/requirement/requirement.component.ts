import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { RequirementService } from '../services/requirement.service';
import { Requirement } from '../models/requirement';
import { Observable } from 'rxjs';
import 'rxjs';
import { trigger, transition, animate, style, animateChild } from '@angular/animations';

@Component({
  animations: [
    trigger('expandNodeLeft', [
      transition('void => *', [
        style({
          transform: 'translateX(100px)',
          opacity: 0
        }),
        animate(1000, style({
          transform: 'translateX(0)',
          opacity: 1
        }))
      ]),
      transition('* => void', [
        style({
          transform: 'translateX(0)',
          opacity: 1
        }),
        animate(1000, style({
          transform: 'translateX(100px)',
          opacity: 0
        }))
      ])
    ]),
    trigger('expandNodeRight', [
      transition('void => *', [
        style({
          transform: 'translateX(-100px)',
          opacity: 0
        }),
        animate(1000, style({
          transform: 'translateX(0)',
          opacity: 1
        }))
      ]),
      transition('* => void', [
        style({
          transform: 'translateX(0)',
          opacity: 1
        }),
        animate(1000, style({
          transform: 'translateX(-100px)',
          opacity: 0
        }))
      ])
    ]),
    trigger('expandNodeMiddle', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(1000, style({ opacity: 1 }))
      ]),
      transition('* => void', [
        style({ opacity: 1 }),
        animate(1000, style({ opacity: 0 }))
      ])
    ])
  ],
  selector: 'app-requirement',
  templateUrl: './requirement.component.html',
  styleUrls: ['./requirement.component.css']
})
export class RequirementComponent implements OnInit {

  public state: string = 'active';

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

  onSelected(event) {
    console.log(event.target);
  }

  onChangeState() {
    this.state == 'active' ? this.state = 'inactive' : this.state = 'active';
  }
}
