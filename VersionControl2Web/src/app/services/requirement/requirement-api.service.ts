import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Requirement } from "../../models/requirement";
import { Injectable } from "@angular/core";

const api = environment.apiUrl;

@Injectable()
export class RequirementAPIService {

  constructor(private http: HttpClient) { }

  getRequirements() {
    return this.http.get<Array<Requirement>>(`${api}/requirements`);
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

}
