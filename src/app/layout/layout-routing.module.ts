import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LayoutComponent} from './layout.component';
import {AuthGuard} from '../shared/guard/auth.guard';

//components
import { VendorManagementComponent } from './../layout/vendorManagement/vendorManagement.component';
import { DashboardsComponent } from './../layout/dashboards/dashboards.component';
import { OrdersComponent } from './orders/orders.component';
import { OrderComponent } from './order/order.component';
import { OrderPaymentComponent } from './orderPayment/orderPayment.component';
import { PaymentsComponent } from './payments/payments.component';
import { ReconciliationComponent } from './reconciliation/reconciliation.component';
import { SupportComponent } from './support/support.component';
import { TasksComponent } from './tasks/tasks.component';
import { UserManagementComponent } from './usermanagement/usermanagement.component';
import { VisDashboardComponent } from './visDashboard/visDashboard.component';
import { OrdersProcessedComponent } from './orders-processed/orders-processed.component';
import { BaseFieldsComponent } from './baseFields/baseFields.component';
import { OrderTemplateComponent } from './order-template/order-template.component';
import { ConfigureAdComponent } from './configureAd/configureAd.component';
import { TargetAudComponent } from './targetAud/targetAud.component';
import { OrderSummaryComponent } from './orderSummary/orderSummary.component';
import { OrdersTemplateListComponent } from './orders-template-list/orders-template-list.component';
import { OrdersListComponent } from './orders-list/orders-list.component';

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
        component: OrdersComponent,
      },
      {
        path: 'order',
        component: OrderComponent,
        data: {
          breadcrumbs: true,
          text: 'Order Management'
        },
      },
      {
        path: 'order/:id',
        component: OrderComponent,
        data: {
          breadcrumbs: true,
          text: 'Modify Order Management'
        },
      },
      {
        path: 'configureAd',
        component: ConfigureAdComponent,
        data: {
          breadcrumbs: true,
          text: 'Configure AD'
        },
      },
      {
        path: 'configureAd/:id',
        component: ConfigureAdComponent,
        data: {
          breadcrumbs: true,
          text: 'Modify AD'
        },
      },
      {
        path: 'targetAud',
        component: TargetAudComponent,
        data: {
          breadcrumbs: true,
          text: 'Configure Target Audience'
        },
      },
      {
        path: 'targetAud/:id',
        component: TargetAudComponent,
        data: {
          breadcrumbs: true,
          text: 'Modify Target Audience'
        },
      },
      {
        path: 'orderSummary',
        component: OrderSummaryComponent,
        data: {
          breadcrumbs: true,
          text: 'Order Summary'
        },
      },
      {
        path: 'orderSummary/:id',
        component: OrderSummaryComponent,
        data: {
          breadcrumbs: true,
          text: 'Order Summary'
        },
      },
      {
        path: 'orderPayment',
        component: OrderPaymentComponent,
        data: {
          breadcrumbs: true,
          text: 'Configure Order Payment'
        },
      },
      {
        path: 'orderPayment/:id',
        component: OrderPaymentComponent,
        data: {
          breadcrumbs: true,
          text: 'Modify Order Payment'
        },
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
          {
            path: 'orders-processed',
            component: OrdersProcessedComponent,
            data: {
              breadcrumbs: true,
              text: 'Orders Processed'
            }
          },
          {
            path: 'baseFields',
            component: BaseFieldsComponent,
            data: {
              breadcrumbs: true,
              text: 'Base Fields'
            },
          },
          {
            path: 'ordertemplate',
            component: OrderTemplateComponent,
            data: {
              breadcrumbs: true,
              text: 'Order Template'
            },
          },
          {
            path: 'ordertemplate/:id',
            component: OrderTemplateComponent,
            data: {
              breadcrumbs: true,
              text: 'Modify Order Template'
            },
          },
          {
            path: 'ordertemplatelist',
            component: OrdersTemplateListComponent,
            data: {
              breadcrumbs: true,
              text: 'Order Template List'
            },
          },
          {
            path: 'orderslist',
            component: OrdersListComponent,
            data: {
              breadcrumbs: true,
              text: 'Orders List'
            },
          }
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
