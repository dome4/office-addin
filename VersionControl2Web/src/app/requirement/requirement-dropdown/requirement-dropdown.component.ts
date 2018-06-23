import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { Requirement } from '../../models/requirement';
import { $ } from 'protractor';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-requirement-dropdown',
  templateUrl: './requirement-dropdown.component.html',
  styleUrls: ['./requirement-dropdown.component.css']
})
export class RequirementDropdownComponent {

  @Input() requirements: Requirement[];

  @Output()
  requirementSelected: EventEmitter<Requirement> = new EventEmitter<Requirement>();

  onChange($event, selectedRequirementId: string) {

    let requirement = Requirement.findById(this.requirements, selectedRequirementId);
    this.requirementSelected.emit(requirement);
    
  }

  onSelected(event) {
    let selectedRequirementId: string = event.target.value;
    let requirement = Requirement.findById(this.requirements, selectedRequirementId);
    this.requirementSelected.emit(requirement);
  }

}
