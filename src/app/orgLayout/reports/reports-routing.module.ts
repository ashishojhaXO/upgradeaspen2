import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AdhocReportBuilderComponent} from './reports-adhocReportBuilder/reports-adhocReportBuilder.component';
import {ReportsSummaryComponent} from './reports-summary/reports-summary.component';
import {AuthGuard} from '../../shared/guard/auth.guard';
import {AlertNoticationdashboardsComponent} from './reports-alertNotification/reports-alertNotification.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'reportsSummary',
        pathMatch: 'full'
      },
      {
        path: 'reportsSummary',
        component: ReportsSummaryComponent,
        canActivate: [AuthGuard],
        data: {
          breadcrumbs: true,
          text: 'Summary'
        }
      },
      {
        path: 'adHocReportBuilder',
        component: AdhocReportBuilderComponent,
        canActivate: [AuthGuard],
        data: {
          breadcrumbs: true,
          text: 'AdHoc Report Builder'
        }
      },
      {
        path: 'adHocReportBuilder/:id',
        component: AdhocReportBuilderComponent,
        canActivate: [AuthGuard],
        data: {
          breadcrumbs: true,
          text: 'AdHoc Report Builder'
        }
      },
      {
        path: 'alertNotification',
        component: AlertNoticationdashboardsComponent,
        canActivate: [AuthGuard],
        data: {
          breadcrumbs: true,
          text: 'Alert Notification'
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule {
}
