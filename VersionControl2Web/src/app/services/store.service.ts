import { Injectable } from "@angular/core";
import { RequirementService } from "./requirement.service";
import { Observable, Subject } from "rxjs";
import { Requirement } from "../models/requirement";
import { RequirementDescriptionTemplate } from "../models/requirement-description-template/requirement-description-template";
import { RequirementTemplateService } from "./requirement-template.service";

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

  // local requirement description templates
  requirementDescriptionTemplates$: Observable<RequirementDescriptionTemplate[]>;

  constructor(
    private requirementService: RequirementService,
    private requirementTemplateService: RequirementTemplateService
  ) {

    // initialize data
    this.requirements$ = this.requirementService.requirements$;
    this.selectedRequirement$ = new Subject<Requirement>();
    this.requirementDescriptionTemplates$ = this.requirementTemplateService.getRequirementTemplates();
  }
}
