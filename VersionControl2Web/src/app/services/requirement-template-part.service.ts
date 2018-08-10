import { HttpClient } from '@angular/common/http';
import { RequirementTemplatePart } from '../models/requirement-template-part';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

const api = environment.apiUrl;

@Injectable()
export class RequirementTemplatePartService {

  constructor(private http: HttpClient) { }

  addRequirementTemplatePart(part: RequirementTemplatePart) {
    return this.http.post<RequirementTemplatePart>(`${api}/requirement-part/`, part);
  }
}
