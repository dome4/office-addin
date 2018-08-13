import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RequirementComponent } from './requirement/requirement.component';
import { RequirementListComponent } from './requirements/requirement-list/requirement-list.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { AuthGuardService } from './services/auth/auth-guard.service';
import { SigninComponent } from './auth/signin/signin.component';
import { RequirementDetailsComponent } from './requirement/requirement-details/requirement-details.component';
import { RequirementsComponent } from './requirements/requirements.component';

const appRoutes: Routes = [
  { path: '', redirectTo: 'requirements', pathMatch: 'full' },
  {
    path: 'requirements', component: RequirementsComponent, children:
      [
        { path: '', component: RequirementListComponent },
        { path: ':id', component: RequirementComponent },
        { path: ':id/detail', component: RequirementDetailsComponent }
      ]
  },
  { path: 'signin', component: SigninComponent },
  { path: 'list', component: RequirementListComponent, canActivate: [AuthGuardService] },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
