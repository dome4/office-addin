import { Injectable } from "@angular/core";
import { RequirementService } from "./requirement.service";
import { Observable, Subject } from "rxjs";
import { Requirement } from "../models/requirement";

/**
 * central service where all observables are stored
 *  
 */
@Injectable()
export class StoreService {

  // local requirements
  requirements$: Observable<Requirement[]>;

  // currently selected requirement
  selectedRequirement$: Subject<Requirement>;

  constructor(private requirementService: RequirementService) {

    // initialize data
    this.requirements$ = this.requirementService.getRequirements();
    this.selectedRequirement$ = new Subject<Requirement>();
  }
}
