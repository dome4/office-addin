import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Requirement } from '../../models/requirement';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { RequirementTemplatePart } from '../../models/requirement-template-part';
import { BehaviorSubject, Observable, Subject, from, Observer } from 'rxjs';
import { map, concatMap, bufferCount } from 'rxjs/operators';
import { RequirementDescriptionTemplate } from '../../models/requirement-description-template/requirement-description-template';
import { RequirementDescriptionTemplatePart } from '../../models/requirement-description-template/requirement-description-template-part';
import { RequirementTemplatePartService } from '../requirement-template-part.service';
import * as _ from 'lodash';
import { RequirementAPIService } from './requirement-api.service';

const api = environment.apiUrl;

@Injectable()
export class RequirementService {

  // observable if current requirement template is valid
  public requirementTemplateIsValid$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  // requirements observable
  public requirements$: BehaviorSubject<Requirement[]> = new BehaviorSubject<Requirement[]>(null);

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private partService: RequirementTemplatePartService,
    private requirementApiService: RequirementAPIService
  ) {

    // initialize requirements$ data
    this.getRequirements().subscribe((requirements: Requirement[]) => this.requirements$.next(requirements));
  }

  /**
   * method is executed if the request was blocked due to a not authenticated user
   * and the user authenticates afterwars
   *
   */
  public resendInitialRequests() {
    this.reloadRequirements();
  }

  private getRequirements() {
    // method should only be executed once on app startup
    // else reloadRequirements() should be executed

    return this.requirementApiService.getRequirements().pipe(
      map(this.mapDescriptionTemplateWithRequirementParts, this) // context is a necessary param
    )
  }

  getRequirement(requirement: Requirement) {
    return this.requirementApiService.getRequirement(requirement);
  }

  deleteRequirement(requirement: Requirement) {
    return this.requirementApiService.deleteRequirement(requirement);
  }

  addRequirement(requirement: Requirement) {
    return this.requirementApiService.addRequirement(requirement);
  }

  updateRequirement(requirement: Requirement) {
    return this.requirementApiService.updateRequirement(requirement);
  }

  /**
   * reload requirements from the api and return them as observable emit
   *
   */
  reloadRequirements(): Observable<Requirement[]> {

    // create new observable
    return new Observable((observer: Observer<Requirement[]>) => {

      // call api for new requirements (http observabe)
      this.getRequirements().subscribe((requirements: Requirement[]) => {

        // set results to local requirements observable
        this.requirements$.next(requirements);

        // emit result and complete observable
        observer.next(requirements);
        observer.complete();

      }, (error) => {
        // send error as emit value
        console.log('reloadRequirements() - error occurred');
        observer.error('reloadRequirements() - error occurred');
        });
    });
    
  }

  /**
   * method validates the current active requirement template
   * 
   * @param requirementTemplateParts
   * @param descriptionTemplate
   */
  validateRequirementTemplate(requirementTemplateParts: RequirementTemplatePart[], descriptionTemplate: RequirementDescriptionTemplate): void {

    try {

      // check all requirement template parts with the description template
      for (let i = 0; i < descriptionTemplate.template.length; i++) {

        // temp variable for loop
        let descriptionTemplatePart = this.createObject(descriptionTemplate.template[i]);
        let requirementTemplatePart = requirementTemplateParts[i];

        // only validate the order of different element types
        // ToDo: also validate the values of the different elements
        if (requirementTemplatePart.type !== descriptionTemplatePart.type) {

          // not valid
          this.requirementTemplateIsValid$.next(false);

          // debug
          console.log('test')

          // cancel method
          return;
        }
      }
    } catch (error) {

      // log error
      console.log(`validation error: ${error}`);

      // not valid
      this.requirementTemplateIsValid$.next(false);

      // cancel method
      return;
    }

    // valid
    this.requirementTemplateIsValid$.next(true);
  }

  /**
   * map description template with requirement template parts
   * 
   * @param requirements
   */
  mapDescriptionTemplateWithRequirementParts(requirements: Requirement[]) {

    requirements.forEach((requirement: Requirement) => {

      requirement.descriptionParts.forEach((part, i) => {

        // cast template string array to object array
        requirement.descriptionTemplate.template[i] = this.createObject(requirement.descriptionTemplate.template[i].toString());

        // call helper function
        // ToDo fix context issue -> static method is possible
        this.mapHelper(part, requirement.descriptionTemplate.template[i]);

        // ToDo: safe return value

      });
    });

    return requirements;
  }

  /**
   * helper function
   * 
   * @param part
   * @param template
   */
  mapHelper(part: RequirementTemplatePart, template: RequirementDescriptionTemplatePart) {

    // check datatypes and set value
    if (part.type === template.type) {

      if (part.type === 'input') {

        // input handler
        part.descriptionTemplateValue = template.value;

        // ToDo dropdown validate options
      } else if (part.type === 'wrapper') {

        // wrapper handler       

        // check all subparts -> part.value is already an object
        part.value
          .forEach((subPart: RequirementTemplatePart, i: number) => {

            if (subPart && template.value[i]) {

              // call mapHelper
              // in the wrapper class should only be dropdown, input and text as subelements
              this.mapHelper(subPart, template.value[i])

            } else {
              throw new Error('requirement map error');
            }
          });
      } else if (part.type === 'table') {

        // table handler      

        // set default value and overrite it later
        part.descriptionTemplateValue = template.value;

        // array gets converted to a simple object by JSON.parse()
        // array has only one value-object-> get the first value
        // new value has to be also an array!
        part.value = [this.createObject(part.value[0])];

        // local variable
        let subPart: RequirementTemplatePart = part.value[0];

        // search in description template options for fitting datatype
        // no reference to description tempate necessary -> Array.from()
        let options = Array.from(template.value);

        /*
         * find option of requirement part in description template
         * 
         * method Array.find() not supported in IE but it works anyway
         * (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
         */
        let searchResult = options.find((object: RequirementDescriptionTemplatePart) => {

          // check object types
          if (object.type === subPart.type) {

            // text field
            if (subPart.type === 'text') {

              // text values have to be equal, too
              if (object.value === subPart.value) {
                return true;
              } else {
                return false;
              }

            } else {

              // valid if datatype is not text and types are equal
              return true;
            }
          }

          // default value
          return false;
        });

        if (searchResult) {

          // explicit typecast
          let descriptionTemplate = <RequirementDescriptionTemplatePart>searchResult;

          // call the mapHelper()-function
          // subPart is the requirement template subpart and searchResult is the fitting description template
          this.mapHelper(subPart, descriptionTemplate);

          // ToDo check other cases than 'wrapper'                

        } else {

          // throw error if datatype is not in requirement description template
          throw new Error('requirement map error');
        }

      } else if (part.type === 'text') {

        // text handler
        // descriptionTemplateValue only necessary for check not for rendering

        // text value has to equal description template text
        if (part.value !== template.value) {
          throw new Error('requirement map error: text field not valid');
        }
      } else if (part.type === 'dropdown') {

        // dropdown handler

        // array of dropdown options for description template
        let optionsArray = Array.from(template.value)

        // requirement part choosen option has to be an option of the description template
        if (optionsArray.find((option: string) => part.value[0] === option)) {
          part.descriptionTemplateValue = template.value;
        } else {
          throw new Error('requirement map error: dropdown option not in description template');
        }

      } else {

        // theoretical case: description template and requirement part have both the same undefinded type
        throw new Error('requirement map error: datatype not defined');
      }


    } else {
      throw new Error('requirement map error');
    }
  }

  /**
   * check if the given param is already an object or a JSON-string and return a object
   * 
   * @param element object or JSON-string of an object
   */
  createObject(element: any) {

    try {

      if (
        element !== undefined ||
        element !== null
      ) {
        /*
       * check if the value is already parsed
       */
        if (element.constructor == String) {

          // String check
          return JSON.parse(element);

        } else if (element.constructor == Object) {

          // object check
          return element;

        } else {
          throw new Error('type is not String or Object');
        }
      } else {
        throw new Error('element is undefined');
      }
    } catch (error) {
      throw new Error(`createObject(): parsing error - ${error}`);
    }
  }

  /**
   * creates an empty requirement with the already set requirement description template
   * @param requirement
   */
  createEmptyRequirementFromTemplate(requirement: Requirement): Observable<Requirement> {

    // parts to create
    let descriptionPartsArray: RequirementTemplatePart[] = [];

    // length of the descriptionPartsCount-array
    let descriptionPartsCount = requirement.descriptionTemplate.template.length;

    // save requirement template parts in api
    return from(requirement.descriptionTemplate.template).pipe(
      concatMap((descriptionTemplatePart: RequirementDescriptionTemplatePart) => {

        // cast template string array to object array
        let templatePart: RequirementTemplatePart = this.createObject(descriptionTemplatePart);

        // info: description template parts are saved in api with value of the description template

        // return observable
        return this.partService.addRequirementTemplatePart(templatePart)
      }),
      map((descriptionPart: RequirementTemplatePart) => {
        // each descriptionPart is emitted as one value

        /*
         * info: value and descriptionTemplateValue are only changed to the local template part
         * -> has to be saved in api
         */

        // call helper
        descriptionPart = this.createNewElementHelper(descriptionPart);

        return descriptionPart;

      }),
      bufferCount(descriptionPartsCount), // buffer all emitted values
      map((descriptionParts: RequirementTemplatePart[]) => {

        // add received object to the end of the array
        descriptionPartsArray.push(...descriptionParts)

        // set new created description parts
        requirement.descriptionParts = descriptionPartsArray;

        // return modified requirement
        return requirement;
      })
    );
  }

  createNewElementHelper(descriptionPart: RequirementTemplatePart) {

    switch (descriptionPart.type) {

      // prevent reference copyg!!!

      case 'dropdown':
        // add descriptionTemplateValue to response
        descriptionPart.descriptionTemplateValue = _.cloneDeep(descriptionPart.value);

        // set to empty array
        descriptionPart.value = [];
        break;

      case 'input':
        // add descriptionTemplateValue to response
        descriptionPart.descriptionTemplateValue = _.cloneDeep(descriptionPart.value);

        // set to empty string
        descriptionPart.value = '';
        break;

      case 'text':
        // add descriptionTemplateValue to response, value is already set
        descriptionPart.descriptionTemplateValue = _.cloneDeep(descriptionPart.value);
        break;

      case 'table':
        // add descriptionTemplateValue to response
        descriptionPart.descriptionTemplateValue = _.cloneDeep(descriptionPart.value);

        // set first option as active
        // value needs to be an array
        descriptionPart.value = [];
        descriptionPart.value.push(_.cloneDeep(descriptionPart.descriptionTemplateValue[0]));

        // local temp object
        let template: RequirementDescriptionTemplatePart = new RequirementDescriptionTemplatePart();

        // values to set (descriptionTemplateValue is already an object)
        template.type = 'table';
        template.value = _.cloneDeep(descriptionPart.descriptionTemplateValue);

        // use response map function to handle the table type
        this.mapHelper(descriptionPart, template);
        break;

      case 'wrapper':
        // wrapper is a subpart an can never be on the description parts root level
        // recursicve calls of the function createNewElementHelper() are not valid
        throw new Error('wrapper-type cannot be in descriptionParts-array root level');

      default:
        throw new Error('createNewElementHelper() - type not defined');
    }

    return descriptionPart;

  }

  /**
  * find next table row parent
  * 
  * @param DOMNode
  */
  public findParentRow(DOMNode): Observable<HTMLTableRowElement> {

    return new Observable((observer: Observer<HTMLTableRowElement>) => {

      /**
       * find next table row parent - subfunction
       * 
       * @param node
       */
      let findParentRow = (node) => {

        if (node.nodeName.toLowerCase() === 'tr') {
          // return result
          observer.next(node);

          // complete observable -> no need to unsubscribe
          observer.complete();

        } else if (node.id.includes('requirementId')) {
          // table node found (upper bound)
          observer.error('onRequirementPartChanged() - root level of requirement reached');
          observer.complete();
        } else {
          // go to next parent node
          findParentRow(node.parentNode);
        }
      };

      // execute function
      findParentRow(DOMNode);
    });
  }

  /**
   * search in descriptionTemplateValue for option which was clicked on (or changed)
   *
   * @param templatePart modified requirement template part
   * @param searchParam placeholder (input) or options-array(dropdown)
   * @param modifiedValue event.target.value(input) or selected option(dropdown)
   *
   */
  public findModifiedElementInDescriptionTemplate(templatePart: RequirementTemplatePart, searchParam, modifiedValue) {

    // iterate over
    templatePart.descriptionTemplateValue.forEach((option: RequirementDescriptionTemplatePart) => {

      // handle all possible sub elements of a table
      // here are only three cases possible: input, dropdown and wrapper (due to the event type)
      if (
        (option.type === 'input' || option.type === 'dropdown') &&
        option.value === searchParam
      ) {
        // input or dropdown as direct subelement of table
        // set these option as value
        templatePart.value = _.cloneDeep(option);
        templatePart.value.value = modifiedValue; // Issue: only works for input!!
      } else if (option.type === 'wrapper') {

        // search in subelements of wrapper.value
        let subElement = option.value.filter((wrapperOption: RequirementDescriptionTemplatePart) => {
          // handle all possible subtypes of wrapper
          // dropdown, input, text -> text not possible here due to change event
          if (
            (wrapperOption.type === 'input' || wrapperOption.type === 'dropdown') &&
            wrapperOption.value === searchParam
          ) {
            return true;
          }
          return false;
        });

        // if not subElement exists and contains only on object => throw error
        if (!(subElement && subElement.length == 1)) {
          throw new Error('findModifiedElementInDescriptionTemplate() - wrapper options not valid or searchParam not found');
        }

        // set value to wrapper template -> array necessary due to definition
        // correct place to set because search in options.value was successfull
        templatePart.value = [_.cloneDeep(option)];

        // prepare subelement for insertion
        let newSubElement: RequirementTemplatePart = _.cloneDeep(subElement[0]);
        newSubElement.descriptionTemplateValue = _.clone(newSubElement.value);
        newSubElement.value = modifiedValue; // Issue: does only work for input, not for dropdown

        // wrapper conatins a few elements -> replace the correct one
        // templatePart.value is an array but only contains one element (see above)
        templatePart.value[0].value.filter((wrapperTemplateOption) => {
          if (
            wrapperTemplateOption.type === newSubElement.type &&
            wrapperTemplateOption.value === newSubElement.descriptionTemplateValue
          ) {
            return true;
          }
          return false;

        }).map((optionToReplace) => {

          // modify matched description template option
          optionToReplace.descriptionTemplateValue = newSubElement.descriptionTemplateValue;
          optionToReplace.value = newSubElement.value;
        });
      }
    })
  }

  /**
   * find next parent with requirement template part id
   * 
   * @param DOMNode start node
   */
  public findValidParentId(DOMNode): Observable<string> {

    return new Observable((observer: Observer<string>) => {

      /**
       * find next parent with requirement template part id - subfunction
       * 
       * @param element start node
       */
      let findValidParentId = (element) => {

        if ((<string>element.id).includes('requirementId')) {
          // no valid table or wrapper id found
          observer.error('onRequirementPartChanged() - root level of requirement reached');
          observer.complete();

        } else if (element.id && element.id !== 'undefined') {
          // return id result
          observer.next(element.id);
          observer.complete();

        } else {
          // recursive method call
          findValidParentId(element.parentElement);

        }
      };

      // execute function
      findValidParentId(DOMNode);
    });
  }

  /**
   * get the descriptionParts string of the requirement param
   * 
   * @param requirement Requirement
   */
  getStringFromRequirement(requirement: Requirement) {

    return new Observable((observer: Observer<string>) => {

      // return string
      let sentence: string = '';

      requirement.descriptionParts.forEach((part: RequirementTemplatePart) => {

        // handle all descriptionParts
        switch (part.type) {
          case 'dropdown':
            sentence += ' ' + part.value[0];
            break;
          case 'input':
            sentence += ' ' + part.value;
            break;
          case 'text':
            sentence += ' ' + part.value;
            break;
          case 'table':
            (<RequirementTemplatePart[]>part.value).forEach((tablePart: RequirementTemplatePart) => {

              // handle all table subpart types
              switch (tablePart.type) {
                case 'dropdown':
                  sentence += ' ' + tablePart.value[0];
                  break;
                case 'input':
                  sentence += ' ' + tablePart.value;
                  break;
                case 'text':
                  sentence += ' ' + tablePart.value;
                  break;
                case 'wrapper':
                  (<RequirementTemplatePart[]>tablePart.value).forEach((wrapperPart: RequirementTemplatePart) => {

                    // handle all wrapper subpart types
                    switch (wrapperPart.type) {
                      case 'dropdown':
                        sentence += ' ' + wrapperPart.value[0];
                        break;
                      case 'input':
                        sentence += ' ' + wrapperPart.value;
                        break;
                      case 'text':
                        sentence += ' ' + wrapperPart.value;
                        break;
                      default:
                        observer.error(`getStringFromRequirement() - type ${wrapperPart.type} not defined as subpart type of wrapper`);
                        observer.complete();
                    }
                  });
                  break;
                default:
                  observer.error(`getStringFromRequirement() - type ${tablePart.type} not defined as subpart type of table`);
                  observer.complete();
              }
            });
            break;
          //case 'wrapper':
          //  // is defined as subtype of table -> no need to handle
          //  break;
          default:
            observer.error(`getStringFromRequirement() - type ${part.type} not defined`);
            observer.complete();
        }
      });

      // return result
      observer.next(sentence);
      observer.complete();
    });
  }
}
