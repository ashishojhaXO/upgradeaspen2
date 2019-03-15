import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../shared';
import { CommonLayoutComponent } from './common-layout.component';

const routes: Routes = [
    {
        path: '',
        loadChildren: '../orgLayout/layout.module#LayoutModule',
        canActivate: [AuthGuard],
        component: CommonLayoutComponent,
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CommonLayoutRoutingModule { }
