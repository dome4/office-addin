import { HttpClient } from '@angular/common/http';
import { RequirementTemplatePart } from '../models/requirement-template-part';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

const api = environment.apiUrl;

@Injectable()
export class RequirementTemplatePartService {

  // indicate if requirement template parts were changed
  public requirementTemplatePartsModified$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) { }

  addRequirementTemplatePart(part: RequirementTemplatePart) {
    return this.http.post<RequirementTemplatePart>(`${api}/requirement-part/`, part);
  }

  updateRequirementTemplatePart(part: RequirementTemplatePart) {
    return this.http.put<RequirementTemplatePart>(`${api}/requirement-part/${part._id}`, part);
  }
}
