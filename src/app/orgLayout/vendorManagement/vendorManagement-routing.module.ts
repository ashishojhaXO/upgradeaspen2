import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VendorManagementComponent } from './vendorManagement.component';

const routes: Routes = [
  { path: '', component: VendorManagementComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VendorManagementComponentRoutingModule { }
