import { Component, OnInit, OnDestroy } from '@angular/core';
import { Requirement } from '../models/requirement';
import { Subscription, merge } from 'rxjs';
import { StoreService } from '../services/store.service';
import { RequirementService } from '../services/requirement/requirement.service';
import { OfficeService } from '../services/office-api/office.service';
import { OoxmlParser } from '../services/office-api/ooxml-parser.service';
import * as _ from 'lodash';
import { ActivatedRoute, Params } from '@angular/router';

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

  // selected requirement id
  private selectedRequirementId: string;

  // requirements array
  public requirements: Requirement[];

  // subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private storeService: StoreService,
    private requirementService: RequirementService,
    private officeService: OfficeService,
    private xmlParser: OoxmlParser,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {

    // subscribe to requirements and route params
    this.subscriptions.push(
      merge(
        this.storeService.requirements$,
        this.route.params
      )
        .subscribe((data: Requirement[] | Params) => {

          // requirements$ is a BehaviorSubject with null inital value
          if (data) {

            // set new data
            if (data.constructor == Object) {
              // data is of type Params

              // set selected requirement id
              this.selectedRequirementId = data['id'];

            } else if (data.constructor == Array) {
              // data is of type Requirement[]

              // set requirements
              this.requirements = <Requirement[]>data;

            } else {
              throw new Error('RequirementComponent - data is neither of type Requirement[] nor Params');
            }

            // update current data if all observables emitted
            if (this.selectedRequirementId && this.requirements) {

              // set selected requirement
              this.selectedRequirement = this.requirements.find((requirement: Requirement) => requirement._id === this.selectedRequirementId);
            }
          }
        }, (error) => {
          console.log('RequirementComponent - error occurred in ngOnInit()');
          console.log(error);
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

    // ToDo save subscription
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
