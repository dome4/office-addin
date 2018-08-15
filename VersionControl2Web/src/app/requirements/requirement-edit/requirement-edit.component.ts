import { Component, OnInit } from '@angular/core';
import { StoreService } from '../../services/store.service';
import { RequirementDescriptionTemplate } from '../../models/requirement-description-template/requirement-description-template';
import { RequirementDescriptionTemplateService } from '../../services/requirement-description-template.service';
import { Requirement } from '../../models/requirement';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { RequirementService } from '../../services/requirement/requirement.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-requirement-edit',
  templateUrl: './requirement-edit.component.html',
  styleUrls: ['./requirement-edit.component.css']
})
export class RequirementEditComponent implements OnInit {

  // subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private storeService: StoreService,
    private templateService: RequirementDescriptionTemplateService,
    private requirementService: RequirementService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  /**
   * execute method whenever a template is clicked on
   * 
   * @param templateId requirement description template id
   */
  onTemplateSelected(template: RequirementDescriptionTemplate) {

    // app is loading
    this.storeService.appLoading$.next(true);

    // get selected requirement description template (http observable)
    this.templateService.getRequirementTemplate(template).subscribe((template: RequirementDescriptionTemplate) => {

      // create new requirement
      let newRequirement = new Requirement();

      // temp name to display in dropdown
      newRequirement.name = 'new created Requirement';

      // set choosen template to new requirement
      newRequirement.descriptionTemplate = _.cloneDeep(template);

      // create new requirement template parts and emit modified requirement as selected requirement
      this.subscriptions.push(
        this.requirementService.createEmptyRequirementFromTemplate(newRequirement)
          .subscribe((requirement: Requirement) => {

            // save requirement in database (http observable)
            this.requirementService.addRequirement(requirement)
              .subscribe(
                (savedRequirement: Requirement) => {

                  // reload current requirements
                  // necessary to go through mapping with all requirements
                  this.requirementService.reloadRequirements()
                    .subscribe(requirements => {

                      // app loading finished
                      this.storeService.appLoading$.next(false);

                      // navigate to new created requirement
                      this.router.navigate(['/', 'requirements', savedRequirement._id]);

                    });
                }, (error) => {
                  console.log('onTemplateSelected() - new created requirement could not be saved');
                  console.log(error);

                  // app loading finished
                  this.storeService.appLoading$.next(false);
                });
          })
      );
    });
  }

}
