import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClarityModule, ClrFormsNextModule } from '@clr/angular';

import { AppComponent } from './app.component';
import { RequirementService } from './services/requirement/requirement.service';
import { RequirementListComponent } from './requirements/requirement-list/requirement-list.component';
import { RequirementComponent } from './requirements/requirement/requirement.component';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { NotFoundComponent } from './not-found/not-found.component';
import { HeaderComponent } from './header/header.component';
import { SigninComponent } from './auth/signin/signin.component';
import { AuthService } from './services/auth/auth.service';
import { LocalStorageService } from './services/local-storage.service';
import { TokenInterceptor } from './services/auth/token-interceptor.service';
import { ReactiveFormsModule } from '@angular/forms';
import { OfficeService } from './services/office-api/office.service';
import { OoxmlParser } from './services/office-api/ooxml-parser.service';
import { XmlDebugComponent } from './xml/xml-debug/xml-debug.component';
import { StoreService } from './services/store.service';
import { RequirementDescriptionTemplateService } from './services/requirement-description-template.service';
import { RequirementTemplatePartService } from './services/requirement-template-part.service';
import { RequirementDetailsComponent } from './requirements/requirement/requirement-details/requirement-details.component';
import { AlertComponent } from './alert/alert.component';
import { RequirementAPIService } from './services/requirement/requirement-api.service';
import { XmlComponent } from './xml/xml.component';
import { RequirementsComponent } from './requirements/requirements.component';
import { RequirementEditComponent } from './requirements/requirement-edit/requirement-edit.component';
import { AuthGuardService } from './services/auth/auth-guard.service';

@NgModule({
  declarations: [
    AppComponent,
    RequirementListComponent,
    RequirementComponent,
    NotFoundComponent,
    HeaderComponent,
    SigninComponent,
    XmlDebugComponent,
    RequirementDetailsComponent,
    AlertComponent,
    XmlComponent,
    RequirementsComponent,
    RequirementEditComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ClarityModule,
    ClrFormsNextModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [
    RequirementService,
    RequirementAPIService,
    AuthService,
    AuthGuardService,
    LocalStorageService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    OfficeService,
    OoxmlParser,
    StoreService,
    RequirementDescriptionTemplateService,
    RequirementTemplatePartService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
