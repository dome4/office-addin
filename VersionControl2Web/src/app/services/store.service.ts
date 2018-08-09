import { Injectable } from "@angular/core";
import { RequirementService } from "./requirement.service";
import { Observable, Subject } from "rxjs";
import { Requirement } from "../models/requirement";
import { RequirementDescriptionTemplate } from "../models/requirement-description-template/requirement-description-template";
import { RequirementDescriptionTemplateService } from "./requirement-description-template.service";

/**
 * central service where all observables are stored
 *  
 */
@Injectable()
export class StoreService {

  // local requirements
  public requirements$: Subject<Requirement[]>;

  // currently selected requirement
  public selectedRequirement$: Subject<Requirement>;

  // local requirement description templates
  public requirementDescriptionTemplates$: Observable<RequirementDescriptionTemplate[]>;

  constructor(
    private requirementService: RequirementService,
    private requirementTemplateService: RequirementDescriptionTemplateService
  ) {

    // initialize data
    this.requirements$ = this.requirementService.requirements$;
    this.selectedRequirement$ = this.requirementService.selectedRequirement$;
    this.requirementDescriptionTemplates$ = this.requirementTemplateService.requirementDescriptionTemplates$;
  }
}
