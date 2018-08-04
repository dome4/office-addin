import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule } from '@clr/angular';

import { AppComponent } from './app.component';
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
import { TokenInterceptor } from './services/auth/token-interceptor.service';
import { RequirementDropdownComponent } from './requirement/requirement-dropdown/requirement-dropdown.component';
import { ReactiveFormsModule } from '@angular/forms';
import { OfficeService } from './services/office-api/office.service';
import { OoxmlParser } from './services/office-api/ooxml-parser.service';
import { XmlDebugComponent } from './xml-debug/xml-debug.component';
import { FormDebugComponent } from './form-debug/form-debug.component';


@NgModule({
  declarations: [
    AppComponent,
    RequirementDropdownComponent,
    RequirementListComponent,
    RequirementComponent,
    NotFoundComponent,
    HeaderComponent,
    SigninComponent,
    XmlDebugComponent,
    FormDebugComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ClarityModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [
    RequirementService,
    AuthService,
    AuthService,
    LocalStorageService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    OfficeService,
    OoxmlParser
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
