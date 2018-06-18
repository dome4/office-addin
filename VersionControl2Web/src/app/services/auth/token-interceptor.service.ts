import { HttpUserEvent, HttpInterceptor, HttpRequest, HttpHandler, HttpSentEvent, HttpHeaderResponse, HttpProgressEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService,
    private router: Router) { }

  // ToDo: interface for HttpRequest to filter requests
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {

    // check if user is authenticated
    if (this.authService.isAuthenticated()) {

      // set auth header for each request
      request = request.clone({
        setHeaders: {
          'x-access-token': this.authService.getToken()
        }
      });     
    }

    let handler = next.handle(request)
      .pipe(
      catchError((error) => {

        if (error instanceof HttpErrorResponse && error.status === 403) {

            // redirect to the login route
            this.router.navigate(['/signin']);
        }

        //intercept the response error and displace it to the console
        console.log("HTTP Error Occurred");

        //return the error to the method that called it
        return throwError(error);
      }));

    return handler;
  }
}
