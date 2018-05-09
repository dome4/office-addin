import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Requirement } from '../models/requirement';

const api = 'http://localhost:3000/api';

@Injectable()
export class RequirementService {

  constructor(private http: HttpClient) { }

  getRequirements() {
    return this.http.get<Array<Requirement>>(`${api}/requirements`)
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
