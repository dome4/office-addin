import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent {

  constructor(private authService: AuthService,
              private router: Router) { }

  onSignin(form: NgForm) {

    const email = form.value.email;
    const password = form.value.password;

    this.authService.signinUser(email, password);

    // ToDo: check if login was successfull
    this.router.navigate(['/']);
  }
}
