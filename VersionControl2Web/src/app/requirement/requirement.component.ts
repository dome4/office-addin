import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { RequirementService } from '../services/requirement/requirement.service';
import { Requirement } from '../models/requirement';
import { Subscription, Observable, Observer, BehaviorSubject, from, merge } from 'rxjs';
import { RequirementTemplatePart } from '../models/requirement-template-part';
import { RequirementDescriptionTemplate } from '../models/requirement-description-template/requirement-description-template';
import { RequirementDescriptionTemplatePart } from '../models/requirement-description-template/requirement-description-template-part';
import { StoreService } from '../services/store.service';
import * as _ from 'lodash';
import { RequirementTemplatePartService } from '../services/requirement-template-part.service';
import { concatMap, bufferCount } from 'rxjs/operators';
import { Router, ActivatedRoute, Params } from '@angular/router';

// js variable
//declare var document: any;
// ToDo replace document with Renderer2

@Component({
  selector: 'app-requirement',
  templateUrl: './requirement.component.html',
  styleUrls: ['./requirement.component.css']
})
export class RequirementComponent implements OnInit, OnDestroy {

  /*
   * in dropdown selected requirement
   */
  public selectedRequirement: Requirement = null;

  /*
   * requirements array
   */
  public requirements: Requirement[];

  // selected requirement id
  private selectedRequirementId: string;

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

  // modified template parts to upload
  private modifiedRequirementTemplateParts: RequirementTemplatePart[] = [];

  // component is loading
  public requirementComponentLoadingCompleted$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  /*
   * constructor
   */
  constructor(
    private requirementService: RequirementService,
    private renderer: Renderer2,
    private storeService: StoreService,
    private requirementTemplatePartService: RequirementTemplatePartService,
    private router: Router,
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

          // app is loading
          this.requirementComponentLoadingCompleted$.next(false);

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

              // ToDo run predefined method
              // debug
              this.onSelectedRequirement();
            }

            // app loading completed
            this.requirementComponentLoadingCompleted$.next(true);

          }
        }, (error) => {
          console.log('RequirementComponent - error occurred in ngOnInit()');
          console.log(error);
        })
    );

    // subscribe to requirement template validator
    this.subscriptions.push(
      this.requirementService.requirementTemplateIsValid$.subscribe(
        (validation: boolean) => this.requirementTemplateIsValid = validation
      )
    );
  }

  ngOnDestroy() {

    // unsubscribe all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * update local variables and run methods if selected requirement changes
   *
   */
  onSelectedRequirement() {

    // set requirement template parts
    this.requirementTemplateParts = this.selectedRequirement.descriptionParts;

    // set description template
    this.descriptionTemplate = this.selectedRequirement.descriptionTemplate;

    // update description template to be a list of objects
    this.descriptionTemplate.template = this.descriptionTemplate.template.map(element => this.requirementService.createObject(element));

    // set container id
    this.requirementContainer.nativeElement.setAttribute('id', 'requirementId_' + this.selectedRequirement._id);

    // render selected requirement template
    this.renderRequirementTemplate();

    // debug
    console.log('requirement selected');
    console.log(this.selectedRequirement);
    // debug

    // validate requirement template
    this.requirementService.validateRequirementTemplate(this.requirementTemplateParts, this.descriptionTemplate);

  }

  /**
  *
  * render requirement template
  *
  */
  renderRequirementTemplate() {

    // delete content of current requirement-container
    this.requirementContainer.nativeElement.innerHTML = '';

    // create new DOM elements for the description template
    this.requirementTemplateParts
      .forEach((element: RequirementTemplatePart) => {

        let newPart = this.createNewRequirementTemplatePart(element);

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

    // prevent type errors
    templatePart = this.requirementService.createObject(templatePart);

    // create new element to insert
    let newPart = null;

    // handle element type -> ToDo add id and added attributes
    switch (templatePart.type) {
      case 'dropdown':
        newPart = document.createElement('select');

        // create all select options
        for (var i = 0; i < templatePart.descriptionTemplateValue.length; i++) {
          var option = document.createElement('option');
          option.setAttribute('value', templatePart.value[i]);
          option.innerHTML = templatePart.descriptionTemplateValue[i];

          // set active option
          if (templatePart.descriptionTemplateValue[i].toString() === templatePart.value.toString()) {
            option.selected = true;
          }
          newPart.appendChild(option);
        }

        // event listener
        newPart.addEventListener('change', this.onRequirementPartChanged.bind(this))
        break;

      case 'text':
        newPart = document.createElement('div');
        newPart.innerHTML = templatePart.value;
        newPart.setAttribute('style', 'display:inline;');
        break;

      case 'input':
        newPart = document.createElement('input');
        newPart.placeholder = templatePart.descriptionTemplateValue;
        newPart.value = templatePart.value;

        // event listener
        newPart.addEventListener('change', this.onRequirementPartChanged.bind(this));
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
    newPart.id = templatePart._id;
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
    // descriptionTemplateValue -> all possible options are stored here -> iterate the length often
    for (let i = 0; i < templatePart.descriptionTemplateValue.length; i++) {

      // local variables
      let tableChildElement = templatePart.descriptionTemplateValue[i];
      let newChildElement;

      /*
       * create new DOM element
       * correct data necessary
       *
       * start
       */

      // ToDo implement all subelements of table:
      // wrapper, dropdown, input, text

      // if requirement type === description type -> descriptionTemplateValue param necessary
      if (tableChildElement.type === templatePart.value[0].type) {

        if (
          templatePart.value[0].type === 'text' &&
          tableChildElement.value === templatePart.value[0].value
        ) {
          // table subelement text

          // create new child element of choosen option 
          newChildElement = this.createNewRequirementTemplatePart(templatePart.value[0]);

        } else if (
          templatePart.value[0].type === 'wrapper'
        ) {
          // table subelement wrapper
          // ToDo: the correct wrapper has to be choosen
          // Issue: with the current method only one wrapper per table is allowed

          // create new child element of choosen option 
          newChildElement = this.createNewRequirementTemplatePart(templatePart.value[0]);

        } else {
          // types are equal but values not
          // create new child element of not choosen option 
          newChildElement = this.createNewRequirementTemplatePart(tableChildElement);
        }

      } else {
        // types are not equal
        // render not choosen option

        // clone deep -> prevent side effects
        let descriptionTemplateElement = _.cloneDeep(tableChildElement);

        // handle all subelements of table
        if (tableChildElement.type === 'text') {
          // text

          // change nothing
          // value-property is necessary to render the element
        } else if (tableChildElement.type === 'input') {
          // input

          // set placeholder for creation of subelement
          descriptionTemplateElement.descriptionTemplateValue = _.cloneDeep(descriptionTemplateElement.value);
          descriptionTemplateElement.value = '';
        } else if (tableChildElement.type === 'dropdown') {
          // dropdown

          // set empty array for creation of subelement
          descriptionTemplateElement.descriptionTemplateValue = _.cloneDeep(descriptionTemplateElement.value);
          descriptionTemplateElement.value = [];
        } else if (tableChildElement.type === 'wrapper') {
          // wrapper         

          // changes to descriptionTemplateElement.value would not effect anything
          // because descriptionTemplateElement is a deep clone
          // -> handle wrapper in wrapperHandler()         
        } else {
          // type not supported as subelement of table
          throw new Error(`tableHandler() - type ${templatePart.value[0].type} not supported as subelement of table`);
        }

        // create new child element of not choosen option 
        newChildElement = this.createNewRequirementTemplatePart(descriptionTemplateElement);
      }
      /*
       * end
       */

      // create new row
      let newRow = document.createElement('tr');
      this.renderer.addClass(newRow, 'vc-req-table');

      // local variables
      let descriptionTemplatePart = this.requirementService.createObject(templatePart.descriptionTemplateValue[i]);
      let requirementTemplatePart = this.requirementService.createObject(templatePart.value[0]);

      // set choosen subtype as active
      this.setChoosenTableOptionActive(descriptionTemplatePart, requirementTemplatePart, newRow);

      // event listener
      newRow.addEventListener('click', this.onRequirementPartChanged.bind(this))

      // value cell
      let newCell1 = document.createElement('td');
      newCell1.setAttribute('align', 'center');

      // append new created child element
      newCell1.appendChild(newChildElement);

      // button cell
      let newCell2 = document.createElement('td');
      // add new button
      // ToDo check what this method does
      // Simon used the button to choose the next option
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
    for (let i = 0; i < templatePart.value.length; i++) {

      // local variable
      let tableChildElement = templatePart.value[i];

      // handle all subelement types of wrapper: dropdown, input, text
      // wrapperHandler() called for choosen options -> descriptionTemplateValue already set
      // wrapperHandler() called for not-choosen options -> descriptionTemplateValue not set
      switch (tableChildElement.type) {
        case 'dropdown':
          if (!tableChildElement.descriptionTemplateValue) {

            // set empty array for creation of subelement
            tableChildElement.descriptionTemplateValue = _.cloneDeep(tableChildElement.value);
            tableChildElement.value = [];
          }
          break;
        case 'input':
          if (!tableChildElement.descriptionTemplateValue) {

            // set placeholder for creation of subelement
            tableChildElement.descriptionTemplateValue = _.cloneDeep(tableChildElement.value);
            tableChildElement.value = '';
          }
          break;
        case 'text':
          // do nothing
          // descriptionTemplateValue is not set and value is needed for rendering
          break;
        default:
          throw new Error(`wrapperHandler() - type ${tableChildElement.type} is not supported as a subtype of wrapper`);
      }

      // create new child element
      // ToDo handle errors if array is not valid
      var newChildElement = this.createNewRequirementTemplatePart(tableChildElement);

      // append new elements to wrapper
      newPart.appendChild(newChildElement);
    }

    return newPart;

  }

  /**
   * set the choosen table option as active
   * valid subtypes of table: wrapper, dropdown, input, text
   * 
   * @param descriptionTemplatePart
   * @param requirementTemplatePart
   * @param newRow
   */
  setChoosenTableOptionActive(descriptionTemplatePart: RequirementDescriptionTemplatePart, requirementTemplatePart: RequirementDescriptionTemplatePart, newRow: HTMLTableRowElement) {

    if (requirementTemplatePart.type === 'text') {
      // subtype text

      // if type and value are equal
      if (
        descriptionTemplatePart.type === requirementTemplatePart.type &&
        descriptionTemplatePart.value === requirementTemplatePart.value
      ) {

        // set option as active
        newRow.classList.add('active');
      }

    } else if (requirementTemplatePart.type === 'wrapper') {
      // subtype wrapper

      // both types have to be 'wrapper'
      if (descriptionTemplatePart.type === requirementTemplatePart.type) {

        // check sub elements
        requirementTemplatePart.value.forEach((subPart, i) => {
          this.setChoosenTableOptionActive(subPart, descriptionTemplatePart.value[i], newRow);
          // ToDo: issue - if only one subelement is valid, the row gets the active class anyway
        });
      }

    } else if (requirementTemplatePart.type === 'input') {
      // subtype input

      // types are equal and value is not empty
      if (
        descriptionTemplatePart.type === requirementTemplatePart.type &&
        requirementTemplatePart.value !== ''
      ) {
        newRow.classList.add('active');
      }

    } else if (requirementTemplatePart.type === 'dropdown') {
      // subtype dropdown

      // ToDo: case dropdown not debugged yet
      console.log('case dropdown in has not been debugged yet');

      // search for option in description template
      let optionsChoosen = Array.from(descriptionTemplatePart.value).find((option: string) => option === requirementTemplatePart.value[0]);

      if (
        descriptionTemplatePart.type === requirementTemplatePart.type &&
        optionsChoosen
      ) {
        newRow.classList.add('active');
      }

    } else {

      // ToDo update error
      throw new Error('datatype not valid')
    }
  }

  /**
   * methods gets executed each time an event occurres on one of the requirement template parts
   * 
   * @param event
   */
  onRequirementPartChanged(event) {

    if (event.type === 'change') {
      // dropdown or input

      let templatePartId = event.target.id;
      let changedTemplatePart: RequirementTemplatePart;

      if (templatePartId !== 'undefined') {

        // find changed template part -> reference
        changedTemplatePart = RequirementTemplatePart.findById(this.selectedRequirement.descriptionParts, templatePartId);

        if (event.target.nodeName.toLowerCase() === 'input') {
          // input

          // set changed value to requirement
          changedTemplatePart.value = event.target.value;
        } else if (event.target.nodeName.toLowerCase() === 'select') {
          // dropdown

          // local variable
          let select: HTMLSelectElement = event.target;

          // set changed value to requirement -> array necessary !
          changedTemplatePart.value = [select.options[select.selectedIndex].textContent];
        }

        // save chagend data for api call
        this.modifiedRequirementTemplateParts.push(changedTemplatePart);
        this.storeService.requirementTemplatePartsModified$.next(true);

      } else {
        // nested elements hava an id === 'undefined'

        // requirement service method call
        this.requirementService.findValidParentId(event.target)
          .subscribe((templatePartId: string) => {

            // find template part -> is a table (see definition, wrapper-elements are always subelements of a table)
            let templatePart: RequirementTemplatePart = RequirementTemplatePart.findById(this.selectedRequirement.descriptionParts, templatePartId);

            if (event.target.nodeName.toLowerCase() === 'input') {
              // input

              // local variable
              let modifiedInput: HTMLInputElement = event.target;

              // execute method from above
              this.requirementService.findModifiedElementInDescriptionTemplate(templatePart, modifiedInput.placeholder, modifiedInput.value);

            } else if (event.target.nodeName.toLowerCase() === 'select') {
              // dropdown

              // ToDo if dropdown is in an table element
              throw new Error('onRequirementPartChanged() - dropdown case not implemented yet');

              // Issue: findModifiedElementInDescriptionTemplate() does not work for dropdown yet
              // because value is set to '' and not to[]
            } else {
              throw new Error('onRequirementPartChanged() - neither input nor dropdown element');
            }

            // save chagend data for api call
            this.modifiedRequirementTemplateParts.push(templatePart);
            this.storeService.requirementTemplatePartsModified$.next(true);
          });
      }
    } else if (event.type === 'click') {
      // table

      // local variable
      let clickedElement: HTMLElement = event.target;

      this.requirementService.findValidParentId(clickedElement).subscribe(
        (templatePartId: string) => {

          // changed requirement template part -> must be a table due to the click event is only defined for tables yet
          let templatePart: RequirementTemplatePart = RequirementTemplatePart.findById(this.selectedRequirement.descriptionParts, templatePartId);

          //
          this.requirementService.findParentRow(clickedElement).subscribe(
            (tableRow: HTMLTableRowElement) => {

              // compare length of child nodelist with templatePart.descriptionTemplateValue.length
              // templatePart will be always a table
              if (tableRow.parentNode.childNodes.length !== templatePart.descriptionTemplateValue.length) {
                throw new Error('onRequirementPartChanged() - table row count issue');
              }

              // check if choosen option is already active
              if (!tableRow.classList.contains('active')) {
                // option not active

                // local variable of row nodes array
                let rowNodesArray = Array.from(tableRow.parentNode.childNodes);

                // get index of selected option
                let optinIndex = rowNodesArray.indexOf(tableRow);

                // prepare option for insertion
                let insertableOption = _.cloneDeep(templatePart.descriptionTemplateValue[optinIndex]);

                /*
                 * handle all subtypes of table
                 *
                 */
                let handleTableSubElement = (subElement: RequirementTemplatePart) => {

                  switch (subElement.type) {
                    case 'wrapper':
                      // recursive method call
                      subElement.value.forEach(wrapperElement => handleTableSubElement(wrapperElement));
                      break;
                    case 'dropdown':
                      subElement.descriptionTemplateValue = _.cloneDeep(subElement.value);
                      subElement.value = [];
                      break;
                    case 'input':
                      subElement.descriptionTemplateValue = _.cloneDeep(subElement.value);
                      subElement.value = '';
                      break;
                    case 'text':
                      // do nothing
                      // value is needed for rendering
                      break;
                    default:
                      throw new Error(`handleTableSubElement() - type ${subElement.type} is no subelement type of table`);
                  }
                };

                // execute method
                handleTableSubElement(insertableOption);

                // set clicked option
                templatePart.value = [insertableOption];

                // remove css class active from all table rows 
                rowNodesArray.forEach((row: HTMLTableRowElement) => row.classList.remove('active'));

                // set tableRow active
                tableRow.classList.add('active');

                // save chagend data for api call
                this.modifiedRequirementTemplateParts.push(templatePart);
                this.storeService.requirementTemplatePartsModified$.next(true);

              }
            }, (error) => {
              // if findParentRow() fails
              throw new Error(error);
            }
          );
        }, (error) => {
          // if findValidParentId() fails
          throw new Error(error);
        }
      );
    } else {
      throw new Error('onRequirementPartChanged() - event type not supported');
    }


    // debug
    console.log(this.requirements);

    // ToDo validate updated requirement parts
    //this.requirementService.validateRequirementTemplate(this.requirementTemplateParts, this.descriptionTemplate); 

    // ToDo API call
  }

  /**
   * make api calls for changed requirement template parts
   *
   */
  onSaveRequirement() {

    // indicate loading
    this.storeService.appLoading$.next(true);

    // requirement template parts to update -> local variable
    let templateParts: RequirementTemplatePart[] = _.cloneDeep(this.modifiedRequirementTemplateParts);

    // remove duplicates from behind -> last items are the newest ones
    templateParts = _.uniqWith(templateParts.reverse(), (firstItem, secondItem) => {
      return firstItem._id === secondItem._id;
    });

    // count variable
    let templatePartsCount = templateParts.length;

    from(templateParts).pipe(
      concatMap((part: RequirementTemplatePart) => {

        // prepare template parts

        // property descriptionTemplateValue is not in backend model and also not necessary
        delete part['descriptionTemplateValue'];

        // set correct value datatype
        if (part.type === 'input' || part.type === 'dropdown' || part.type === 'text') {

          // do nothing -> string or string array are valid datatypes
        } else if (part.type === 'table' || part.type === 'wrapper') {

          // ToDo delete descriptionTemplateValue of subelements

          // stringify table items
          part.value.forEach(item => item = JSON.stringify(item));

        }

        // debug
        console.log('part to save')
        console.log(part)

        return this.requirementTemplatePartService.updateRequirementTemplatePart(part);
      }),
      bufferCount(templatePartsCount)
    )
      .subscribe(
        (result) => {
          console.log('save successfull')
          console.log(result)

          // set modified indicator to false
          this.storeService.requirementTemplatePartsModified$.next(false);

          // reset array of modified requirement template parts
          this.modifiedRequirementTemplateParts = [];

          // reload requirements
          this.requirementService.reloadRequirements();

          // end loading
          this.storeService.appLoading$.next(false);

        }, (error) => {
          console.log('onSaveRequirement() - updating requirement template parts went wrong');
          console.log(error);

          // end loading
          this.storeService.appLoading$.next(false);
        }
      );
  }
}
