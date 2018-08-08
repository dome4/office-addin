import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Requirement } from '../models/requirement';
import { environment } from '../../environments/environment';
import { AuthService } from './auth/auth.service';
import { RequirementTemplatePart } from '../models/requirement-template-part';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RequirementDescriptionTemplate } from '../models/requirement-description-template/requirement-description-template';
import { RequirementDescriptionTemplatePart } from '../models/requirement-description-template/requirement-description-template-part';

const api = environment.apiUrl;

@Injectable()
export class RequirementService {

  // observable if current requirement template is valid
  public requirementTemplateIsValid$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient,
    private authService: AuthService) { }

  getRequirements() {
    return this.http.get<Array<Requirement>>(`${api}/requirements`).pipe(
      map(this.mapDescriptionTemplateWithRequirementParts, this) // context is a necessary param
    )
  }

  getRequirement(requirement: Requirement) {
    return this.http.get<Requirement>(`${api}/requirement/${requirement._id}`)
  }

  deleteRequirement(requirement: Requirement) {
    return this.http.delete(`${api}/requirement/${requirement._id}`);
  }

  addRequirement(requirement: Requirement) {
    return this.http.post<Requirement>(`${api}/requirement/`, requirement);
  }

  updateRequirement(requirement: Requirement) {
    return this.http.put<Requirement>(`${api}/requirement/${requirement._id}`, requirement);
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
        requirement.descriptionTemplate.template[i] = JSON.parse(requirement.descriptionTemplate.template[i].toString());

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
        // array has only one value-object 
        part.value = this.createObject(part.value.toString());

        // local variable
        let subPart: RequirementTemplatePart = part.value;

        // search in description template options for fitting datatype
        // no reference to description tempate necessary -> Array.from()
        let options = Array.from(template.value)

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
      /*
       * check if the value is already parsed
       */
      if (
        element !== undefined &&
        element !== null &&
        element.constructor == String
      ) {

        // String check
        return JSON.parse(element);

      } else if (
        element !== undefined &&
        element !== null &&
        element.constructor == Object
      ) {

        // object check
        return element;

      } else if (
        element == undefined ||
        element == null
        ) {
        throw new Error('element is undefined');
      } else {
        throw new Error('type is not String or Object');
      }

    } catch (error) {
      throw new Error(`createObject(): parsing error - ${error}`);
    }
  }
}
