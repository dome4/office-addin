import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { RequirementService } from '../services/requirement.service';
import { Requirement } from '../models/requirement';
import { Observable, Subscription, Observer, BehaviorSubject } from 'rxjs';
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
      type: "text",
      head: false
    },
    {
      _id: "5b18f71e9b25ea1be43327e5",
      next: "5b18f71e9b25ea1be43327e4",
      version: 1,
      value: "Dritter Schablonen-Knoten",
      type: "input",
      head: false
    }
  ];

  // requirement container
  @ViewChild('requirementContainer') requirementContainer: ElementRef;

  // description template -> ToDo !important! Datentyp muss noch in Backend angelegt werden
  // ToDo validation Funktion schreiben -> hilft auch beim Aufbau der Anforderung
  private descriptionTemplate = {
    _id: '32534',
    version: 1.0,
    name: 'FunktionsMASTER ohne Bedingung',
    template: [
      {
        type: 'input',
        value: '<System>'
      },
      {
        type: 'dropdown',
        value: [
          'MUSS',
          'SOLLTE',
          'WIRD'
        ]
      },
      {
        type: 'table',
        value: [
          [
            {
              type: 'text',
              value: '-'
            }
          ],
          [
            {
              type: 'input',
              value: '<Akteur>'
            },
            {
              type: 'text',
              value: 'die Möglichkeit bieten'
            }
          ],
          [
            {
              type: 'text',
              value: 'fähig sein'
            }
          ]
        ]
      },
      {
        type: 'input',
        value: '<Objekt>'
      },
      {
        type: 'input',
        value: '<Prozesswort>'
      }
    ]
  }

  // variable shows if current requirement template is valid
  public requirementTemplateIsValid: boolean;

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

    // subscribe to requirement template validator
    this.subscriptions.push(
      this.requirementService.requirementTemplateIsValid$.subscribe(
        (validation: boolean) => this.requirementTemplateIsValid = validation
      )
    );
  }

  /*
   *
   * js debug area - start
   *
   */
  ngAfterViewInit() {

    // render template parts of current selected requirement
    this.renderTemplateParts();



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

    let reqElements = document.getElementsByClassName('requirement-part')

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
          //addNextReqElements(requirementId, requirementPart, parentId);
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

    /*
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

    */

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

    // re-render template parts of current selected requirement
    this.renderTemplateParts();

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

   /**
   *
   * render template parts of selecte requirement
   *
   */
  renderTemplateParts() {

    // delete content of current requirement-container
    this.requirementContainer.nativeElement.innerHTML = '';

    // create new template parts and add them to the DOM
    // ToDo: validation that the parts are in the correct order -> validate with next-property
    this.requirementTemplateParts.forEach(part => {
      this.createNewRequirementTemplatePart(part)
    });

  }

  /**
   * creates new element and appends it as the last child of the requirement container to the DOM
   * 
   * @param templatePart requirement template part
   */
  createNewRequirementTemplatePart(templatePart: RequirementTemplatePart) {
    //let getNewReqElement = (requirementId: string, reqelement_Type: string, parentId: string) => {

    // create new element to insert
    let newPart = null;

    // handle element type -> ToDo add id and added attributes
    switch (templatePart.type) {
      case 'dropdown':
        newPart = document.createElement('select');

        // create select options
        for (var i = 0; i < templatePart.value.length; i++) {
          var option = document.createElement('option');
          option.setAttribute('value', templatePart.value[i]);
          option.innerHTML = templatePart.value[i];
          newPart.appendChild(option);
        }
        break;
      case 'text':
        newPart = document.createElement('div');
        newPart.innerHTML = templatePart.value;
        newPart.setAttribute('style', 'display:inline;');
        break;
      case 'input':
        newPart = document.createElement('input');
        newPart.placeholder = templatePart.value; // ToDo placeholder has to be definied in the description template
        break;


      // ToDo make datatype table
      /*
      case 'table':
        // ToDo inspect
        newPart = document.createElement('table');
        newPart.setAttribute('style', 'display:inline;'); // ToDo check if necessary
  
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
          newPart.appendChild(newRow);
        }
        break;
        */

      default:
        window.alert('fct: addNewReqElement: chosen type not implemented: ' + templatePart.type);
    }

    // set id and classname
    newPart.id = templatePart._id + '_' + templatePart.type;
    newPart.className = 'requirement-part';

    // add new created element as the last child of the requirement container to the DOM
    this.requirementContainer.nativeElement.appendChild(newPart);

  }
}
