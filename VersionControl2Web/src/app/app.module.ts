import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { RequirementService } from './services/requirement.service';
import { RequirementListComponent } from './requirement-list/requirement-list.component';


@NgModule({
  declarations: [
    AppComponent,
    DropdownComponent,
    RequirementListComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [RequirementService],
  bootstrap: [AppComponent]
})
export class AppModule { }
