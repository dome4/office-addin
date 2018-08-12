import { Component, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RequirementService } from '../../services/requirement.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnDestroy {

  // subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private requirementService: RequirementService
  ) { }

  ngOnDestroy() {
    // unsubscribe all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onSignin(form: NgForm) {

    const email = form.value.email;
    const password = form.value.password;

    // subscribe to signinUser
    this.subscriptions.push(
      this.authService.signinUser(email, password).subscribe(
        (response: boolean) => {

          // if signin was successfull (true) 
          if (response) {
            // retry first request (should be first request)
            this.requirementService.resendInitialRequests();

            // navigate to root page
            this.router.navigate(['/']);
          }
        }, (error) => {
          console.log('Login failed - try again');
          console.log(error.error.message);
        })
    );
  }
}
