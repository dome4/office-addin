import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Requirement } from '../models/requirement';
import { environment } from '../../environments/environment';

const api = environment.apiUrl;

@Injectable()
export class RequirementService {

  constructor(private http: HttpClient) { }

  getRequirements() {
    return this.http.get<Array<Requirement>>(`${api}/requirements`)
  }

  getRequirement(requirement: Requirement) {
    return this.http.get<Requirement>(`${api}/requirement/${requirement.id}`)
  }

  deleteRequirement(requirement: Requirement) {
    return this.http.delete(`${api}/requirement/${requirement.id}`);
  }

  addRequirement(requirement: Requirement) {
    return this.http.post<Requirement>(`${api}/requirement/`, requirement);
  }

  updateRequirement(requirement: Requirement) {
    return this.http.put<Requirement>(`${api}/requirement/${requirement.id}`, requirement);
  }

}
