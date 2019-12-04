import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login.component';
import { LoginNewComponent } from './login-new/login-new.component';

const routes: Routes = [
  // { path: '', component: LoginComponent },
  { path: '', component: LoginNewComponent },
  { path: 'loginnew', component: LoginNewComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule { }
