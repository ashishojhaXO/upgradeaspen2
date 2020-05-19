import { NgModule } from '@angular/core';
import { Routes, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthGuard } from './shared';
import { RouteGuard } from './shared/guard/route.guard';

const routes: Routes = [
  {
    path: 'app',
    loadChildren: './layout/layout.module#LayoutModule',
    canLoad: [RouteGuard]
  },

  {
    path: '',
    loadChildren: './login/login.module#LoginModule',
    canLoad: [RouteGuard]
  },

  {
    path: 'login',
    loadChildren: './login/login.module#LoginModule',
    canLoad: [RouteGuard]
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
export class AppRoutingModule { 
  constructor(
    private activatedRoute: ActivatedRoute
  ){

    this.activatedRoute.queryParams.subscribe(params => {
      //  this.id = +params['id']; // (+) converts string 'id' to a number
       console.log("APPRTTT: ", params)
    })
  }
}
