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
   * method signs the user up
   * 
   * @param email
   * @param password
   */
  //signupUser(email: string, password: string) {

  //  createUserWithEmailAndPassword(email, password)
  //    .catch(
  //    error => console.log(error)
  //    );
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
        this.storageService.store('token', data['token']);

        // save in variable
        this.token = data['token'];
      },
      (error) => {

        // ToDo write alert component
        console.log('Login Failed');
      });
  }

  // ToDo
  logout() {
    //auth().signout();
    //this.token = null;
  }

  // ToDo - difference to signin!
  getToken() {

    // get token and check if token is valid
    //currentUser.getIdToken()
    //  .then(
    //  (token: string) => this.token = token
    //  );

    //// error handling necessary if token is not valid anymore
    //return this.token;
  }

  // ToDo
  isAuthenticated() {

    return this.token != null;
  }

}
