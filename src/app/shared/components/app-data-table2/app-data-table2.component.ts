/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Gobinath samuvel
 * Date: 2018-0205 10:00:00
 */
import {Component, EventEmitter, Input, ViewChild, OnInit, Output, ElementRef, Sanitizer, SimpleChanges, OnChanges} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import 'datatables.net';
import * as _ from 'lodash';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { isBoolean } from 'util';
import { DataTableService } from '../../../../services';
import { DomService } from '../dom.service';
import {PopUpModalComponent} from '../pop-up-modal/pop-up-modal.component';
import { DropDownComponent } from '../dropdown/dropdown.component';
import { TagComponent } from '../tag/tag.component';
import * as common from '../../../../constants/common';
// import {ModalDirective} from 'ngx-bootstrap/modal';
import {Http} from '@angular/http';


declare var $: any;
declare var jquery: any;

@Component({
  selector: 'app-data-table2',
  templateUrl: './app-data-table2.component.html',
  styleUrls: ['./app-data-table2.component.scss'],
  moduleId: module.id
})
export class AppDataTable2Component implements OnInit{

  constructor(
    public toastr: ToastsManager,
    private formBuilder: FormBuilder,
    private domService: DomService,
    private dataTableService: DataTableService,
    private http: Http) {
  }

  ngOnInit(): void {
    $('#example').DataTable( {
      scrollY: 200,
      scrollX: true
    });
  }
}
