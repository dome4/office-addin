import { Component, OnInit } from '@angular/core';
import { Requirement } from '../models/requirement';
import { RequirementService } from '../services/requirement.service';

@Component({
  selector: 'app-requirement-list',
  templateUrl: './requirement-list.component.html',
  styleUrls: ['./requirement-list.component.css']
})
export class RequirementListComponent implements OnInit {

  public requirements: Requirement[] = [];


  constructor(private reqService: RequirementService) { }


  ngOnInit() {
    this.reqService.getRequirements()
      .subscribe(
        (requirements: Requirement[]) => {
          this.requirements = requirements;
        },
        error => {
          console.log(error);
        }
    );
  }

}
