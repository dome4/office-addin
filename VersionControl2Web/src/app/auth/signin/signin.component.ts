import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent {

  constructor(private authService: AuthService) { }

  onSignin(form: NgForm) {

    const email = form.value.email;
    const password = form.value.password;

    this.authService.signinUser(email, password);

    // firebase saves token to local storage automatically (Lecture 259)


  }

}
