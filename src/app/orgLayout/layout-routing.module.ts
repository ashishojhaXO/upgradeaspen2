import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LayoutComponent} from './layout.component';
import {AuthGuard} from '../shared/guard/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    data: {
      breadcrumbs: true,
      text: 'Dashboards'
    },
    children: [
      {
        path: '',
        canActivate: [AuthGuard],
        redirectTo: 'pacing',
        pathMatch: 'full'
      },
      {
        path: 'pacing',
        loadChildren: './dashboards/dashboards.module#DashboardsModule',
        canActivate: [AuthGuard],
        data: {
          breadcrumbs: true,
          text: 'Pacing'
        }
      },
      {
        path: 'spend',
        loadChildren: './dashboards/dashboards.module#DashboardsModule',
        canActivate: [AuthGuard],
        data: {
          breadcrumbs: true,
          text: 'Spend'
        }
      }
    ]
  },
  {
    path: 'dashboards',
    canActivate: [AuthGuard],
    data: {
      breadcrumbs: true,
      text: 'Dashboards'
    },
    children: [
      {
        path: '',
        canActivate: [AuthGuard],
        redirectTo: 'pacing',
        pathMatch: 'full'
      },
      {
        path: 'pacing',
        loadChildren: './dashboards/dashboards.module#DashboardsModule',
        canActivate: [AuthGuard],
        data: {
          breadcrumbs: true,
          text: 'Pacing'
        }
      },
      {
        path: 'spend',
        loadChildren: './dashboards/dashboards.module#DashboardsModule',
        canActivate: [AuthGuard],
        data: {
          breadcrumbs: true,
          text: 'Spend'
        }
      }
    ]
  },
  {
    path: 'reports',
    loadChildren: './reports/reports.module#ReportsModule',
    canActivate: [AuthGuard],
    data: {
      breadcrumbs: true,
      text: 'Reports'
    },
  },
  {
    path: 'orders',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    loadChildren: './orders/orders.module#OrdersModule'
  },
  {
    path: 'payments',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    loadChildren: './payments/payments.module#PaymentsModule'
  },
  {

    path: 'admin',
    canActivate: [AuthGuard],
    data: {
      breadcrumbs: true,
      text: 'Admin'
    },
    children: [
      {
        path: '',
        canActivate: [AuthGuard],
        redirectTo: 'usermanagement',
        pathMatch: 'full'
      },
      {
        path: 'usermanagement',
        loadChildren: './usermanagement/usermanagement.module#UserManagementModule',
        canActivate: [AuthGuard],
        data: {
          breadcrumbs: true,
          text: 'User Management'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule {
}
