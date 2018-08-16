import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  /**
   * sign out the current user
   *
   */
  onSignOut() {

    // logout
    this.authService.logout();

    // redirect to signin page
    this.router.navigate(['signin']);

    
  }
}
