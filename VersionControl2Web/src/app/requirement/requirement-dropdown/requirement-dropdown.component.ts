import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { Requirement } from '../../models/requirement';
import { $ } from 'protractor';
import { Observable, Subscription } from 'rxjs';
import { StoreService } from '../../services/store.service';

@Component({
  selector: 'app-requirement-dropdown',
  templateUrl: './requirement-dropdown.component.html',
  styleUrls: ['./requirement-dropdown.component.css']
})
export class RequirementDropdownComponent implements OnInit {

  // requirements array
  public requirements: Requirement[] = [];

  // subscriptions
  private subscriptions: Subscription[] = [];

  constructor(private storeService: StoreService) { }

  ngOnInit() {
    this.subscriptions.push(
      this.storeService.requirements$.subscribe((requirements: Requirement[]) => this.requirements = requirements)
    );
  }

  @Output()
  createNewRequirement: EventEmitter<Requirement> = new EventEmitter<Requirement>();

  onSelected(event) {

    // get selected requirement
    let selectedRequirementId: string = event.target.value;
    let requirement = Requirement.findById(this.requirements, selectedRequirementId);

    // emit next requirement
    this.storeService.selectedRequirement$.next(requirement);
  }

}
