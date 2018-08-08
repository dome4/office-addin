import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { RequirementDescriptionTemplate } from "../models/requirement-description-template/requirement-description-template";
import { environment } from "../../environments/environment";

const api = environment.apiUrl;

@Injectable()
export class RequirementTemplateService {

  constructor(private http: HttpClient) { }

  getRequirementTemplates() {
    return this.http.get<Array<RequirementDescriptionTemplate>>(`${api}/requirement-description-templates`);
  }
}
