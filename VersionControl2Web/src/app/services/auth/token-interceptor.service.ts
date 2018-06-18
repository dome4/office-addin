import { HttpUserEvent, HttpInterceptor, HttpRequest, HttpHandler, HttpSentEvent, HttpHeaderResponse, HttpProgressEvent, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {

    // check if user is authenticated
    if (this.authService.isAuthenticated()) {

      // set auth header for each request
      request = request.clone({
        setHeaders: {
          'x-access-token': this.authService.getToken()
        }
      });
      return next.handle(request)
        .pipe(
        catchError((error) => {

          //intercept the respons error and displace it to the console
          console.log("Error Occurred");
          console.log(error);

          //return the error to the method that called it
          return throwError(error);
        }));

    } else {
      return next.handle(request);
    }

  }

}
