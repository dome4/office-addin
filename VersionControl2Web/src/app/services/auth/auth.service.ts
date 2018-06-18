import { Router } from "@angular/router";
import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from '../../../environments/environment';
import { catchError, retry } from 'rxjs/operators';
import { LocalStorageService } from "../local-storage.service";

// api url
const api = environment.apiUrl;

// request header
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded'
  })
};

@Injectable()
export class AuthService {

  private token: string;

  constructor(private router: Router,
              private http: HttpClient,
              private storageService: LocalStorageService) { }

  // ToDo
  /**
   * method creates a new user
   * 
   * @param email
   * @param password
   */
  //signupUser(email: string, password: string) {

  //}

  /**
   * method signs the user in
   * 
   * @param username
   * @param password
   */
  signinUser(username: string, password: string) {

    const body = new HttpParams()
      .set('name', username)
      .set('password', password);

    this.http.post<{ success: boolean, message: string, token: string }>(`${api}/user/authenticate`, body, httpOptions)
      .subscribe(
      (data) => {

        // save in local storage
        this.storageService.store('vc-token', data['token']);

        // save in variable
        this.token = data['token'];
      },
      (error) => {

        // ToDo write alert component
        console.log('Login Failed');
      });
  }

  /**
   * logout method
   * 
   */
  logout() {

    // reset token variable
    this.token = null;

    // remove local stored token
    this.storageService.remove('vc-token');
  }

  /**
   * method requests a new token
   * 
   */
  refreshToken() {
    // ToDo
  }

  /**
   * method checks if the user is authenticated
   * 
   */
  isAuthenticated() {

    return this.storageService.get('vc-token') != null;
 
  }

  /**
   * create an auth header for requests
   * 
   */
  getAuthHeader() {

    // check if user is authenticated
    if (this.isAuthenticated) {
      // request header
      let httpOptions = {
        headers: new HttpHeaders({
          'x-access-token': this.storageService.get('vc-token')
        })
      };
      console.log(httpOptions);

      return httpOptions;

    } else {
      return null;
    }

    

  }

}
