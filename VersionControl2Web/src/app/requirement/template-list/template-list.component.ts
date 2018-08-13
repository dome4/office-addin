import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { RequirementDescriptionTemplate } from '../../models/requirement-description-template/requirement-description-template';
import { StoreService } from '../../services/store.service';
import { Requirement } from '../../models/requirement';
import { RequirementService } from '../../services/requirement/requirement.service';
import { RequirementDescriptionTemplateService } from '../../services/requirement-description-template.service';

@Component({
  selector: 'app-template-list',
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.css']
})
export class TemplateListComponent implements OnInit, OnDestroy {

  // requirement description templates array
  public requirementDescriptionTemplates: RequirementDescriptionTemplate[];

  // subscriptions
  private subscriptions: Subscription[] = [];

  // constructor
  constructor(
    private storeService: StoreService,
    private templateService: RequirementDescriptionTemplateService,
    private requirementService: RequirementService
  ) { }

  // requirement to create
  public requirement: Requirement;

  // requirements
  public requirements: Requirement[];

  /**
   * ngOnInit
   *
   */
  ngOnInit() {

    // subscribe to requirement description templates
    this.subscriptions.push(
      this.storeService.requirementDescriptionTemplates$.subscribe(
        (templates: RequirementDescriptionTemplate[]) => this.requirementDescriptionTemplates = templates
      )
    );

    // subscribe to selected requirement
    this.subscriptions.push(
      this.storeService.selectedRequirement$.subscribe((requirement: Requirement) => this.requirement = requirement)
    );

    // subscribe to requirements
    this.subscriptions.push(
      this.storeService.requirements$.subscribe((requirement: Requirement[]) => this.requirements = requirement)
    );
  }

  ngOnDestroy() {
    // unsubscribe all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * execute method whenever a template is clicked on
   * 
   * @param templateId requirement description template id
   */
  onTemplateSelected(template: RequirementDescriptionTemplate) {

    // get selected requirement description template (http observable)
    this.templateService.getRequirementTemplate(template).subscribe((template: RequirementDescriptionTemplate) => {

      // local reference
      let requirement = this.requirement;

      // debug -> if in requirement-component wird so geskipped -> einfach requirement davor abspeichern
      requirement._id = 'test'

      // set choosen template to new requirement
      requirement.descriptionTemplate = template;

      // create new requirement template parts and emit modified requirement as selected requirement
      this.subscriptions.push(
        this.requirementService.createEmptyRequirementFromTemplate(requirement)
          .subscribe((requirement: Requirement) => {

            // emit selected requirement
            this.storeService.selectedRequirement$.next(requirement);
          })
      );
    });
  }
}
