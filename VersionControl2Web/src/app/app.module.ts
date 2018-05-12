import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { RequirementService } from './services/requirement.service';
import { RequirementListComponent } from './requirement-list/requirement-list.component';
import { RequirementComponent } from './requirement/requirement.component';
import { RequirementEditorComponent } from './requirement/requirement-editor/requirement-editor.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AppComponent,
    DropdownComponent,
    RequirementListComponent,
    RequirementComponent,
    RequirementEditorComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule      
  ],
  providers: [RequirementService],
  bootstrap: [AppComponent]
})
export class AppModule { }
