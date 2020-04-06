import { Injectable } from '@angular/core';
import { BaseService } from '.';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

// @Injectable()
export class CsvService {

  base: any;
  authService: any;
  constructor(
    // public router: Router, public http: Http, public toastr: ToastsManager
    ) {
    this.base = new BaseService();
  }

  /**
   * Genric function for all web service calls
   * @param method
   * @param url
   * @param data
   */
  successCBCsv(res, table) {
    // Set this.response, before calc
    let rows = res.data.rows;
    // let li = this.calc(res, table);
    console.log("Download Csv Here...");

    let arr: Array<String> = [];

    if (rows && rows.length) {
      arr.push( Object.keys(rows[0]).join(",") );
      let dataRows = rows.map( (k, v) => { return Object.values(k).join(", "); } )
      arr = arr.concat(dataRows);
    }

    let csvStr: String = "";
    csvStr = arr.join("\n");

    // var data = encode(csvStr);
    let b64 = btoa(csvStr as string);
    let a = "data:text/csv;base64," + b64;
    $('<a href='+a+' download="data.csv">')[0].click();

    return arr;
  }

}
