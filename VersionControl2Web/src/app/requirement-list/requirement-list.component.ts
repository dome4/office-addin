import { Component, OnInit } from '@angular/core';
import { Requirement } from '../models/requirement';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-requirement-list',
  templateUrl: './requirement-list.component.html',
  styleUrls: ['./requirement-list.component.css']
})
export class RequirementListComponent implements OnInit {

  public requirements: Requirement[] = [];


  constructor(private storeService: StoreService) { }


  ngOnInit() {
    this.storeService.requirements$
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
