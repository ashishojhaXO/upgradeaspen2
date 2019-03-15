import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AppChartsComponent } from './app-charts.component';
import { ChartModule } from 'angular2-highcharts';
import { HighchartsStatic } from 'angular2-highcharts/dist/HighchartsService';

declare var require: any;

export function highchartsFactory() {
  const hc = require('highcharts');
  const dd = require('highcharts/modules/drilldown');
  dd(hc);

  return hc;
}

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        ChartModule
    ],
    declarations: [
      AppChartsComponent
    ],
    exports: [AppChartsComponent],
    providers: [{
      provide: HighchartsStatic,
      useFactory: highchartsFactory
    }],
    entryComponents: []
})
export class AppChartsModule { }
