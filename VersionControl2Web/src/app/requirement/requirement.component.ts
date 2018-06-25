import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { RequirementService } from '../services/requirement.service';
import { Requirement } from '../models/requirement';
import { Observable } from 'rxjs';
import 'rxjs';
import { trigger, transition, animate, state, style } from '@angular/animations';

@Component({
  animations: [
    trigger('nextRow', [
      transition('void => *', [
        style({
          transform: 'translateY(-100px)',
          opacity: 0
        }),
        animate(800, style({
          transform: 'translateY(0)',
          opacity: 1
        }))
      ])
    ]),
    trigger('expandNodeLeft', [
      transition('void => *', [
        style({
          transform: 'translate(100px, -50px)',
          opacity: 0
        }),
        animate(500, style({
          transform: 'translateY(0)',
          opacity: 0.5
        })),
        animate(1000, style({
          transform: 'translateX(0)',
          opacity: 1
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

      ])
    ]),

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

//animations: [
//  trigger('nextNode', [
//    state('inactive', style({
//      backgroundColor: 'blue'
//    })),
//    state('active', style({
//      backgroundColor: 'red'
//    })),
//    transition('active <=> inactive', animate(1000))
//  ])
//],
