import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Requirement } from '../models/requirement';
import { environment } from '../../environments/environment';
import { AuthService } from './auth/auth.service';

const api = environment.apiUrl;

@Injectable()
export class RequirementService {

  constructor(private http: HttpClient,
              private authService: AuthService) { }

  getRequirements() {

    // request auth header
    const httpOptions = this.authService.getAuthHeader();
    return this.http.get<Array<Requirement>>(`${api}/requirements`, httpOptions)
  }

  getRequirement(requirement: Requirement) {

    // request auth header
    const httpOptions = this.authService.getAuthHeader();
    return this.http.get<Requirement>(`${api}/requirement/${requirement._id}`, httpOptions)
  }

  deleteRequirement(requirement: Requirement) {

    // request auth header
    const httpOptions = this.authService.getAuthHeader();
    return this.http.delete(`${api}/requirement/${requirement._id}`, httpOptions);
  }

  addRequirement(requirement: Requirement) {

    // request auth header
    const httpOptions = this.authService.getAuthHeader();
    return this.http.post<Requirement>(`${api}/requirement/`, requirement, httpOptions);
  }

  updateRequirement(requirement: Requirement) {

    // request auth header
    const httpOptions = this.authService.getAuthHeader();
    return this.http.put<Requirement>(`${api}/requirement/${requirement._id}`, requirement, httpOptions);
  }

}
