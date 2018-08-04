import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { RequirementService } from '../services/requirement.service';
import { OfficeService } from '../services/office-api/office.service';
import { trigger, transition, style, animate } from '@angular/animations';

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
  selector: 'app-form-debug',
  templateUrl: './form-debug.component.html',
  styleUrls: ['./form-debug.component.css']
})
export class FormDebugComponent implements OnInit {

  // state variable
  public state: string = 'active';

  // reactive form
  public requirementForm: FormGroup;

  constructor(private requirementService: RequirementService,
    private fb: FormBuilder,
    private officeService: OfficeService) {
    this.createEmptyForm();
  }

  ngOnInit() {
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
}
