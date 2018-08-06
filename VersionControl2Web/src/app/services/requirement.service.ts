import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Requirement } from '../models/requirement';
import { environment } from '../../environments/environment';
import { AuthService } from './auth/auth.service';
import { RequirementTemplatePart } from '../models/requirement-template-part';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
   *
   * method validates the current active requirement template
   */
  validateRequirementTemplate(requirementTemplateParts: RequirementTemplatePart[], descriptionTemplate: any): void {

    // debug log
    console.log('requirement validation started');

    // variables
    let descriptionTemplatePart;
    let requirementTemplatePart;

    // check all requirement template parts with the description template
    for (let i = 0; i < requirementTemplateParts.length; i++) {

      // temp variable for loop
      descriptionTemplatePart = JSON.parse(descriptionTemplate.template[i]);
      requirementTemplatePart = requirementTemplateParts[i];

      // only validate the order of dirrent element types
      // ToDo: also validate the values of the different elements
      if (requirementTemplatePart.type === descriptionTemplatePart.type) {

        // valid
        this.requirementTemplateIsValid$.next(true);
      } else {

        // not valid
        this.requirementTemplateIsValid$.next(false);
      }

      // reset variables
      descriptionTemplatePart = null;
      requirementTemplatePart = null;
    }
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

        // check datatypes and set value
        if (part.type === requirement.descriptionTemplate.template[i].type) {
          part.descriptionTemplateValue = requirement.descriptionTemplate.template[i].value;

        } else {
          throw new Error('requirement map error');
        }
      });
    });

    return requirements;
  }
}
