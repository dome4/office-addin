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
      map(this.mapDescriptionTemplateWithRequirementParts)
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

    /**
     * helper function
     * 
     * @param part
     * @param template
     */
    let mapHelper = (part: RequirementTemplatePart, template: RequirementDescriptionTemplatePart) => {

      // check datatypes and set value
      if (part.type === template.type) {

        if (part.type === 'dropdown' || part.type === 'input') {

          // dropdown and input handler
          part.descriptionTemplateValue = template.value;
        } else if (part.type === 'wrapper') {

          // wrapper handler                      
          // ToDo !!!!
          part.descriptionTemplateValue = template.value;
        } else if (part.type === 'table') {

          // table handler

          // debug
          console.log('part')
          console.log(part)
          console.log(template)
          console.log('part')



          let array = Array
            .from(part.value)
            .map((element: string) => JSON.parse(element))
            .forEach((subPart: RequirementTemplatePart) => { // value has only one requirement template part

              // debug
              console.log('subpart')
              console.log(subPart)
              console.log('subpart')

              // search in description template options for fitting datatype
              let options = Array.from(template.value)

              console.log(options)


              // call mapHelper to handle subPart

              // ToDo complete

              
            })



          // ToDo !!!!
          part.descriptionTemplateValue = template.value;
        } else if (part.type === 'text') {

          // text handler
          // ToDo !!!!
          part.descriptionTemplateValue = template.value;
        }


      } else {
        throw new Error('requirement map error');
      }
    };

    requirements.forEach((requirement: Requirement) => {

      requirement.descriptionParts.forEach((part, i) => {

        // cast template string array to object array
        requirement.descriptionTemplate.template[i] = JSON.parse(requirement.descriptionTemplate.template[i].toString());

        // call helper function
        mapHelper(part, requirement.descriptionTemplate.template[i]);

        // ToDo: safe return value
        
      });
    });

    // debug
    console.log(requirements);

    return requirements;
  }

  /**
   * check if the given param is already an object or a JSON-string and return a object
   * 
   * @param element object or JSON-string of an object
   */
  createObject(element: any) {

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

    } else {
      throw new Error('parsing error');
    }
  }
}
