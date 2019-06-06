import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LayoutComponent} from './layout.component';
import {AuthGuard} from '../shared/guard/auth.guard';

const routes: Routes = [
  {
    path: '',
    data: {
      breadcrumbs: true,
      text: 'Dashboards'
    },
    children: [
      {
        path: '',
        redirectTo: 'pacing',
        pathMatch: 'full'
      },
      {
        path: 'pacing',
        loadChildren: './dashboards/dashboards.module#DashboardsModule',
        data: {
          breadcrumbs: true,
          text: 'Pacing'
        }
      },
      {
        path: 'spend',
        loadChildren: './dashboards/dashboards.module#DashboardsModule',
        data: {
          breadcrumbs: true,
          text: 'Spend'
        }
      },
      {
        path: 'reconciliation',
        loadChildren: './reconciliation/reconciliation.module#ReconciliationModule',
        data: {
          breadcrumbs: true,
          text: 'Reconciliation'
        }
      }
    ]
  },
  {
    path: 'dashboards',
    data: {
      breadcrumbs: true,
      text: 'Dashboards'
    },
    children: [
      {
        path: '',
        redirectTo: 'pacing',
        pathMatch: 'full'
      },
      {
        path: 'pacing',
        loadChildren: './dashboards/dashboards.module#DashboardsModule',
        data: {
          breadcrumbs: true,
          text: 'Pacing'
        }
      },
      {
        path: 'spend',
        loadChildren: './dashboards/dashboards.module#DashboardsModule',
        data: {
          breadcrumbs: true,
          text: 'Spend'
        }
      },
      {
        path: 'reconciliation',
        loadChildren: './reconciliation/reconciliation.module#ReconciliationModule',
        data: {
          breadcrumbs: true,
          text: 'Reconciliation'
        }
      }
    ]
  },
  {
    path: 'reports',
    loadChildren: './reports/reports.module#ReportsModule',
    data: {
      breadcrumbs: true,
      text: 'Reports'
    },
  },
  {
    path: 'orders',
    component: LayoutComponent,
    loadChildren: './orders/orders.module#OrdersModule'
  },
  {
    path: 'payments',
    component: LayoutComponent,
    loadChildren: './payments/payments.module#PaymentsModule'
  },
  {

    path: 'admin',
    data: {
      breadcrumbs: true,
      text: 'Admin'
    },
    children: [
      {
        path: '',
        redirectTo: 'usermanagement',
        pathMatch: 'full'
      },
      {
        path: 'usermanagement',
        loadChildren: './usermanagement/usermanagement.module#UserManagementModule',
        data: {
          breadcrumbs: true,
          text: 'User Management'
        }
      },
      {
        path: 'vendormanagement',
        loadChildren: './vendorManagement/vendorManagement.module#VendorManagementModule',
        data: {
          breadcrumbs: true,
          text: 'Vendor Management'
        }
      },
      {
        path: 'tasks',
        loadChildren: './tasks/tasks.module#TasksModule',
        data: {
          breadcrumbs: true,
          text: 'Admin Tasks'
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
