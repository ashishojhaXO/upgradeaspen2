import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LayoutComponent} from './layout.component';
import {AuthGuard} from '../shared/guard/auth.guard';

//components
import { VendorManagementComponent } from './../layout/vendorManagement/vendorManagement.component';
import { DashboardsComponent } from './../layout/dashboards/dashboards.component';
import { OrdersComponent } from './orders/orders.component';
import { PaymentsComponent } from './payments/payments.component';
import { ReconciliationComponent } from './reconciliation/reconciliation.component';
import { SupportComponent } from './support/support.component';
import { TasksComponent } from './tasks/tasks.component';
import { UserManagementComponent } from './usermanagement/usermanagement.component';
import { VisDashboardComponent } from './visDashboard/visDashboard.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
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
            component: DashboardsComponent,
            data: {
              breadcrumbs: true,
              text: 'Pacing'
            }
          },
          {
            path: 'spend',
            component: DashboardsComponent,
            data: {
              breadcrumbs: true,
              text: 'Spend'
            }
          },
          {
            path: 'reconciliation',
            component: ReconciliationComponent,
            data: {
              breadcrumbs: true,
              text: 'Reconciliation'
            }
          }
        ]
      },
      {
        path: 'pacing',
        component: DashboardsComponent,
        data: {
          breadcrumbs: true,
          text: 'Pacing'
        }
      },
      {
        path: 'spend',
        component: DashboardsComponent,
        data: {
          breadcrumbs: true,
          text: 'Spend'
        }
      },
      {
        path: 'reconciliation',
        component: ReconciliationComponent,
        data: {
          breadcrumbs: true,
          text: 'Reconciliation'
        }
      },
      {
        path: 'visDashboard',
        component: VisDashboardComponent,
        data: {
          breadcrumbs: true,
          text: 'Visual Dashboard'
        },
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
        component: OrdersComponent
      },
      {
        path: 'payments',
        component: PaymentsComponent
      },
      {
        path: 'vendormanagement',
        component: VendorManagementComponent
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
            component: UserManagementComponent,
            data: {
              breadcrumbs: true,
              text: 'User Management'
            }
          },
          {
            path: 'tasks',
            component: TasksComponent,
            data: {
              breadcrumbs: true,
              text: 'Admin Tasks'
            }
          },
          {
            path: 'support',
            component: SupportComponent,
            data: {
              breadcrumbs: true,
              text: 'Support'
            }
          },
        ]
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
