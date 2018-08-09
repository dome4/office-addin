import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { RequirementDescriptionTemplate } from "../models/requirement-description-template/requirement-description-template";
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";

const api = environment.apiUrl;

@Injectable()
export class RequirementTemplateService {

  // local requirement description templates
  requirementDescriptionTemplates$: Observable<RequirementDescriptionTemplate[]>;

  constructor(private http: HttpClient) {

    // ToDo change to real local observable if the data gets often requested
    this.requirementDescriptionTemplates$ = this.getRequirementTemplates();
  }

  private getRequirementTemplates() {
    return this.http.get<Array<RequirementDescriptionTemplate>>(`${api}/requirement-description-templates`);
  }

  getRequirementTemplate(template: RequirementDescriptionTemplate) {
    return this.http.get<RequirementDescriptionTemplate>(`${api}/requirement-description-template/${template._id}`)
  }
}
