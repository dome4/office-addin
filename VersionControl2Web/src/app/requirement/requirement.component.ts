import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { RequirementService } from '../services/requirement.service';
import { Requirement } from '../models/requirement';
import { Subscription } from 'rxjs';
import { RequirementTemplatePart } from '../models/requirement-template-part';
import { RequirementDescriptionTemplate } from '../models/requirement-description-template';

// js variable
//declare var document: any;

@Component({
  selector: 'app-requirement',
  templateUrl: './requirement.component.html',
  styleUrls: ['./requirement.component.css']
})
export class RequirementComponent implements OnInit, AfterViewInit, OnDestroy {

  /*
   * in dropdown selected requirement
   */
  public selectedRequirement: Requirement = null;

  /*
   * requirements array
   */
  public requirements: Requirement[] = [];

  // subscriptions
  private subscriptions: Subscription[] = [];

  // requirement template parts of the current selected requirement
  private requirementTemplateParts: RequirementTemplatePart[] = [];

  // requirement container
  @ViewChild('requirementContainer') requirementContainer: ElementRef;

  // ToDo validation Funktion schreiben -> hilft auch beim Aufbau der Anforderung
  private descriptionTemplate: RequirementDescriptionTemplate = null;

  // variable shows if current requirement template is valid
  public requirementTemplateIsValid: boolean;

  /*
   * constructor
   */
  constructor(private requirementService: RequirementService) { }

  ngOnInit() {

    // subscribe to requirements
    this.subscriptions.push(
      this.requirementService.getRequirements().subscribe(
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
    /*
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


        // !! ToDo: parent can also be a container !! -> e.g. '<Akteur> die Moeglichkeit bieten' -> two sub inputs
	      // does not work if element is in table yet


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
    */


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

    // set description template
    this.descriptionTemplate = this.selectedRequirement.descriptionTemplate;

    // set container id
    this.requirementContainer.nativeElement.setAttribute('id', this.selectedRequirement._id);

    // re-render template parts of current selected requirement
    this.renderTemplateParts();

    // debug
    console.log('requirement selected');
    console.log(this.selectedRequirement);
    console.log(this.requirementTemplateParts);
    // debug

    // ToDo: update form

  }

  /**
  *
  * render template parts of selecte requirement
  *
  */
  renderTemplateParts() {

    // delete content of current requirement-container
    // ToDo: fix issue -> native elemement is set if a requirement is set twice
    this.requirementContainer.nativeElement.innerHTML = '';

    // create new template parts and add them to the DOM
    // ToDo: validation that the parts are in the correct order -> validate with next-property
    this.requirementTemplateParts.forEach(part => {
      let newPart = this.createNewRequirementTemplatePart(part);

      // add new created element as the last child of the requirement container to the DOM
      this.requirementContainer.nativeElement.appendChild(newPart);
    });

  }

  /**
   * creates new element
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

        // event listener
        newPart.addEventListener('change', this.onRequirementPartChanged)
        break;

      case 'text':
        newPart = document.createElement('div');
        newPart.innerHTML = templatePart.value;
        newPart.setAttribute('style', 'display:inline;');
        break;

      case 'input':
        newPart = document.createElement('input');
        newPart.placeholder = templatePart.value; // ToDo placeholder has to be definied in the description template

        // event listener
        newPart.addEventListener('change', this.onRequirementPartChanged)
        break;

      case 'table':
        newPart = this.tableHandler(templatePart, newPart);
        break;

      case 'wrapper':
        newPart = this.wrapperHandler(templatePart, newPart);
        break;

      default:
        console.log('createNewRequirementTemplatePart: chosen type not implemented: ' + templatePart.type);
    }

    // set id and classname
    newPart.id = templatePart._id + '_' + templatePart.type;
    newPart.classList.add('requirement-part')

    return newPart;

  }

  /**
   * create table and its sub elements
   * 
   * @param templatePart
   * @param newPart
   */
  tableHandler(templatePart: RequirementTemplatePart, newPart: any) {

    // create new dom node
    newPart = document.createElement('table');
    newPart.setAttribute('style', 'display:inline;'); // ToDo check if necessary


    // add children elements
    for (var i = 0; i < templatePart.value.length; i++) {

      // get one object of the array -> type { type: '', value: '' }
      var tableChildElement = JSON.parse(templatePart.value[i]);

      // create new child element
      // ToDo handle errors if array is not valid
      var newChildElement = this.createNewRequirementTemplatePart(tableChildElement);

      // create new row
      var newRow = document.createElement('tr');

      // event listener
      newRow.addEventListener('click', this.onRequirementPartChanged)

      // value cell
      var newCell1 = document.createElement('td');
      newCell1.setAttribute('align', 'center');

      // append new created child element
      newCell1.appendChild(newChildElement);

      // button cell
      var newCell2 = document.createElement('td');
      // add new button
      // ToDo check what this method does
      //newCell2.appendChild(getNewButton(requirementId, childReqElementType, parentId));

      // append new created elements
      newRow.appendChild(newCell1);
      newRow.appendChild(newCell2);
      newPart.appendChild(newRow);
    }

    return newPart;
  }

  /**
   * create the wrapper div and its sub elements
   * 
   * @param templatePart
   * @param newPart
   */
  wrapperHandler(templatePart: RequirementTemplatePart, newPart: any) {

    // create new dom node
    newPart = document.createElement('div');
    newPart.style.display = 'inline';

    // add children elements
    for (var i = 0; i < templatePart.value.length; i++) {

      var tableChildElement = null;

      /*
       * check if the value is already parsed
       */
      if (
        templatePart.value[i] !== undefined &&
        templatePart.value[i] !== null &&
        templatePart.value[i].constructor == String
      ) {

        // String check
        tableChildElement = JSON.parse(templatePart.value[i]);

      } else if (
        templatePart.value[i] !== undefined &&
        templatePart.value[i] !== null &&
        templatePart.value[i].constructor == Object
      ) {

        // object check
        tableChildElement = templatePart.value[i];

      } else {
        console.log('parsing error');
      }

      // create new child element
      // ToDo handle errors if array is not valid
      var newChildElement = this.createNewRequirementTemplatePart(tableChildElement);

      // append new elements to wrapper
      newPart.appendChild(newChildElement);

    }

    return newPart;

  }

  onRequirementPartChanged() {

    // debug
    console.log(event);

    // ToDo: write function
  }

  /**
   * method should be executed everytime the requirement changes
   *
   */
  onRequirementChanged() {

    this.requirementService.validateRequirementTemplate(this.requirementTemplateParts, this.descriptionTemplate);
  }
}
