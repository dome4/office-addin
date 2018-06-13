import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { RequirementService } from './services/requirement.service';
import { RequirementListComponent } from './requirement-list/requirement-list.component';
import { RequirementComponent } from './requirement/requirement.component';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { NotFoundComponent } from './not-found/not-found.component';
import { HeaderComponent } from './header/header.component';
import { SigninComponent } from './auth/signin/signin.component';
import { AuthService } from './services/auth/auth.service';
import { LocalStorageService } from './services/local-storage.service';


@NgModule({
  declarations: [
    AppComponent,
    DropdownComponent,
    RequirementListComponent,
    RequirementComponent,
    NotFoundComponent,
    HeaderComponent,
    SigninComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule   
  ],
  providers: [
    RequirementService,
    AuthService,
    AuthService,
    LocalStorageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
