import { Injectable } from "@angular/core";
import { RequirementService } from "./requirement/requirement.service";
import { Observable, Subject, BehaviorSubject } from "rxjs";
import { Requirement } from "../models/requirement";
import { RequirementDescriptionTemplate } from "../models/requirement-description-template/requirement-description-template";
import { RequirementDescriptionTemplateService } from "./requirement-description-template.service";
import { RequirementTemplatePartService } from "./requirement-template-part.service";

/**
 * central service where all observables are stored
 *  
 */
@Injectable()
export class StoreService {

  // local requirements
  public requirements$: BehaviorSubject<Requirement[]>;

  // currently selected requirement
  public selectedRequirement$: Subject<Requirement>;

  // local requirement description templates
  public requirementDescriptionTemplates$: Observable<RequirementDescriptionTemplate[]>;

  // indicate if requirement template parts were changed
  public requirementTemplatePartsModified$: BehaviorSubject<boolean>;

  // indicate if the app is loading
  public appLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private requirementService: RequirementService,
    private requirementDescriptionTemplateService: RequirementDescriptionTemplateService,
    private requirementTemplatePartService: RequirementTemplatePartService
  ) {

    // initialize data
    this.requirements$ = this.requirementService.requirements$;
    this.selectedRequirement$ = this.requirementService.selectedRequirement$;
    this.requirementDescriptionTemplates$ = this.requirementDescriptionTemplateService.requirementDescriptionTemplates$;
    this.requirementTemplatePartsModified$ = this.requirementTemplatePartService.requirementTemplatePartsModified$;
  }
}
