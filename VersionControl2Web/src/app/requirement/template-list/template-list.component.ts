import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { RequirementDescriptionTemplate } from '../../models/requirement-description-template/requirement-description-template';
import { StoreService } from '../../services/store.service';
import { Requirement } from '../../models/requirement';
import { RequirementTemplateService } from '../../services/requirement-template.service';

@Component({
  selector: 'app-template-list',
  templateUrl: './template-list.component.html',
  styleUrls: ['./template-list.component.css']
})
export class TemplateListComponent implements OnInit {

  // requirement description templates array
  public requirementDescriptionTemplates: RequirementDescriptionTemplate[];

  // subscriptions
  private subscriptions: Subscription[] = [];

  // constructor
  constructor(
    private storeService: StoreService,
    private templateService: RequirementTemplateService
  ) { }

  // requirement to create
  public requirement: Requirement;

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
  }

  /**
   * execute method whenever a template is clicked on
   * 
   * @param templateId requirement description template id
   */
  onTemplateSelected(template: RequirementDescriptionTemplate) {
    console.log(`card cliecked: ${template}`);

    this.templateService.getRequirementTemplate(template).subscribe(

      console.log
    );
  }

}
