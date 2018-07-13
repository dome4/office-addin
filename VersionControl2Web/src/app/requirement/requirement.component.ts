import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { RequirementService } from '../services/requirement.service';
import { Requirement } from '../models/requirement';
import { Observable } from 'rxjs';
import 'rxjs';
import { trigger, transition, animate, style, animateChild } from '@angular/animations';
import { FormControl, FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { OfficeService } from '../services/office.service';

// Office variable
declare let Office: any;

@Component({
  animations: [
    trigger('expandNodeLeft', [
      transition('void => *', [
        style({
          transform: 'translateX(100px)',
          opacity: 0
        }),
        animate(1000, style({
          transform: 'translateX(0)',
          opacity: 1
        }))
      ]),
      transition('* => void', [
        style({
          transform: 'translateX(0)',
          opacity: 1
        }),
        animate(1000, style({
          transform: 'translateX(100px)',
          opacity: 0
        }))
      ])
    ]),
    trigger('expandNodeRight', [
      transition('void => *', [
        style({
          transform: 'translateX(-100px)',
          opacity: 0
        }),
        animate(1000, style({
          transform: 'translateX(0)',
          opacity: 1
        }))
      ]),
      transition('* => void', [
        style({
          transform: 'translateX(0)',
          opacity: 1
        }),
        animate(1000, style({
          transform: 'translateX(-100px)',
          opacity: 0
        }))
      ])
    ]),
    trigger('expandNodeMiddle', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(1000, style({ opacity: 1 }))
      ]),
      transition('* => void', [
        style({ opacity: 1 }),
        animate(1000, style({ opacity: 0 }))
      ])
    ])
  ],
  selector: 'app-requirement',
  templateUrl: './requirement.component.html',
  styleUrls: ['./requirement.component.css']
})
export class RequirementComponent implements OnInit {

  public state: string = 'active';

  /*
   * in dropdown selected requirement
   */
  public selectedRequirement: Requirement = null;

  /*
   * requirements observable
   */
  private requirements$: Observable<Requirement[]> = null;

  /*
   * requirements array
   */
  public requirements: Requirement[] = [];

  // reactive form
  public requirementForm: FormGroup;

  /*
   * constructor
   */
  constructor(private requirementService: RequirementService,
              private fb: FormBuilder,
              private officeService: OfficeService) {
    this.createEmptyForm();
  }

  ngOnInit() {
    this.requirements$ = this.requirementService.getRequirements();

    this.requirements$.subscribe(
      (requirements: Requirement[]) => {
        this.requirements = requirements;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  /*
   * change selectedRequirement-variable
   */
  onSelectedRequirement(requirement: Requirement) {

    // set selected requirement
    this.selectedRequirement = requirement;
    console.log('requirement selected');
    console.log(this.selectedRequirement);

    // ToDo: update form

  }

  onSelected(event) {
    console.log(event.target);
  }

  onChangeState() {
    this.state == 'active' ? this.state = 'inactive' : this.state = 'active';
  }

  // reactive form
  createEmptyForm() {  

    this.requirementForm = this.fb.group({
      fullName: ['', Validators.required],
      address: this.fb.group({
        postalCode: ['', Validators.required],
        country: ['', Validators.required]
      }),
      templateParts: this.fb.array([
        this.initTemplateParts(),
      ])
    });
  }

  initTemplateParts() {
    // initialize template parts
    return this.fb.group({
      version: [''],
      value: ['']
    });
  }

  submitted = false;
  onSubmit() {
    console.log('form submitted');
  }

  addNewEmployeeAddress() {
    this.requirementForm.reset();
    this.submitted = false;
  }

  addEmptyTemplatePart() {
    // add address to the list
    const control = <FormArray>this.requirementForm.controls['templateParts'];
    control.push(this.initTemplateParts());
  }

  removeTemplatePart(index: number) {
    // remove address from the list
    const control = <FormArray>this.requirementForm.controls['templateParts'];
    control.removeAt(index);
  }

  // ToDo: get / set values from requirement in form

  onMouseEnter(event: any) {
    event.target.classList.add('label'); // create labels of text

    //event.target.style.backgroundColor = '#eee';
    //event.target.style.borderRadius = '8px';

  }

  onMouseLeave(event: any) {
    event.target.classList.remove('label'); // create labels of text

    //event.target.style.backgroundColor = 'transparent'; 
    //event.target.style.borderRadius = '0px';
  }

  // access office document
  onAccessDocument() {

    /*
     * changes in the rich text field 'input' are submitted to the rich text field 'message' with event handler
     *
     */

    // add text binding to message text box
    //Office.context.document.bindings.addFromNamedItemAsync('message', Office.BindingType.Text, { id: 'message'}, (asyncResult) => {

    //  if (asyncResult.status == Office.AsyncResultStatus.Failed) {
    //    console.log('Biding - Action failed. Error: ' + asyncResult.error.message);
    //  } else {
    //    console.log('Binding - Added new binding with type: ' + asyncResult.value.type + ' and id: ' + asyncResult.value.id);
    //  }
    //});

    this.officeService.addBindingFromNamedItem('message', Office.BindingType.Text, 'message');

    // add event handler to input text field and display text in message text field
    Office.context.document.bindings.addFromNamedItemAsync('input', Office.BindingType.Text, { id: 'input' }, (asyncResult) => {

      if (asyncResult.status == Office.AsyncResultStatus.Failed) {
        console.log('Biding - Action failed. Error: ' + asyncResult.error.message);
      } else {
        console.log('Binding - Added new binding with type: ' + asyncResult.value.type + ' and id: ' + asyncResult.value.id);

        // add handler
        Office.select("bindings#input").addHandlerAsync(Office.EventType.BindingDataChanged, (result) => {

          // get data from input and set to message
          Office.select("bindings#input").getDataAsync({ coercionType: "text" },
            (inputText) => {
              if (inputText.status == Office.AsyncResultStatus.Failed) {
                console.log('Error: ' + inputText.error.message);
              } else {
                Office.select("bindings#message").setDataAsync(inputText.value, { coercionType: "text" },
                  (asyncResult) => {
                    if (asyncResult.status == Office.AsyncResultStatus.Failed) {
                      console.log('Error: ' + asyncResult.error.message);
                    }
                  });
              }
            });
        });
      }
    });
  }
}
