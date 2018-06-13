import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RequirementComponent } from './requirement/requirement.component';
import { RequirementListComponent } from './requirement-list/requirement-list.component';

const appRoutes: Routes = [
  { path: '', component: RequirementComponent },
  { path: 'list', component: RequirementListComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
