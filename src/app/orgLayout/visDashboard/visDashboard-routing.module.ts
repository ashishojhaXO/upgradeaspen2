import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VisDashboardComponent } from './visDashboard.component';

const routes: Routes = [
  { path: '', component: VisDashboardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VisDashboardRoutingModule { }
