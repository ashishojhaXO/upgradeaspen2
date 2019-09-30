import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import {Subject} from 'rxjs/Subject';
import {ReportsService} from '../../../services/reports.service';

@Injectable()
export class TheReportsService {

  constructor(private reportsService: ReportsService, private http: Http) {
  }

  public reportSummary(context: any) {
    return this.reportsService.reportSummary(context);
  }

  public getReportTemplate(context: any) {
    return this.reportsService.getReportTemplate(context);
  }

  public getReportById(context: any, id: any) {
    return this.reportsService.getReportById(context, id);
  }

  public createOrUpdateReport(context: any, reportPayload: any, saveType: any, reportId: any) {
    return this.reportsService.createOrUpdateReport(context, reportPayload, saveType, reportId);
  }

  public searchContractByPartnerType(context: any, query: any) {
    return this.reportsService.searchContractByPartnerType(context, query);
  }

  public reportRunOrDownload(context: any, reportId: any, type:  any) {
    return this.reportsService.reportRunOrDownload(context, reportId, type);
  }

  public reportDownload(context: any, reportId: any, type:  any) {
    return this.reportsService.reportDownload(context, reportId, type);
  }

  public reportDelete(context: any, reportId: any, type:  any) {
    return this.reportsService.reportDelete(context, reportId, type);
  }
}
