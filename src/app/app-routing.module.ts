import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './shared';

const routes: Routes = [
  {
    path: 'app',
    loadChildren: './layout/layout.module#LayoutModule',
    // canActivate: [AuthGuard]
  },
  {
    path: '',
    loadChildren: './login/login.module#LoginModule'
  },
  {
    path: 'login',
    loadChildren: './login/login.module#LoginModule'
  },
  {
    path: 'selectorganization',
    loadChildren: './select-organization/select-organization.module#SelectOrganizationModule',
    // canActivate: [AuthGuard]
  },
  {
    path: 'transition',
    loadChildren: './transition/transition.module#TransitionModule'
  },
  { path: 'not-found', loadChildren: './not-found/not-found.module#NotFoundModule' },
  { path: '**', redirectTo: 'not-found', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
