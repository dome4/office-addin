import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { RequirementService } from '../services/requirement.service';
import { Requirement } from '../models/requirement';
import { Observable, Subscription } from 'rxjs';
import 'rxjs';
import { trigger, transition, animate, style, animateChild } from '@angular/animations';
import { FormControl, FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { OfficeService } from '../services/office-api/office.service';
import { RequirementTemplatePart } from '../models/requirement-template-part';

// js variable
//declare var document: any;

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
export class RequirementComponent implements OnInit, AfterViewInit, OnDestroy {

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

  // subscriptions
  private subscriptions: Subscription[] = [];

  // requirement template parts of the current selected requirement
  private requirementTemplateParts: RequirementTemplatePart[] = [
    {
      _id: "5b18f71e9b25ea1be43327e3",
      next: null,
      version: 1.2,
      value: "Erster Schablonen-Knoten",
      type: "dropdown",
      head: true
    },
    {
      _id: "5b18f71e9b25ea1be43327e4",
      next: "5b18f71e9b25ea1be43327e3",
      version: 1,
      value: "Zweiter Schablonen-Knoten",
      type: "dropdown",
      head: false
    },
    {
      _id: "5b18f71e9b25ea1be43327e5",
      next: "5b18f71e9b25ea1be43327e4",
      version: 1,
      value: "Dritter Schablonen-Knoten",
      type: "fill in",
      head: false
    }
  ];

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

    this.subscriptions.push(
      this.requirements$.subscribe(
        (requirements: Requirement[]) => {
          this.requirements = requirements;
        },
        (error) => {
          console.log(error);
        }
      )
    );
  }

  /*
   *
   * js debug area - start
   *
   */
  ngAfterViewInit() {

    // das hier ist mein requirement template, die requirement template part types sind die eleemtTypes
    const ReqElementTypes = {
      'system': {
        'elementType': 'input',
        'value': '',
        'placeholder': 'Systemname',
        'options': [],
        'children': [],
        'next': ['priority'], // ist das so clever, wenn in next nur der Typ des Feldes steht? !!!!!!!!!!!!!!! vor allem muss das nicht immer so sein
      },
      'priority': {
        'elementType': 'select',
        'value': '',
        'placeholder': '',
        'options': ['muss', 'soll', 'kann'],
        'children': [],
        'next': ['table_f_o_b'],
      },
      'table_f_o_b': {
        'elementType': 'table',
        'value': '',
        'placeholder': '',
        'options': [],
        'children': ['empty', 'actor', 'ability'],
        'next': [], // table has no following elements, its children have them
      },
      'empty': {
        'elementType': 'text',
        'value': '--',
        'placeholder': '',
        'options': [],
        'children': [],
        'next': ['object'],
      },
      'actor': {
        'elementType': 'input',
        'value': '',
        'placeholder': 'Akteur',
        'options': [],
        'children': [],
        'next': ['object'],
      },
      'ability': {
        'elementType': 'text',
        'value': 'faehig sein',
        'placeholder': '',
        'options': [],
        'children': [],
        'next': ['object'],
      },
      'object': {
        'elementType': 'input',
        'value': '',
        'placeholder': 'Objekt',
        'options': [],
        'children': [],
        'next': [],
      },
    }

    let reqElements = document.getElementsByClassName('reqelement')

    /**
     * Function: onfocus listener for elements of the class '.reqelement'
     * 
     * adds next ReqElements to the parent if it not already exist
     * 
     */
    Array.from(reqElements).forEach(item => {
      item.addEventListener('focus', () => {

        // requirement attributes
        let requirementId: string = '';
        let requirementType: string = '';

        // id attribute is requirement id + '_' + requirement type
        let idString = item.getAttribute('id');

        // handle string
        let idStringArray: Array<string> = idString.split('_');
        if (idStringArray.length > 1) {
          requirementId = idStringArray[0]; // requirement id
          requirementType = idStringArray[1]; // type of the input field -> see types above
        }

        //console.log('fct: .reqelement-listener: selected: ' + selectedID + ' ,ReqElementType with requirementID: ' + selectedReqID)
        let requirementPart = ReqElementTypes[requirementType];


        /*

        !! ToDo: parent can also be a container !! -> e.g. '<Akteur> die Moeglichkeit bieten' -> two sub inputs
	      // does not work if element is in table yet
        */

        // get parent ID
        var parentId = item.parentElement.getAttribute('id');
        // should be the same as reqID 
        // container has only the id of the requirement not the element type

        // debug flag
        console.log('debug area');
        console.log(item.parentElement);
        console.log('debug area');

        // add next requirement part
        if (item.getAttribute('addedNext') === null) {
          addNextReqElements(requirementId, requirementPart, parentId);
          item.setAttribute('addedNext', 'added'); // flag to debug if next element was added
        }



      })
    })


    /**
     * Function: addNextReqElements
     * 
     * adds all next ReqElements of reqelement
     * 
     * @param {string} reqID
     * @param {json-ReqElement} reqelement
     * @param {string} parentID
     */
    let addNextReqElements = (requirementId, requirementPart, parentId) => {
      for (let i = 0; i < requirementPart.next.length; i++) { // loop due to next is an array with the following input types
        var nextId = requirementId + '_' + requirementPart.next[i]; // id is requirement id + type
        if (document.getElementById(nextId) == null) { // if following input does not exist yet
          //console.log('fct: addNextReqElements: adding a new reqelement using addNewReqElement with following nextElementname: ' + reqelement.next[i]);
          var newElement = getNewReqElement(requirementId, requirementPart.next[i], parentId);
          var parent = document.getElementById(parentId);

          console.log(parent); // ToDo fix parent error

          parent.appendChild(newElement); // line causes TypeError - parent is null
        }
      }

    }

    /**
     * Function: getNewReqElement
     * 
     * adds a new ReqElement to the DOM
     * 
     * @param {string} reqID
     * @param {string} reqelement_Type
     * @param {string} parentID
     */
    let getNewReqElement = (requirementId: string, reqelement_Type: string, parentId: string) => {

      // get requirement part properties from array
      var requirementPart = ReqElementTypes[reqelement_Type]; // input type with attributes

      // create new element to insert
      var newElement = null;

      // handle element type -> ToDo add id and added attributes
      switch (requirementPart.elementType) {
        case 'select':
          newElement = document.createElement('select');

          // create select options
          for (var i = 0; i < requirementPart.options.length; i++) {
            var option = document.createElement('option');
            option.setAttribute('value', requirementPart.options[i]);
            option.innerHTML = requirementPart.options[i];
            newElement.appendChild(option);
          }
          break;
        case 'text':
          newElement = document.createElement('div');
          newElement.innerHTML = requirementPart.value;
          break;
        case 'input':
          newElement = document.createElement('input');
          newElement.placeholder = requirementPart.placeholder;
          break;
        case 'table':
          // ToDo inspect
          newElement = document.createElement('table');
          newElement.setAttribute('style', 'display:inline;'); // ToDo check if necessary

          // add children elements
          for (var i = 0; i < requirementPart.children.length; i++) {

            var childReqElementType = requirementPart.children[i];

            // create new child element -> parent of it is current element
            var newChildElement = getNewReqElement(requirementId, childReqElementType, requirementId);
            var newRow = document.createElement('tr');
            var newCell1 = document.createElement('td');
            var newCell2 = document.createElement('td');
            newCell1.setAttribute('align', 'center');
            newCell1.appendChild(newChildElement);

            // add new button
            // ToDo check what this method does
            //newCell2.appendChild(getNewButton(requirementId, childReqElementType, parentId));


            newRow.appendChild(newCell1);
            newRow.appendChild(newCell2);
            newElement.appendChild(newRow);
          }
          break;
        default:
          window.alert('fct: addNewReqElement: chosen type not implemented: ' + requirementPart.elementType);
      }

      // set id and classname
      newElement.id = requirementId + '_' + reqelement_Type;
      newElement.className = 'reqelement';

      return newElement;

    }

  }
  /*
   *
   * js debug area - end
   *
   */

  ngOnDestroy() {

    // unsubscribe all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /*
   * change selectedRequirement-variable
   */
  onSelectedRequirement(requirement: Requirement) {

    // set selected requirement
    this.selectedRequirement = requirement;

    // set requirement template parts
    this.requirementTemplateParts = this.selectedRequirement.descriptionParts;

    console.log('requirement selected');
    console.log(this.selectedRequirement);
    console.log(this.requirementTemplateParts);

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
}
