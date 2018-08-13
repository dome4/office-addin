import { Component, OnInit, OnDestroy } from '@angular/core';
import { Requirement } from '../models/requirement';
import { Subscription } from 'rxjs';
import { StoreService } from '../services/store.service';
import { RequirementService } from '../services/requirement/requirement.service';
import { OfficeService } from '../services/office-api/office.service';
import { OoxmlParser } from '../services/office-api/ooxml-parser.service';
import * as _ from 'lodash';

// Office variables
declare let Office: any;

@Component({
  selector: 'app-xml',
  templateUrl: './xml.component.html',
  styleUrls: ['./xml.component.css']
})
export class XmlComponent implements OnInit, OnDestroy {

  // in dropdown selected requirement
  public selectedRequirement: Requirement = null;

  // subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private storeService: StoreService,
    private requirementService: RequirementService,
    private officeService: OfficeService,
    private xmlParser: OoxmlParser
  ) { }

  ngOnInit() {
    // subscribe to selected requirement
    this.subscriptions.push(
      this.storeService.selectedRequirement$.subscribe((requirement: Requirement) => {
        this.selectedRequirement = requirement;
      })
    );
  }

  ngOnDestroy() {
    // unsubscribe all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * insert in app created requirement in Word document
   *
   */
  insertRequirementFromApp() {

    // local variable
    let requirement = _.cloneDeep(this.selectedRequirement);

    this.requirementService.getStringFromRequirement(requirement).subscribe((string: string) => {

      this.officeService.getOoxml().subscribe((xml: string) => {

        // search in xml for current requirement
        if (this.officeService.documentIncludesRequiremntId(xml, requirement._id)) {

          // array of currently defined placeholders in requirement template
          let richTextElements = [
            { id: `requirement_${requirement._id}_id`, value: requirement._id },
            { id: `requirement_${requirement._id}_version`, value: requirement.version.toString() },
            { id: `requirement_${requirement._id}_name`, value: requirement.name },
            { id: `requirement_${requirement._id}_duration`, value: requirement.duration.toString() },
            { id: `requirement_${requirement._id}_description`, value: string }
          ];

          // ToDo put all variables of the requirement model as rich text element in the specification
          // template and handle them here

          // go through all parts
          richTextElements.forEach(element => {

            // add binding
            this.officeService.addBindingFromNamedItem(element.id, Office.BindingType.Text, element.id, () => {

              // set value
              this.officeService.setRichTextElementContent(element.id, 'text', element.value);
            });
          });

        } else {
          // insert requirement in document

          let params = {
            counter: '2', // ToDo set counter
            requirement: {
              id: requirement._id,
              version: requirement.version,
              name: requirement.name,
              duration: requirement.duration,
              description: string
            }
          };

          // insert new requiremnt in word xml document
          this.officeService.insertNextRequirement(params);
        }
      });
    }, (error) => {
      console.log(error);
    });
  }

  /**
   * insert empty specification sheet in Word
   *
   */
  insertSpecificationSheet() {

    this.subscriptions.push(
      this.xmlParser.loadTemplate('specification-sheet.template', {}).subscribe((template: string) => {

        this.officeService.setOoxml(template);
      })
    );
  }

}
