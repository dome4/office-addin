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


@NgModule({
  declarations: [
    AppComponent,
    DropdownComponent,
    RequirementListComponent,
    RequirementComponent,
    NotFoundComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule   
  ],
  providers: [RequirementService],
  bootstrap: [AppComponent]
})
export class AppModule { }
