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
import {Http} from "@angular/http";
import {DataTablesResponse} from "./app-data-table.response";
import {DataTableAction} from './data-table-action';
import {Router, ActivatedRoute} from '@angular/router';
import {DataTableActionType} from './data-table-action-type';

declare var $: any;
declare var jquery: any;

@Component({
  selector: 'app-data-table1',
  templateUrl: './app-data-table.component.html',
  styleUrls: ['./app-data-table.component.scss'],
  moduleId: module.id
})
export class AppDataTableComponent implements OnInit, OnChanges {

  setId: any;

  tableWrapper = '.dataTableWrapper';
  addButtonID = '#addRow';
  removeButtonID = '#removeBtn';
  dropDownSettings = {};
  popupIdentifier = false;
  exportFilename: String;
  selectedConfirmationCheckboxes: any = [];

  data: any;
  counter = 0;
  @Input() dataObject: any;
  @Input() id: any;
  @Input() newRow: any;
  @Input() serverSide?: any;
  @Input() serviceURI?: any;
  @Input() serviceMethod?: any;
  @Input() serviceData?: any;
  @Input() height?: any;
  @Input() sendResponseOnCheckboxClick?: any;
  @Input() dataTableAction: DataTableAction;
  @Output() filterValues: EventEmitter<any> = new EventEmitter();
  @Output() triggerActions: EventEmitter<any> = new EventEmitter<any>();
  @Output() confirmationCheckboxActions: EventEmitter<any> = new EventEmitter<any>();
  Common: any = common;

  @ViewChild('modalHeader') modalHeader: ElementRef;
  @ViewChild('modalBody') modalBody: ElementRef;
  selectedButtonIndex: any;
  selectedEvent : any;

  tableWidget: any = [];
  tableId: any = 0;
  onRoleFieldData: any = [];
  dataTable: any;
  checkboxCount: any = 0;

  constructor(
    public toastr: ToastsManager,
    private formBuilder: FormBuilder,
    private domService: DomService,
    private dataTableService: DataTableService,
    private http: Http,
    private dataTablesResponse: DataTablesResponse,
    private router: Router
  ) {
  }

  @ViewChild('modalExport') modalExport: PopUpModalComponent;

  // @ViewChild('dataTableWrapper') private toogleFunction: ElementRef;

  ngOnChanges(changes: SimpleChanges) {
    // only run when property "data" changed
    if (changes['dataObject']) {
      console.log('dataObject >>>')
      console.log(this.dataObject)
      if(this.setId) {
        $('#' + this.setId).DataTable().clear().destroy();
        $('#' + this.setId).find('thead').empty();
        $('#' + this.setId).find('tbody').empty();
      }

      this.displayDataTable();
    }
  }

  ngOnInit() {

    var __this = this;
    $(document).on('click', '.paginate_button a', function () {
      // if(__this.setId) {
      //   $('#' + __this.setId).DataTable().clear().destroy();
      //   $('#' + __this.setId).find('thead').empty();
      //   $('#' + __this.setId).find('tbody').empty();
      // }
      // __this.displayDataTable();
      __this.setColumnColors();
      __this.appendColumnWith$();
    });

   // this.appendHeaders();

    // this.setId = this.id ? this.id : 'gridtable1';
    // this.displayDataTable();
  }

  appendHeaders() {
    const thead = $('#' + this.setId).find('thead');
    $(thead).find('.sorting_asc').removeClass('sorting_asc');
    $('#' + this.setId).append(thead[0].outerHTML);
  }

  buttonEvent(event: any, index: any, modalComponent: PopUpModalComponent) {

   this.selectedButtonIndex = index;
   this.selectedEvent = event;
   if (this.dataObject.buttons[index].popUpSettings && this.dataObject.buttons[index].popUpSettings.displayOnAction) {
     modalComponent.show();
     this.modalHeader.nativeElement.innerHTML = this.dataObject.buttons[index].popUpSettings.header;
     this.modalBody.nativeElement.innerHTML = this.dataObject.buttons[index].popUpSettings.body;
     return;
    }

    this.applyEventLogic();
  }

  confirmAction(modalComponent: PopUpModalComponent) {
    this.closeModal(modalComponent);
    this.applyEventLogic();
  }

  closeModal(modalComponent: PopUpModalComponent) {
    modalComponent.hide();
  }

  applyEventLogic() {
    if (this.dataObject.buttons[this.selectedButtonIndex].applyDefaultAction) {
      switch (this.selectedEvent.target.id) {
        case common.actionTypes.ADD:
          this.createNewRow(this.selectedEvent, '');
          break;
        case common.actionTypes.REMOVE:
          break;
        case common.actionTypes.IMPORT:
          break;
        case common.actionTypes.EXPORT:
          this.exportFile();
          break;
      }
    }

    if (this.dataObject.buttons[this.selectedButtonIndex].applyExternalAction) {
      this.triggerActions.emit({
        event: this.selectedEvent,
        index: this.selectedButtonIndex,
        rowData : this.getSelectedRows()
      });
    }
  }

  handleConfirmationCheckBoxClick(event, selectedButton) {
    selectedButton.confirmationCheckboxChecked = event.target.checked;
    const indexOfCheckBox = this.selectedConfirmationCheckboxes.map(e => e.actionType).indexOf(selectedButton.actionType);
    if (indexOfCheckBox !== -1) {
      this.selectedConfirmationCheckboxes.splice(indexOfCheckBox, 1);
    }
    this.selectedConfirmationCheckboxes.push(selectedButton);

    this.confirmationCheckboxActions.emit( {
      selectedConfirmationCheckboxes: this.selectedConfirmationCheckboxes
    });
  }

  exportFile() {
    const dataHeaderArr = [];
    const selectedRows = this.getSelectedRows();
    const gridHeaders = this.dataObject.gridData.headers;

    if (!selectedRows.length) {
      // no rows selected
    }

    gridHeaders.forEach(function (header) {
      if (!header.isCheckbox)
        dataHeaderArr.push(header.title);
    });

    let dataString;
    let data = new Array();
    data.push(dataHeaderArr);
    let csvContent = 'data:text/csv;charset=utf-8,';
    data.forEach(function (infoArray, index1) {
      dataString = infoArray.join(',');
      csvContent += index1 < data.length ? dataString + '\n' : dataString;
    });

    var gridResult = this.dataObject.gridData.result;
    selectedRows.forEach(function (index, rowIndex) {
      const dataArr = [];
      data = new Array();
      const row = gridResult[rowIndex];

      dataHeaderArr.forEach(function (header) {
        if (row[header] instanceof Array) {
          var stringCat = '"';
          row[header].forEach(function (arr) {
            if (arr instanceof Object) {
              for(var property in arr) {
                stringCat += arr[property] + ',';
              }
            } else {
              stringCat += arr + ',';
            }
          });
          stringCat = stringCat.slice(0, -1);
          stringCat += '"';
          dataArr.push(stringCat);
        } else {
          dataArr.push(row[header].toString());
        }
      })

      data.push(dataArr);
      data.forEach(function (infoArray, index) {
        dataString = infoArray.join(',');
        csvContent += index < data.length ? dataString + '\n' : dataString;
      });
    });

    let encodedUri = encodeURI(csvContent);
    let link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', (this.exportFilename ? this.exportFilename : 'download') + '.csv');
    document.body.appendChild(link);
    link.click();
  }

  getSelectedRows() {
    let arrayPush = [];
    const table: any = $('#' + this.setId);
    table.find('tbody tr').each(function (index) {
      if($(this).find('td').eq(0).find('label input[type=checkbox]').is(":checked")) {
        arrayPush.push($($(this).find('td').eq(0).find('label input[type=checkbox]')).attr('value'));
      }
    });
    return arrayPush;
  }

  /**
   * Renders DataTable with Populated data
   */
  displayDataTable(): void {

    this.setId = this.id !== undefined ? this.id : 'gridtable';
    const noData = this.dataObject.gridData.result && this.dataObject.gridData.result.length ? '' : 'no-data-available';
    $(this.tableWrapper).append('<table id="' + this.setId + '" class="table order-column admin-user gridtable ' +
      this.setId + '' + noData + '"</table>');
    const table: any = $('#' + this.setId);
    this.dataTable = table;
    const comThis = this;
    const gridData = this.dataObject.gridData;
    const defs = [], hKey = [];

    const option = this.dataObject.gridData.options;
    const headers = this.dataObject.gridData.headers;
    const result = this.dataObject.gridData.result;
    this.checkboxCount = 0;

    this.tableWidget.push(this.setId);

    headers.forEach((data, index) => {
      const def = {};
      const opt = option;
      def['defaultContent'] = "";
      def['targets'] = index;
      def['orderable'] = data.isFilterRequired;
      def['searchable'] = true;
      def['className'] = !data.isFilterRequired ? 'dt-not-search' : 'dt-body-left';

      if (data.isCheckbox) {
        this.checkboxCount++;
        def['render'] = (dat, type, full, meta) => {
          let disableClass = full.isDisabled;
          // disableClass = full['Status'] === 'published' || full['Status'] === 'Published' ? 'disabled' : disableClass;
          // disableClass = data.disabled ? 'disabled' : disableClass;
          const chkNum = data['isNumeric'] ? meta['row'] + 1 : '';
          const toogleAction = !_.isUndefined(data.toggle) && data.toggle;
          const toogleData = !_.isUndefined(full['toggleOptions']) ? full['toggleOptions'].length > 0 ? true : false : false ;
          const toogleArow =  toogleAction && toogleData ? '<div class="arrow-right toogleFunction" ></div>' : '';
          let checkbox = '<input type="hidden" id="' + data.data + '" name="' + data.data + '" value="' + dat +
            '"/><span class="hidden">' + dat + '</span> <label class="control control--checkbox"><input ' + disableClass +
            ' type="checkbox" id="' + data.data + '" name="id[]"  value="'
            + dat + '"/> <div class="control__indicator"></div><span>' + chkNum + '</span></label>' + toogleArow;
          if (full && full.isChecked) {
            checkbox = '<input type="hidden" id="' + data.data + '" name="' + data.data + '" value="' + dat +
              '"/><span class="hidden">' + dat + '</span> <label class="control control--checkbox"><input ' + disableClass +
              ' type="checkbox" id="' + data.data + '" name="id[]" checked  value="'
              + dat + '"/> <div class="control__indicator"></div><span>' + chkNum + '</span></label>' + toogleArow;
          }
          return checkbox;
        };
      }
      if (data['toggle'] && _.includes(data['data'], 'noDataFeed') && index === 0 ) {
        def['render'] = (dat, type, full, meta) => {
          const toogleAction = !_.isUndefined(data.toggle) && data.toggle;
          const toogleData = !_.isUndefined(full['toggleOptions']) ? full['toggleOptions'].length > 0 ? true : false : false ;
          const toogleArow =  toogleAction && toogleData ? '<div class="arrow-right toogleFunctionSummary" style="margin:0 10px;"></div>' : '';
          const toogleAlert = toogleAction && full['alertEnabled'] ? '<div style="width: 45px;background: #0777bc;color: #fff;padding: 3px 5px 2px;font-family: Asap Bold;font-size: 10px;float:right">ALERT</div>' : '<div style="width: 45px;float:right">&nbsp;</div>';
          // let checkbox = toogleArow;
          return toogleAlert + toogleArow ;
        };
      }else if (index === 0 && !data.isCheckbox) {
        def['render'] = (dat, type, full, meta) => {
          return '<input type="hidden" name="' + data.data + '" value="' + dat + '"/>' + dat;
        };
      }

      if (opt.isEditOption && data.editButton) {
        def['render'] = (dat, type, full, meta) => {
          return '<dtext>' + dat + '</dtext><i class="fa fa-pencil" aria-hidden="true"></i>';
        };
      }
      if (data.onchange) {
        def['render'] = (dat, type, full, meta) => {
          const checking = $('<div/>').text(dat).html() === 'true';
          const changeChk = checking ? 'checked' : '';
          const isDisabled = _.isEqual(dat, 'pending') ? 'disabled' : '';
          const actClass = checking ? 'a-tive' : 'in-active';
          const val = _.isUndefined(full[data.ref]) ? full[headers[0].data] : full[data.ref];
          return '<label class="switch"><input type="checkbox" ' + changeChk +
            ' ' + isDisabled + ' value="' + val + '"><sp class="slider round ' + actClass +
            '"><span class="yes-no-wrap"><span class="yes-wrap">yes</span><span class="no-wrap">no</span></span></sp></label>';
        };
      }
      if (!_.isUndefined(data.onloadField)) {
        def['render'] = (dat, type, full, meta) => {
          let formFiled = '<div class="form-group ' + data.data + '">';
          if (data['fieldType'] === 'select') {
            formFiled += '<select id="' + data.data + '[]" class="form-fields ng-invalid">';
            formFiled += '<option value="" selected >--select--</option>';
            _.forEach(data.fieldValues, (v, i) => {
              const selected = _.includes(dat, v['value']) ? 'selected' : '';
              formFiled += '<option value="' + v['value'] + '" ' + selected + '>' + v['text'] + '</option>';
            });
            formFiled += '</select>';
          }
          formFiled += '</div>';
          return formFiled;
        };
      }
      if (data['data'] === 'noDataFeed' && !_.isUndefined(data['actionButton'])) {
        def['render'] = (dat, type, full, meta) => {
          let actionBtn = '';
          data['actionButton'].forEach((v, i) => {
              // .editLint=k, .runLink, .downloadLink
              // debugger;
              const actionType = v['actionType'];
              const btn = $('<a/>');
              btn.attr('class', 'fa ' + v['actionIcon'] + ' fa-action-view ' + actionType + 'Link nav-link nav-toggle');
              btn.attr('data-rowData', JSON.stringify(data));
              btn.attr('data-full', JSON.stringify(full));
              if (!_.isUndefined(full['downloadurl']) && v['actionName'] === 'Download') {
                btn.attr('href', full['downloadurl']);
                btn.attr('data-full', '');
                btn.attr('data-rowData', '');
                btn.attr('download', 'download');
                if (full['downloadurl'] === '') {
                  btn.attr('href', 'javascript:void()');
                  btn.removeAttr('download');
                  btn.addClass('disabled');
                }
              }
              // btn.attr('data-fuction', v['actionFunc']);
              btn.attr('style', 'cursor: pointer;margin-right:15px');
              actionBtn += $(btn)[0].outerHTML;
          });
          return actionBtn;
        };
      }
      hKey.push(data.data);
      defs.push(def);
    }, this);

    const buttons = [];

    if (option.isSearchColumn) {
      buttons.push({
        extend: '',
        text: '<i class="fa fa-filter fa-Ifilter" aria-hidden="true"></i>'
      });
    }
    if (option.isColVisibility) {
      buttons.push({
        extend: 'colvis',
        text: '<i class="fa fa-cog fa-Ivisible" aria-hidden="true"></i>',
        auto: false,
        columns: (dt, idx, config) => {
          return 'disabled';
        },
        className: 'visibleButton',
        postfixButtons: [
          {
            extend: 'colvisRestore',
            text: 'Reset to default',
          }
        ],
      });
    }
    if (option.isDownload) {
      buttons.push({
        extend: 'csv',
        text: '<i class="fa fa-download fa-Idown" aria-hidden="true"></i>',
        exportOptions: {
          columns: headers[0].isCheckbox || headers[0].data === 'id' ? ':not(:first-child)' : '',
        }
      });
    }

    // Dom values options
    let domm = 'Brtpil';
    if (option.isSearchGlobal) {
      domm = 'f' + domm;
    }
    if (!option.isShowEntries) {
      domm = domm.replace('l', '');
    }
    let sortingColumn = [[1, 'asc']];
    if (!option.isSorting && !_.isUndefined(option.isSorting)) {
      sortingColumn = [];
    }
    if (!_.isUndefined(option.isSortingColumn)) {
      const sortinType = _.isUndefined(option.isSortingColumnType) ? 'asc' : option.isSortingColumnType;
      sortingColumn = [[option.isSortingColumn, sortinType]];
    }

    const pageLength = 50 ; //option.isPageLength === undefined ? 1 : option.isPageLength;

    if (this.serverSide && this.serviceURI) {
      if (this.serviceMethod && (this.serviceMethod == 'post' || this.serviceMethod == 'POST')) {
        this.tableWidget[this.tableId] = table.DataTable({
          pagingType: 'full_numbers',
          serverSide: true,
          processing: true,
          ajax: (dataTablesParameters: any, callback) => {
            this.http.post(
              this.serviceURI,
              this.serviceData
            ).subscribe(resp => {
              this.dataTablesResponse = new DataTablesResponse();
              this.dataTablesResponse.recordsTotal = resp.json().total;
              this.dataTablesResponse.recordsFiltered = resp.json().limit;
              this.dataTablesResponse.data = resp.json().docs;
              this.dataTablesResponse.draw = resp.json().page;
              callback({
                recordsTotal: this.dataTablesResponse.recordsTotal,
                recordsFiltered: this.dataTablesResponse.recordsFiltered,
                data: this.dataTablesResponse.data,
                draw: this.dataTablesResponse.draw
              });
            });
          },
          columns: headers,
          columnDefs: defs,
          dom: domm,
          paging: option.isPagination === undefined ? result.length > pageLength ? true : false : option.isPagination,
          ordering: option.isOrdering === undefined ? true : option.isOrdering,
          info: option.isTableInfo === undefined ? true : option.isTableInfo,
          autoWidth: true,
          colReorder: false,
          fixedHeader: false,
          order: sortingColumn,
          buttons: buttons,
          pageLength: pageLength,
          lengthMenu: [[10, 25, 50, -1], [10, 25, 50, 'All']],
          language: {
            paginate: {
              next: '<i class="fa fa-angle-right" aria-hidden="true"></i>',
              previous: '<i class="fa fa-angle-left" aria-hidden="true"></i>'
            },
            emptyTable: _.isUndefined(option.isEmptyTable) ? 'No data available' : option.isEmptyTable,
            info: 'Showing <span>_END_</span> of <span>_TOTAL_</span>',
            infoEmpty: 'Showing <span> 0 </span> of <span> 0 </span> <span><i class="fa fa-angle-left" aria-hidden="true">' +
              '</i><i class="fa fa-angle-right" aria-hidden="true"></i> </span>',
          },
          rowCallback: (row, data, index) => {
            if (!_.isUndefined(data.Type)) {
              if (data.Type === 'list') {
                const indexVal = _.findIndex(data, newData => _.has(newData, 'Value'));
                comThis.domService.appendComponent($('td:eq(' + indexVal + ')', row), TagComponent, {
                  Value: data.Value,
                  id: data.id,
                  label: data.Label,
                  description: data.Description
                });
                if (option.isEditOption) {
                  $('td:eq(' + indexVal + ')', row).append('<i class="fa fa-pencil" aria-hidden="true"></i>');
                }
              }
            } else if (!_.isUndefined(_.find(gridData.headers, o => o.data === 'Value'))) {
              const headerObject = _.find(gridData.headers, o => o.data === 'Value');
              const indexVal = _.findIndex(gridData.headers, headerObj => _.includes(headerObj.fieldType, 'list'));
              if (indexVal > 0) {
                const newData = {Value: data.Value, config: headerObject.tagConfig};
                comThis.domService.appendComponent($('td:eq(' + indexVal + ')', row), TagComponent, newData);
              }
            } else if (!_.isUndefined(data['class']) && data['Version'] !== 0) {
              if (data['class'] === 'hidden') {
                $(row).css('display', 'none');
              }
            }
          },
          headerCallback: (thead, data, start, end, display) => {
            let allBtnDisabled = result && result.length > 0 ? '' : 'disabled';
            const childNodeText = thead.childNodes[0].innerText;
            allBtnDisabled = headers[0]['disabled'] ? 'disabled' : allBtnDisabled;
            if (this.checkboxCount) {
              $(thead).find('th').eq(0).addClass('selectAll').html('').append('<label title="Select All" class="control control--checkbox"><input ' +
                allBtnDisabled + ' type="checkbox"/> <div class="control__indicator"></div><span>' + childNodeText + '</span</label>');
            }
          },
        });
      } else {
        this.tableWidget[this.tableId] = table.DataTable({
          pagingType: 'full_numbers',
          serverSide: true,
          processing: true,
          ajax: (dataTablesParameters: any, callback) => {
            this.http.get(
              this.serviceURI
            ).subscribe(resp => {
              this.dataTablesResponse = new DataTablesResponse();
              this.dataTablesResponse.recordsTotal = resp.json().total;
              this.dataTablesResponse.recordsFiltered = resp.json().limit;
              this.dataTablesResponse.data = resp.json().docs;
              this.dataTablesResponse.draw = resp.json().page;
              callback({
                recordsTotal: this.dataTablesResponse.recordsTotal,
                recordsFiltered: this.dataTablesResponse.recordsFiltered,
                data: this.dataTablesResponse.data,
                draw: this.dataTablesResponse.draw
              });
            });
          },
          columns: headers,
          columnDefs: defs,
          dom: domm,
          paging: option.isPagination === undefined ? result.length > pageLength ? true : false : option.isPagination,
          ordering: option.isOrdering === undefined ? true : option.isOrdering,
          info: option.isTableInfo === undefined ? true : option.isTableInfo,
          autoWidth: true,
          colReorder: false,
          fixedHeader: false,
          order: sortingColumn,
          buttons: buttons,
          pageLength: pageLength,
          lengthMenu: [[10, 25, 50, -1], [10, 25, 50, 'All']],
          language: {
            paginate: {
              next: '<i class="fa fa-angle-right" aria-hidden="true"></i>',
              previous: '<i class="fa fa-angle-left" aria-hidden="true"></i>'
            },
            emptyTable: _.isUndefined(option.isEmptyTable) ? 'No data available' : option.isEmptyTable,
            info: 'Showing <span>_END_</span> of <span>_TOTAL_</span>',
            infoEmpty: 'Showing <span> 0 </span> of <span> 0 </span> <span><i class="fa fa-angle-left" aria-hidden="true">' +
              '</i><i class="fa fa-angle-right" aria-hidden="true"></i> </span>',
          },
          rowCallback: (row, data, index) => {
            if (!_.isUndefined(data.Type)) {
              if (data.Type === 'list') {
                const indexVal = _.findIndex(data, newData => _.has(newData, 'Value'));
                comThis.domService.appendComponent($('td:eq(' + indexVal + ')', row), TagComponent, {
                  Value: data.Value,
                  id: data.id,
                  label: data.Label,
                  description: data.Description
                });
                if (option.isEditOption) {
                  $('td:eq(' + indexVal + ')', row).append('<i class="fa fa-pencil" aria-hidden="true"></i>');
                }
              }
            } else if (!_.isUndefined(_.find(gridData.headers, o => o.data === 'Value'))) {
              const headerObject = _.find(gridData.headers, o => o.data === 'Value');
              const indexVal = _.findIndex(gridData.headers, headerObj => _.includes(headerObj.fieldType, 'list'));
              if (indexVal > 0) {
                const newData = {Value: data.Value, config: headerObject.tagConfig};
                comThis.domService.appendComponent($('td:eq(' + indexVal + ')', row), TagComponent, newData);
              }
            } else if (!_.isUndefined(data['class']) && data['Version'] !== 0) {
              if (data['class'] === 'hidden') {
                $(row).css('display', 'none');
              }
            }
          },
          headerCallback: (thead, data, start, end, display) => {
            let allBtnDisabled = result && result.length > 0 ? '' : 'disabled';
            const childNodeText = thead.childNodes[0].innerText;
            allBtnDisabled = headers[0]['disabled'] ? 'disabled' : allBtnDisabled;
            if (this.checkboxCount) {
              $(thead).find('th').eq(0).addClass('selectAll').html('').append('<label title="Select All" class="control control--checkbox"><input ' +
                allBtnDisabled + ' type="checkbox"/> <div class="control__indicator"></div><span>' + childNodeText + '</span</label>');
            }
          },
        });
      }
    } else {

      console.log('this.tableId >>>')
      console.log(this.tableId);

      console.log('table >>>')
      console.log(table);

      this.tableWidget[this.tableId] = table.DataTable({
        columns: headers,
        columnDefs: defs,
        dom: domm,
        paging: option.isPagination === undefined ? result.length > pageLength ? true : false : option.isPagination,
        ordering: option.isOrdering === undefined ? true : option.isOrdering,
        info: option.isTableInfo === undefined ? true : option.isTableInfo,
        autoWidth: true,
        colReorder: false,
        fixedHeader: false,
        order: sortingColumn,
        buttons: buttons,
        pageLength: pageLength,
        lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, 'All']],
        language: {
          paginate: {
            next: '<i class="fa fa-angle-right" aria-hidden="true"></i>',
            previous: '<i class="fa fa-angle-left" aria-hidden="true"></i>'
          },
          emptyTable: _.isUndefined(option.isEmptyTable) ? 'No data available' : option.isEmptyTable,
          info: 'Showing <span>_END_</span> of <span>_TOTAL_</span>',
          infoEmpty: 'Showing <span> 0 </span> of <span> 0 </span> <span><i class="fa fa-angle-left" aria-hidden="true">' +
            '</i><i class="fa fa-angle-right" aria-hidden="true"></i> </span>',
        },
        rowCallback: (row, data, index) => {
          if (!_.isUndefined(data.Type)) {
            if (data.Type === 'list') {
              const indexVal = _.findIndex(data, newData => _.has(newData, 'Value'));
              comThis.domService.appendComponent($('td:eq(' + indexVal + ')', row), TagComponent, {
                Value: data.Value,
                id: data.id,
                label: data.Label,
                description: data.Description
              });
              if (option.isEditOption) {
                $('td:eq(' + indexVal + ')', row).append('<i class="fa fa-pencil" aria-hidden="true"></i>');
              }
            }
          } else if (!_.isUndefined(_.find(gridData.headers, o => o.data === 'Value'))) {
            const headerObject = _.find(gridData.headers, o => o.data === 'Value');
            const indexVal = _.findIndex(gridData.headers, headerObj => _.includes(headerObj.fieldType, 'list'));
            if (indexVal > 0) {
              const newData = {Value: data.Value, config: headerObject.tagConfig};
              comThis.domService.appendComponent($('td:eq(' + indexVal + ')', row), TagComponent, newData);
            }
          } else if (!_.isUndefined(data['class']) && data['Version'] !== 0) {
            if (data['class'] === 'hidden') {
              $(row).css('display', 'none');
            }
          }
        },
        headerCallback: (thead, data, start, end, display) => {
          let allBtnDisabled = result && result.length > 0 ? '' : 'disabled';
          const childNodeText = thead.childNodes[0].innerText;
          allBtnDisabled = headers[0]['disabled'] ? 'disabled' : allBtnDisabled;
          if (this.checkboxCount) {
            $(thead).find('th').eq(0).addClass('selectAll').html('').append('<label title="Select All" class="control control--checkbox"><input ' +
              allBtnDisabled + ' type="checkbox"/> <div class="control__indicator"></div><span>' + childNodeText + '</span</label>');
          }
        },
      });
    }

    // Insert the Row value from Data
    this.dataDraw();

    let editDivButton = '';
    editDivButton += '<div class="temp-btn">';
    editDivButton += '<button type="button" value="cancel" class="inaction-btn btn-cancel" >CANCEL</button>';
    editDivButton += '<button type="submit" value="Reset" class="action-btn btn-save">SAVE</button>';
    editDivButton += '</div>';

    // Adding New Row
    if (option.isAddRow) {
      $(comThis.addButtonID).on('click', e => {
        table.find('tr th:first-of-type input').prop('checked', false);
        // column visibility
        _.forEach(headers, (v, i) => {
          comThis.tableWidget[comThis.tableId - 1].columns(i).visible(true);
        });

        table.find('tfoot').remove();
        $('#addRow').prop('disabled', true);
        $(comThis.addButtonID).prop('disabled', true);
        $('.data-right-panel').removeClass('active');
        table.find('tr.selected').removeClass('selected');
        let tabAdd;
        if (result.length > 0) {
          tabAdd = table.find('tbody tr:eq(0)').clone();
        } else {
          tabAdd = table.find('thead tr:eq(0)').clone();
          table.find('tbody tr').addClass('hidden');
        }
        table.find('tbody').prepend(tabAdd);
        table.find('tbody tr').eq(0).addClass('newRow');

        const maparrr = _.map(headers, 'data');
        tabAdd.find('td,th').each((i: any, event: any) => {

          let hi = i;
          let tabIN = i;
          if (comThis.popupIdentifier) {
            tabIN = tabIN + 10;
          }

          hi = tabAdd.find('td,th').length === headers.length ? hi : hi + 1;
          const maxTxt = !_.isUndefined(headers[hi].maxLength) ? headers[hi].maxLength : '524288';
          const minTxt = !_.isUndefined(headers[hi].minLength) ? headers[hi].minLength : '0';

          headers[hi].editable = headers[hi].addEditable && !headers[hi].editable ? true : headers[hi].editable;
          if (headers[i]['isCheckbox']) {
            $(event).html('');
          } else if (headers[i]['fieldType'] === 'select') {
            const opt = [];
            opt.push('<option value="select">select</option>');
            headers[i]['fieldValues'].forEach((v, l) => {
              opt.push('<option value="' + v.value + '">' + v.text + '</option>');
            });
            $(event).html('<div class="form-group"><select tabindex="' + tabIN + '" id="' +
              maparrr[i] + '" class="form-fields" size="' + headers[hi].size + '"' + headers[hi].selectType + '>' + opt +
              '</select><div  class=\"valid-msg\" > Required Field </div></div>');
          } else if (headers[i]['fieldType'] === 'ngselect') {
            comThis.domService.appendComponent($(event), DropDownComponent, {
              data: headers[i]['fieldValues'], selected: [],
              config: headers[i]['config'], id: headers[i]['data']
            });
          } else if (headers[i]['fieldType'] === 'list') {
            $(event).parent().find('input,select').val();
            comThis.domService.appendComponent($(event), TagComponent);
          } else if (headers[hi].editable === false) {
            if (!_.isUndefined(headers[hi].onchange)) {

            } else {
              $(event).html('').append('<div class="form-group form-group-readonly"><input tabindex="' + hi +
                '" type="text" readonly id="' + maparrr[i] + '" data-index="" value="" class="form-fields ng-invalid"></div>');
            }
          } else if (headers[i]['fieldType'] === 'empty') {
            $(event).html('');
          } else {
            const typ = _.isUndefined(headers[hi].fieldType) ? 'text' : headers[hi].fieldType;
            let upc = _.isUndefined(headers[hi].fieldUppercase) ? '' : headers[hi].fieldUppercase;
            $(event).html('<div class="form-group"><input type="' + typ + '" maxlength="' + maxTxt +
              '" tabindex="' + tabIN + '" minlength="' + minTxt + '" id="' + maparrr[i] +
              '" class="form-fields"/><div  class="valid-msg" > Required Field </div></div>');
            upc = upc ? $(event).find('input').addClass('text-uppercase') : '';
          }
          if (i === ($(event).parent().children().length - 1)) {
            $(event).append(editDivButton).find('.btn-save').removeClass('btn-save')
            .addClass('btn-save-newrow').attr('tabindex', tabIN + 2);
            $(event).find('.btn-cancel').removeClass('btn-cancel').addClass('btn-cancel-newrow').attr('tabindex', tabIN + 1);
          }
        });
      });
    }

    let columnId = [];
    function ActiveCoumn() {
      // Create column search element
      const tableSearch = table.find('thead tr:eq(0)').html();
      table.find('thead').append('<tr class="filterCoulmn">' + tableSearch + '</tr>');
      table.find('tr.filterCoulmn th').each( (i: any, event: any) => {
        const title = $(event).text();
        if (headers[i]['isCheckbox'] || headers[i]['isFilterRequired'] === false || !_.isUndefined(headers[i]['searchcolumn'])) {
          $(event).html('');
        } else {
          $(event).html('<div class="form-group"><input type="text" placeholder="' + title +
            '" class="form-fields"/><span class="fa fa-times hidden"></span></div>');
        }
      });

      // Apply the search
      comThis.tableWidget[comThis.tableId - 1].columns().every( function() {
        const that = this;
        table.find('tr.filterCoulmn input').on('keyup change', (e: any) => {
          if ($(e.currentTarget).next('span').hasClass('hidden')) {
            $(e.currentTarget).next('span').removeClass('hidden');
          }
          if (e.currentTarget.value === '') {
            $(e.currentTarget).next('span').addClass('hidden');
          }
          if (that.search() !== e.currentTarget.value) {
            columnId.push($(e.currentTarget).parents('th,td').index());
            comThis.tableWidget[comThis.tableId - 1].column($(e.currentTarget).parents('th,td').index())
            .search(e.currentTarget.value, false, false, true).draw();
          }
        });
      });

      $('table').on('click', 'tr.filterCoulmn .fa-times', (event: any) => {
        $(event.currentTarget).prev('input').val('');
        $(event.currentTarget).addClass('hidden');
        columnId = _.uniq(columnId);
        const findId = $(event.currentTarget).parents('th').index();
        comThis.tableWidget[comThis.tableId - 1].column(findId).search('', false, false, true).draw();
      });
    }

    // Column visible
    $('.dt-buttons').on('click', '.fa-Ifilter', (event: any) => {
      const cls = table.find('button.btn-cancel');
      const ncls = $('.btn-cancel-newrow');
      $(cls).trigger('mousedown.cancel');
      $(ncls).trigger('mousedown.cancel');
      if ($('.fa-Ivisible').hasClass('active')) {
        $('.fa-Ivisible').trigger('click');
      }
      if (gridData.result.length <= 0) {
        comThis.toastr.warning('No Data');
        return false;
      }
      if (!table.find('tr.filterCoulmn').hasClass('active')) {
        ActiveCoumn();
        table.find('tr.filterCoulmn').addClass('active').prev('tr').addClass('searchFilterNot');
        $(event.currentTarget).addClass('active');
      } else {
        table.find('tr.filterCoulmn').prev('tr').removeClass('searchFilterNot');
        table.find('tr.filterCoulmn').remove();
        $(event.currentTarget).removeClass('active');
        comThis.tableWidget[comThis.tableId - 1].search('').draw();
        columnId = _.uniq(columnId);
        for (let i = 0; i < columnId.length; i++) {
          comThis.tableWidget[comThis.tableId - 1].column(columnId[i]).search('', false, false, true).draw();
        }
      }
    });

    $('.buttons-collection.buttons-colvis').on('click', '.fa-Ivisible', (event: any) => {
      table.find('tfoot').remove();
      const cls = table.find('button.btn-cancel');
      const ncls = $('.btn-cancel-newrow');
      $(cls).trigger('mousedown.cancel');
      $(ncls).trigger('mousedown.cancel');
      if ($('.fa-Ifilter').hasClass('active')) {
        $('.fa-Ifilter').trigger('click');
      }
      const visThis = $(event.currentTarget).parents('.visibleButton');
      setTimeout(() => {
        $(visThis).next('.dt-button-collection').find('.buttons-columnVisibility').each((i: any, e: any) => {
          if (i <= 1) {
            $(e.currentTarget).attr('disabled', true).addClass('disabled');
          }
        });
      }, 200);

      if (!$(event.currentTarget).hasClass('active')) {
        $(event.currentTarget).addClass('active');
      } else {
        $(event.currentTarget).removeClass('active');
      }
    });

    $('body').on('click', '.dt-button-background', (event: any) => {
      $('.fa-Ivisible').removeClass('active');
    });

    $(document).on('click','.buttons-colvisRestore, .buttons-collection,.buttons-columnVisibility', function () {
      $('.buttons-columnVisibility').each(function () {
        if($(this).hasClass('active')) {
          if($(this).find('.check-tick').length === 0)
            $('<span class="check-tick" style="font-family: wingdings; font-size: 200%; position: relative; top: 3px; left: -5px">&#252;</span>').insertBefore($(this).find('span'));
        } else {
          $(this).find('.check-tick').remove();
        }
      });
    });

    // Table Header Sorting action
    table.on('click', 'th', (event: any) => {
      if ($(event.currentTarget).hasClass('sorting_desc') || $(event.currentTarget).hasClass('sorting_asc')) {
        $(event.currentTarget).parents('tr').addClass('sorting-progress');
      } else {
        $(event.currentTarget).parents('tr').removeClass('sorting-progress');
      }
    });

    // On change Functionality
    table.on('change', '.switch input', function (e) {
      if ($(this).prop('checked')) {
        $(this).next('.slider').removeClass('in-active').addClass('a-tive');
      } else {
        $(this).next('.slider').removeClass('a-tive').addClass('in-active');
      }
      if (_.includes(_.map(gridData.headers, 'onloadField'), true)) {
        const obj = {};
        obj['feature'] = e.target.value;
        obj['status'] = e.target.checked;
        if (_.includes(_.map(comThis.onRoleFieldData, headers[0]['data']), e.target.value)) {
          _.forEach(comThis.onRoleFieldData, (v, i) => {
            if (v[headers[0]['data']] === e.target.value) {
              v['status'] = e.target.checked;
            }
          });
        } else {
          comThis.onRoleFieldData.push(obj);
        }
        comThis.rolesactionSection();
      } else {
        comThis.activeInactive(e);
      }

    });

    // Fill Global Parameters values onChange event
    table.on('change', 'select.globalParameters', function () {
      const selectedValue = $(this).val();
      const elementID = $(this).attr('id');

      if (elementID === 'Type') {
        if (!_.isUndefined(gridData.parametersType)) {
          const curSelectedValue = $(this).val();
          const $row = $(this).closest('tr');
          const ps = comThis.getRowData($row);
          let valueType = 'text';
          switch (curSelectedValue) {
            case 'boolean':
              valueType = 'select';
              break;
            case 'list':
              valueType = 'list';
              break;
            case 'text':
              valueType = 'text';
              break;
            default:
              valueType = 'text';
              break;
          }
          gridData.headers = [
            { key: '1', title: '', data: 'id', isFilterRequired: false, isCheckbox: true, fieldType: 'checkbox' },
            {
              key: '2', title: 'Label', data: 'Label', isFilterRequired: true, editButton: true, isCheckbox: false,
              fieldType: 'text', fieldValue: ps['Label']
            },
            {
              key: '3', title: 'Description', data: 'Description', isFilterRequired: true, editButton: true, isCheckbox: false,
              fieldType: 'text', fieldValue: ps['Description']
            },
            {
              key: '4', title: 'Type', data: 'Type', isFilterRequired: true, isCheckbox: false, fieldType: 'select',
              fieldValue: selectedValue, fieldOptions: [{ text: 'boolean', value: 'boolean' }, { text: 'text', value: 'text' },
              { text: 'list', value: 'list' }], class: 'globalParameters'
            },
            {
              key: '5', title: 'Value', data: 'Value', isFilterRequired: true, isCheckbox: false, fieldType: valueType,
              fieldOptions: [{ text: 'Yes', value: 'Yes' }, { text: 'No', value: 'No' }]
            }
          ];
          $(this).closest('tr').remove();
          comThis.createNewRow('', '');
        }
      } else {

        $(this).closest('tr').remove();
        const parameterToPass = gridData.parametersType === 'organization' ?
          gridData.globalParameters : gridData.organizationParameters;
        const selectedRow = _.find(parameterToPass, params => {
          if (params.Label === selectedValue) {
            return true;
          }
        });
        const fieldValuesArray = [];
        _.forEach(parameterToPass, parameter => {
          fieldValuesArray.push({ text: parameter.Label, value: parameter.Label });
        });
        const valueFieldType = selectedRow.Type === 'list' ? 'list'
          : selectedRow.Type === 'boolean' ? 'select' : 'text';
        gridData.headers = [
          { key: '1', title: '', data: 'ParameterId', isFilterRequired: false, isCheckbox: true, fieldType: 'checkbox' },
          {
            key: '2', title: 'Label', data: 'Label', class: 'globalParameters',
            isFilterRequired: true, editButton: true, isCheckbox: false,
            fieldType: 'select', fieldValue: selectedRow.Label,
            fieldOptions: fieldValuesArray
          },
          {
            key: '3', title: 'Description', data: 'Description', isFilterRequired: true, isCheckbox: false,
            fieldType: 'text', fieldValue: selectedRow.Description, isDisabled: true
          },
          {
            key: '4', title: 'Type', data: 'Type', isFilterRequired: true, isCheckbox: false, fieldType: 'text',
            fieldValue: selectedRow.Type, isDisabled: true
          },
          {
            key: '5', title: 'Value', data: 'Value', isFilterRequired: true, isCheckbox: false, fieldType: valueFieldType,
            fieldValue: selectedRow.Value, fieldOptions: [{ text: 'Yes', value: 'Yes' }, { text: 'No', value: 'No' }]
          }
        ];
        comThis.createNewRow('', 'inHerit');
      }
    });

    // table header sorting Action
    table.on('mousedown.edit', 'thead tr th', (e: any) => {
      if (comThis.setId !== 'modal-grid-table') {
        $(comThis.addButtonID).prop('disabled', false);
        $('.btn.action').prop('disabled', false);
      }
    });

    // On Edit Function ( creating editable row with form inputs )
    const editRowArray = [];
    function editRowRender() {
      if (!$(this).hasClass('fa-action-view')) {
      const $row = $(this).closest('tr').off('mousedown');
      const $tds = $row.find('td');
      const selectedRow = {};
      _.forEach(headers, (v, i) => {
        $.each($tds, (k: any, el: any) => {
          const txt = $(el).text();
          if (i === k) {
            selectedRow[v.data] = txt;
          }
        });
      });
      comThis.onEditRow(selectedRow);

      // Reset Button Actions
      table.find('tfoot').remove();
      $(comThis.addButtonID).prop('disabled', true);
      $('.btn.action').prop('disabled', true);
      $('.newRow').remove();
      $(this).parents(comThis.tableWrapper).removeClass('active');
      $('.data-right-panel').removeClass('active');
      table.find('tr.selected').removeClass('selected');
      $($row).addClass('editRow');

      $($row).find('td').eq(0).find('input').prop('checked', false);
      const elementID = $(this).attr('id');

      $.each($tds, function (i, el) {
        let fieldText = $(this).text();
        const headMap = _.map(headers, 'data');

        // Get input values on parameter list type change
        if (elementID === 'Type' && i !== 0) {
          if (_.includes(headMap, $(this).find('input,select').attr('id'))
            || $(this).find('input').hasClass('ng2-tag-input__text-input')
          ) {
            fieldText = $(this).find('input,select').val();
            if ($(this).find('input,select').attr('id') === 'Value' ||
              $(this).find('input,select').attr('id') === '') {
              fieldText = '';
            }
          }
        }
        let selectedValue = fieldText.split(',');
        selectedValue = selectedValue.length > 1 ? selectedValue : selectedValue[0].toLowerCase();
        const hi = i;
        const maxTxt = !_.isUndefined(headers[hi].maxLength) ? headers[hi].maxLength : '524288';
        const minTxt = !_.isUndefined(headers[hi].minLength) ? headers[hi].minLength : '0';
        const initialData = _.filter(gridData.result, v => v.id === $(this).parent().find('input').eq(0).val())[0] || [];
        let readOption = initialData['isDefault'] !== undefined
          && initialData['isDefault'] && headers[hi].data !== 'Description' ? 'readonly' : '';
        let readOptionClass = initialData['isDefault'] !== undefined
          && initialData['isDefault'] && headers[hi].data !== 'Description' ? 'form-group-readonly' : '';
        if (initialData['inherited']) {
          readOption = initialData['inherited'] !== undefined
            && initialData['inherited'] && headers[hi].data !== 'Value' ? 'readonly' : '';
          readOptionClass = initialData['inherited'] !== undefined
            && initialData['inherited'] && headers[hi].data !== 'Value' ? 'form-group-readonly' : '';
        }
        if (headers[hi].fieldType === 'ngselect') {
          comThis.domService.appendComponent(
            $(this), DropDownComponent,
            { data: headers[hi]['fieldValues'], selected: selectedValue, config: headers[hi]['config'], id: headers[hi]['data'] }
          );
        } else if (headers[hi].fieldType === 'select') {
          const opt = [];
          opt.push('<option value=\'\'>select</option>');
          const fieldOptions = headers[hi]['fieldOptions'] ? headers[hi]['fieldOptions'] : headers[hi]['fieldValues'];
          fieldOptions.forEach((v, l) => {
            const selectedAttribute = _.includes(selectedValue, v.text.toLowerCase()) ? 'selected' : '';
            // Setting Values field type for parameters
            if (selectedAttribute === 'selected') {
              switch (v.text) {
                case 'list':
                  headers[hi + 1].fieldType = 'list';
                  break;
                case 'text':
                  headers[hi + 1].fieldType = 'text';
                  break;
                case 'boolean':
                  headers[hi + 1].fieldType = 'select';
                  headers[hi + 1].fieldOptions = [
                    { text: 'Yes', value: 'Yes' },
                    { text: 'No', value: 'No' }
                  ];
                  break;
              }
            }

            opt.push('<option value="' + v.value + '" ' + selectedAttribute + ' >' + v.text + '</option>');
          });
          const readOptionDisable = readOption !== '' ? 'disabled' : '';
          $(this).html('').append('<div class="form-group ' + readOptionClass + '"><select ' + readOptionDisable +
            ' tabindex="' + hi + '" id="' + hKey[i] + '" ' + headers[hi].selectType + ' size="' + headers[hi].size + '"  data-index="' +
            fieldText + '" value="' + fieldText + '" class="form-fields ng-invalid">' + opt +
            '</select><div  class="valid-msg" > Required Field </div></div>');
        } else if (headers[hi].fieldType === 'list') {
          comThis.domService.appendComponent($(this), TagComponent, {
            Value: initialData['Value'], action: 'edit',
            id: initialData['id'], label: initialData['Label'], description: initialData['Description'],
            inHerit: initialData['inherited']
          });
        } else if (headers[hi].editable === false) {
          if (!_.isUndefined(headers[hi].onchange)) {
          } else {
            $(this).html('').append('<div class="form-group form-group-readonly"><input tabindex="' + hi +
              '" type="text" size="' + (fieldText.length - 2) + '" readonly id="' + hKey[i] + '" data-index="' +
              fieldText + '" value="' + fieldText + '" class="form-fields ng-invalid"></div>');
          }
        } else {
          if (headers[0].isCheckbox && hKey[i] === $(this).find('input').attr('id')) {
          } else {
            const typ = _.isUndefined(headers[hi].fieldType) ? 'text' : headers[hi].fieldType;
            let upc = _.isUndefined(headers[hi].fieldUppercase) ? '' : headers[hi].fieldUppercase;
            const required = _.isUndefined(headers[hi].required) ? '' : headers[hi].required;
            $(this).html('').append('<div class="form-group ' + readOptionClass + '"><input type="' + typ + '" ' + readOption +
              ' tabindex="' + hi + '" maxlength="' + maxTxt + '" minlength="' + minTxt + '"  id="' + hKey[i] + '" data-index="' +
              fieldText + '" data-required="' + required + '" value="' + fieldText +
              '" class="form-fields ng-invalid"><div  class="valid-msg" > Required Field </div></div>');
            upc = upc ? $(this).find('input').addClass('text-uppercase') : '';
          }
        }
        if (i === ($tds.length - 1)) {
          $(this).append(editDivButton);
        }
      });
     }
    }

    table.on('mousedown.edit', 'i.fa.fa-pencil', editRowRender);
    table.on('change', '.editRow select#Type', editRowRender);

    // Cancel on Edit Action
    table.on('mousedown.cancel', 'button.inaction-btn.btn-cancel', (e: any) => {
      table.find('tr th:first-of-type input').prop('checked', false);
      const chkID = result.length > 0 ? _.keys(result[0])[0] : '';
      const rowID = $(e.currentTarget).closest('tr').find('input#' + chkID).val();
      const initialRowData = _.find(result, { [chkID]: rowID });
      $(comThis.addButtonID).prop('disabled', false);
      $('.btn.action').prop('disabled', false);
      $(e.currentTarget).removeClass().addClass('fa fa-pencil');
      const $row = $(e.currentTarget).closest('tr');
      $($row).removeClass('editRow');
      const $tds = $row.find('td').not(':first');
      $.each($tds, (i: any, event: any) => {
        if (_.has($(event).find('input,select')['0'].attributes, ['data-index']) ||
          $(event).find('tag-input').length > 0) {
          initialRowData[headers[i + 1].data] = isBoolean(initialRowData[headers[i + 1].data])
            ? initialRowData[headers[i + 1].data].toString() : initialRowData[headers[i + 1].data];
          const txt = initialRowData ? initialRowData[headers[i + 1].data]
            : $(event).find('input,select')['0'].attributes['data-index'].nodeValue;
          if (_.isEqual(initialRowData[headers[i].data], 'list')) {
            const newData = { Value: initialRowData['Value'] };
            comThis.domService.appendComponent($(event).parent().find('td').eq(i + 1), TagComponent, newData);
          } else {
            $(event).parent().find('td').eq(i + 1).html('<dtext>' + txt.toString() + '</dtext>');
          }
        } else {
          if (_.has($(event).find('input,select')['0'].attributes, ['placeholder'])) {
            $(event).find('input,select')['0'].placeholder = '';
          }
          $(event).find('.temp-btn').remove();
        }
        if (headers[i + 1].editButton) {
          $(event).append('<i class="fa fa-pencil" aria-hidden="true"></i>');
        }
      });
      editRowArray.shift();
    });

    table.on('mousedown.remove', 'button.btn-remove', (e: any) => {
      $(e.currentTarget).closest('tr').remove();
    });

    // Save the Edit Row
    table.on('mousedown.save', 'button.btn-save', (e: any) => {
      const $row = $(e.currentTarget).closest('tr');
      const $tds = $row.find('td');
      const ps = {};
      $.each($tds, (i: any, event: any) => {
        const txt = $(event).find('input,select').val();
        const headMap = _.map(headers, 'data');
        if (_.includes(headMap, $(event).find('input,select').attr('id'))) {
          ps[$(event).find('input,select').attr('id')] = txt;
        } else if ($(event).find('tag').length > 0) {
          const tagOptions = _.filter(gridData.result, v => v.id === $(event).parent().find('input').eq(0).val())[0] || [];
          ps['Value'] = tagOptions['Value'];
        }
      });

      if (_.size(ps) > 1) {
        $(comThis.addButtonID).prop('disabled', false);
        $('.btn.action').prop('disabled', false);
        const k = [];
        $.each($tds, (i: any, event: any) => {
          const inp = $(event).find('tag').length > 0 ? 'tagComponent' : $(event).find('input,select').val();
          if (inp === '' && ($(event).find('input').attr('readonly') !== 'readonly' && $(event).find('input')
          .attr('data-required') === '')) {
            $(event).find('input,select,tag-input').addClass('ng-touched ng-invalid').removeClass('ng-valid ng-dirty');
            k.push(false);
          } else {
            $(event).find('input,select,tag-input').removeClass('ng-invalid').addClass('ng-valid ng-dirty');
            k.push(true);
          }
        });
        if (!_.includes(k, false)) {
          comThis.editRow(ps);
        } else {
          comThis.toastr.error('ERROR!', 'Field should not be empty');
        }
      } else {
        comThis.toastr.error('ERROR!', 'Nothing to changed');
      }
    });

    // Save the New Row
    table.on('mousedown.save', 'button.btn-save-newrow', (e: any) => {
      const inHeritStatus = _.includes(e.target.classList, 'inHerit');
      const $row = $(e.currentTarget).closest('tr');
      const $tds = $row.find('td,th');
      const ps = {};

      _.forEach(headers, (v, i) => {
        let txt = '', oldtxt = '';
        $.each($tds, (j: any, event: any) => {
          if ($(event).find('tag-input').length > 0 && v.data === 'Value') {

            if ($(event).find('tag-input').val() !== '' || !_.isUndefined($(event).parent().find('select#Label').val())) {
              const parameterToPass = gridData.parametersType === 'organization' ?
                gridData.globalParameters : gridData.organizationParameters;
              txt = _.filter(parameterToPass, vv => vv['Label'] === $(event).parent().find('select#Label')
              .val())[0]['Value'];
              ps[v.data] = txt;
            } else {
              ps[v.data] = '';
            }
          } else {
            txt = $(event).find('input,select').val();
            oldtxt = $(event).find('input,select').attr('data-index');
            if (v.data === $(event).find('input,select').attr('id')) {
              ps[v.data] = txt;
            }
          }
        });
      });
      if (_.size(ps) > 1) {
        const k = [];
        const $tds2 = headers[0].isCheckbox ? $row.find('td,th').not(':first') : $row.find('td,th');
        $.each($tds2, (i: any, event: any) => {
          if ($(event).find('tag-input').length === 0 || ($(event).find('tag-input').length === 1 &&
            !inHeritStatus && $(event).find('tag-input')['0'].tagName === 'TAG-INPUT')) {
            const inp = $(event).find('input,select').val();
            if ((inp === '' || _.isUndefined(inp)) && ($(event).find('input').attr('readonly') !== 'readonly')) {
              $(event).find('input,select,ng-multiselect-dropdown')
                .addClass('form-fields ng-pristine ng-invalid ng-touched').removeClass('ng-valid ng-dirty');
              $(event).find('tag-input').addClass('ng-invalid ng-touched').removeClass('ng-valid ng-dirty');
              k.push(false);
            } else {
              $(event).find('input,select,ng-multiselect-dropdown,tag-input').removeClass('ng-invalid').addClass('ng-valid ng-dirty');
              k.push(true);
            }
          }
        });
        if (!_.includes(k, false)) {
          $(comThis.addButtonID).prop('disabled', false);
          ps['inherit'] = inHeritStatus;
          comThis.addRow(ps);
        }
      } else {
        comThis.toastr.error('ERROR!', 'Nothing to changed');
      }
    });

    // Select Single Row to be Deleted
    var disableSelectAll = false;
    let arrayPush = [];
    table.on('change', 'tr td:first-of-type input', (event: any) => {
      const cls = table.find('#' + comThis.setId + ' button.btn-cancel');
      const ncls = $('#' + comThis.setId + ' .btn-cancel-newrow');
      $(cls).trigger('mousedown.cancel');
      $(ncls).trigger('mousedown.cancel');
      if (!$(event.currentTarget).prop('checked') && !_.includes(arrayPush, undefined)) {
        const itemToRemove = $(event.currentTarget).val();
        arrayPush = _.remove(arrayPush, v => v[gridData.headers[0].data] !== itemToRemove);
        table.find('tr th:first input:checkbox').prop('checked', false);
        $(comThis.removeButtonID).addClass('disabled');
        disableSelectAll = true;
      } else {
        const undeJs = {};
        let rmvFilter = _.filter(gridData.result, [gridData.headers[0].data, $(event.currentTarget).val()])[0];
        if (_.size(rmvFilter) === 0) {
          undeJs[$(event.currentTarget).attr('name').substring(0, $(event.currentTarget).attr('name').length - 2)] =
          $(event.currentTarget).val();
          undeJs[$(event.currentTarget).attr('id')] = $(event.currentTarget).val();
          undeJs['checked'] = $(event.currentTarget).prop('checked');
        }
        rmvFilter = _.size(rmvFilter) > 0 ? rmvFilter : undeJs;
        arrayPush.push(rmvFilter);
      }
      if (!arrayPush.length) {
        $(comThis.removeButtonID).addClass('disabled');
      } else {
        $(comThis.removeButtonID).prop('disabled', false);
        $(comThis.removeButtonID).removeClass('disabled');
      }

      if (result && arrayPush.length === result.length && !disableSelectAll) {
        table.find('tr th:first-of-type input').prop('checked', true);
      }

      comThis.rowSelected(arrayPush);
      if(comThis.sendResponseOnCheckboxClick) {
        comThis.emitSelecedOptions();
      }
    });


    // Select ALL
    table.on('change', 'tr th:first-of-type input', (event: any) => {
      const cls = table.find('#' + comThis.setId + 'button.btn-cancel');
      const ncls = $('#' + comThis.setId + '.btn-cancel-newrow');
      $(cls).trigger('mousedown.cancel');
      $(ncls).trigger('mousedown.cancel');
      const rows = comThis.tableWidget[0].rows({ search: 'applied' }).nodes();
      if (result.length > 0) {
        $(comThis.removeButtonID).removeClass('disabled');
        if (!$(event.currentTarget).prop('checked')) {
          $(comThis.removeButtonID).addClass('disabled');
          $.each(rows, (i: any, e: any) => {
            $(e).find('td:eq(0) input').prop('checked', false);
          });
          arrayPush = [];
        } else {
          $.each(rows, (i: any, e: any) => {
            if (!$(e).find('td:eq(0) input[type="checkbox"]').prop('disabled')) {
              $(e).find('td:eq(0) input').prop('checked', true);
              const val = $(e).find('td:eq(0) input').val();
              const undeJs = {};
              let rmvFilter = _.filter(gridData.result, [gridData.headers[0].data, val])[0];
              if (rmvFilter &&_.size(rmvFilter) === 0) {
                undeJs[$(e).attr('name').substring(0, $(e).attr('name').length - 1)] = val;
                undeJs[$(e).attr('id')] = true;
              }
              rmvFilter = _.size(rmvFilter) > 0 ? rmvFilter : undeJs;
              arrayPush.push(rmvFilter);
            }
          });
        }

        comThis.rowSelected(arrayPush);
      }
      if (!arrayPush.length) {
        $(comThis.removeButtonID).addClass('disabled');
      }
      // comThis.rowSelected(arrayPush);
      if(comThis.sendResponseOnCheckboxClick) {
        comThis.emitSelecedOptions();
      }
    });

    // Remove New Row
    table.on('mousedown.cancel', '.btn-cancel-newrow', (event: any) => {
      $('.btn.action').prop('disabled', false);
      $(comThis.addButtonID).prop('disabled', false);
      $(comThis.removeButtonID).addClass('disabled');
      $(event.currentTarget).parents('.newRow').remove();
      table.find('tbody tr').removeClass('hidden');
      table.find('tr th:first-of-type input').prop('checked', false);
    });

    // Opening tag popup window
    table.on('mousedown', '.editRow input.ng2-tag-input__text-input,  .newRow input.ng2-tag-input__text-input', (e: any) => {
      const $row = $(e.currentTarget).closest('tr');
      const $tds = $row.find('td,th');
      const updatedRow = {};
      $.each($tds, (i: any, event: any) => {
        const inputValue = $(event).find('input,select').val();
        const headMap = _.map(headers, 'data');
        if (_.includes(headMap, $(event).find('input,select').attr('id'))
          || $(event).find('input').hasClass('ng2-tag-input__text-input')
        ) {
          if (!_.isEmpty(inputValue)) {
            updatedRow[$(event).find('input,select').attr('id')] = inputValue;
          } else if ($(event).closest('tr').hasClass('editRow')) {
            updatedRow['Value'] = _.find(gridData.result, function (row) { return row.id === updatedRow['id']; }).Value;
          } else if (gridData.parametersType === 'organization' && comThis.addButtonID['id'] === 'inheritRow') {
            updatedRow['Value'] = _.find(gridData.globalParameters, { Label: updatedRow['Label'] }).Value;
          } else if (gridData.parametersType === 'partner' && comThis.addButtonID['id'] === 'inheritRow') {
            updatedRow['Value'] = _.find(gridData.organizationParameters, { Label: updatedRow['Label'] }).Value;
          } else {
            updatedRow['Value'] = [];
          }
        }
      });

      comThis.dataTableService.callComponentMethod(updatedRow);
    });

    // Selecting Row Details
    if (option.isRowSelection) {
      if (gridData.result && gridData.result.length > 0) {
        table.find('tbody tr').eq(0).addClass('selected');
        $('.data-right-panel').addClass('active');
        table.find('tbody tr').parents(comThis.tableWrapper).addClass('active');
        const rowId = table.find('tbody tr').eq(0).find('td').eq(0).find('input').val();
        const filterRowData = _.filter(gridData.result, v => v.id === rowId);
        setTimeout(() => {
          comThis.selectRowData(filterRowData);
        }, 500);
      }

      table.find('tbody').on('click', headers[0].isCheckbox ? 'td:not(:first)' : 'td', (e: any) => {
        if (($(e.currentTarget).parent('tr').hasClass('selected') || $(e.currentTarget).parent('tr').hasClass('editRow') ||
          $(e.currentTarget).parent('tr').hasClass('newRow') || $(e.currentTarget).find('button').hasClass('clone-btn'))
          && !headers[0].toggle) {
          $(e.currentTarget).parent('tr').removeClass('selected');
          $(e.currentTarget).parents(comThis.tableWrapper).removeClass('active');
          $('.data-right-panel').removeClass('active');
        } else {
          table.find('tr.selected').removeClass('selected');
          $(e.currentTarget).parent('tr').addClass('selected');
          $(e.currentTarget).parents(comThis.tableWrapper).addClass('active');
          $('.data-right-panel').addClass('active');
          const rowId = $(e.currentTarget).parent('tr').find('td').eq(0).find('input').val();
          const filterRowData = _.filter(gridData.result, v => v.id === rowId);
          comThis.selectRowData(filterRowData);
        }
      });
    }

    /*table find onload fields change*/
    if (_.includes(_.map(gridData.headers, 'onloadField'), true)) {
      const onLoad = _.filter(gridData.headers, 'onloadField');
      _.forEach(onLoad, (v, i) => {
        table.find('.accessRights').on('change', 'select', (event: any) => {
          if (event.currentTarget.value !== '') {
            const txt = $(event.currentTarget).parents('tr').find('td').eq(0).text();
            _.filter(gridData.result, (vv, ii) => {
              if (vv['feature'] === txt) {
                vv[onLoad[i]['data']] = event.currentTarget.value;
                if (_.includes(_.map(comThis.onRoleFieldData, 'feature'), txt)) {
                  _.forEach(comThis.onRoleFieldData, (vvv, iii) => {
                    if (vvv['feature'] === txt) {
                      vvv[onLoad[i]['data']] = event.currentTarget.value;
                    }
                  });
                } else {
                  comThis.onRoleFieldData.push(vv);
                }
              }
            });
          } else {
            comThis.onRoleFieldData = [];
          }
          comThis.rolesactionSection();
        });
      });

    }

    // Toogle Function
    table.on('mousedown.edit', '.toogleFunction', ( event: any ) => {
      const cls = table.find('button.btn-cancel');
      $(cls).trigger('mousedown.cancel');
      if (event.target.classList.contains('arrow-down')) {
        event.target.classList.remove('arrow-down');
        event.target.classList.add('arrow-right');
      } else {
        event.target.classList.add('arrow-down');
        event.target.classList.remove('arrow-right');
      }
      const tr = $(event.currentTarget).closest('tr');
      const row = comThis.tableWidget[comThis.tableId - 1].row( tr );
      _.forEach(row.data()['toggleOptions'], (v, i) => {
        const rowID = tr[0].rowIndex + i ;
        if ($(tr).parent().find('tr:eq(' + rowID + ')')[0].style.display === '') {
          $(tr).parent().find('tr:eq(' + rowID + ')').hide();
        } else {
          $(tr).parent().find('tr:eq(' + rowID + ')').show();
        }
      });
    });

    // Toggle toogleFunctionSummary
    function format ( d, ths ) {
      // console.log(d, ths);
      // let tb = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;width:100%">';
      let tb = '';
      _.forEach(d['toggleOptions'], (vv, ii) => {
        tb += '<tr class="toogleDataRow">';
          tb += '<td>&nbsp;</td>';
          tb += '<td><span style="word-break: break-all;white-space: normal;display: inline-block;">' + vv.reportName + '</span></td>';
          tb += '<td>' + d.period + '</td>';
          tb += '<td>' + d.createdBy + '</td>';
          tb += '<td>' + vv.run_date + '</td>';
          tb += '<td>' + vv.status + '</td>';
          let downV = '<a href="' + vv.signedUrl + '" download><i class="fa fa-download fa-action-view" style="opacity:1"></i></a>';
          if (vv.signedUrl === '') {
            downV = '<a ><i class="fa fa-download fa-action-view" style="opacity:0.5"></i></a>';
          }
          const trasV = '<i id="' + d.id + '" class="fa fa-trash deleteLink fa-action-view" style="opacity:1;color:#ef6269"></i>';
          tb += '<td>' + downV + '&nbsp;' + trasV + '</td>';
        tb += '</tr>';
            });
      // tb += '</table>';
      $(ths).after(tb);
      // return tb;
  }
    table.on('mousedown.edit', '.toogleFunctionSummary', ( event: any ) => {
      const cls = table.find('button.btn-cancel');
      $(cls).trigger('mousedown.cancel');
      if (event.target.classList.contains('arrow-downSummary')) {
        event.target.classList.remove('arrow-downSummary');
        event.target.classList.add('arrow-right');
      } else {
        event.target.classList.add('arrow-downSummary');
        event.target.classList.remove('arrow-right');
      }
      const tr = $(event.currentTarget).closest('tr');
      const row = comThis.tableWidget[comThis.tableId - 1].row( tr );
      // if ( row.child.isShown() ) {
        if ( $(tr).hasClass('shown') ) {
            // This row is already open - close it
            // row.child.hide();
            $('.toogleDataRow').remove();
            tr.removeClass('shown');
        } else {
            // Open this row
            // row.child( format(row.data(), tr) ).show();
            format(row.data(), tr);
            tr.addClass('shown');
        }
    });

    table.on('click', '.' + DataTableActionType.DELETE + 'Link', function () {
        comThis.handleDelete($(this).attr('id'), '');
    });

    // Sorting Reset the ROW fields edit and create
    table.on('mousedown.edit', '.sorting_desc,.sorting_asc,.sorting', ( event: any ) => {
      const cls = table.find('button.btn-cancel');
      $(cls).trigger('mousedown.cancel');

      const __this = this;
      setTimeout(function () {
        __this.setColumnColors();
        __this.appendColumnWith$();
      }, 500);

    });

    // $(document).on('click', '.editLink', function() {
    //   //eval("comThis."+$(this).attr('data-fuction'))(JSON.parse($(this)[0].attributes['data-rowData'].value), JSON.parse($(this)[0].attributes['data-full'].value), comThis);
    //    comThis.handleEdit(JSON.parse($(this)[0].attributes['data-rowData'].value), JSON.parse($(this)[0].attributes['data-full'].value), comThis);
    // });

    this.dataObject.gridData.headers.forEach((data, index) => {
      if (data['actionButton']) {
        data['actionButton'].forEach((v, i) => {
          const actionType = v['actionType']; // .editLint=k, .runLink, .downloadLink

          table.on('click', '.' + actionType + 'Link', function () {
            if (actionType === DataTableActionType.EDIT) {
              comThis.handleEdit(JSON.parse($(this)[0].attributes['data-rowData'].value),
                JSON.parse($(this)[0].attributes['data-full'].value));
            } else if (actionType === DataTableActionType.RUN) {
              comThis.handleRun(JSON.parse($(this)[0].attributes['data-rowData'].value),
                JSON.parse($(this)[0].attributes['data-full'].value));
            } else if (actionType === DataTableActionType.DOWNLOAD) {
              comThis.handleDownload(JSON.parse($(this)[0].attributes['data-rowData'].value),
                JSON.parse($(this)[0].attributes['data-full'].value));
            } else if (actionType === DataTableActionType.DELETE) {
              comThis.handleDelete(JSON.parse($(this)[0].attributes['data-rowData'].value),
                  JSON.parse($(this)[0].attributes['data-full'].value));
            }
          });
        });
      }
    });

    this.tableId = this.tableId + 1;

    this.setColumnColors();

    this.appendColumnWith$();
    // Sticky Header
    // $(function(){
    //   $(this.tableWrapper).floatThead();
    // });
  }

  appendColumnWith$() {
    // Append Fields with $ sign
    const appendFields = this.dataObject.gridData.columnsToAppend$;
    if(appendFields) {
      const __this = this;
      const indexes = [];
      $('#' + __this.setId).find('thead tr').each(function () {
        $(this).find('th').each(function (index) {
          appendFields.forEach(function (obj) {
            if(obj == $(this).text()) {
              indexes.push(index);
            }
          }, this);
        });
      });

      $('#' + __this.setId).find('tbody tr').each(function () {
        $(this).find('td').each(function (index) {
          indexes.forEach(function (obj) {
            if(obj == index && $(this).text().indexOf('$') == -1) {
              $(this).text('$ ' + $(this).text());
            }
          }, this);
        });
      });
    }
  }

  setColumnColors() {
    // Color Fields
    const colorFields = this.dataObject.gridData.columnsToColor;
    if(colorFields) {
      const __this = this;
      const indexes = [];
      $('#' + __this.setId).find('thead tr').each(function () {
        $(this).find('th').each(function (index) {
          colorFields.forEach(function (obj) {
            if(obj.name == $(this).text()) {
              indexes.push({
                index : index, color: obj.color
              });
              $(this).css('background-color', obj.color);
            }
          }, this);
        });
      });

      $('#' + __this.setId).find('tbody tr').each(function () {
        $(this).find('td').each(function (index) {
          indexes.forEach(function (obj) {
            if(obj.index == index) {
              $(this).css('background-color', obj.color);
            }
          }, this);
        });
      });
    }
  }

  emitSelecedOptions() {
    this.triggerActions.emit({
      rowData : this.getSelectedRows()
    });
  }

  /*Roles field onchange section*/
  rolesactionSection() {
    let data = '';
    if (_.includes(_.map(this.dataObject.gridData.headers, 'onloadField'), true) && this.onRoleFieldData.length > 0) {
      data = this.onRoleFieldData;
    }
    const inputChange = { functionRef: 'rolesOnchange', data: data };
    this.filterValues.emit(inputChange);
  }

  /*Grid onChange for Feature*/
  activeInactive(ev) {
    const data = _.filter(this.dataObject.gridData.result, (v, i) => v[this.dataObject.gridData.headers[0].data] === ev.target.value)[0];
    const inputChange = { id: ev.target.value, status: ev.target.checked, functionRef: 'onchange', data: data };
    this.filterValues.emit(inputChange);
  }

  dataDraw() {
    if (this.dataObject.gridData && this.dataObject.gridData.result) {
      const comThis = this;
      for (let i = 0; i < comThis.tableWidget.length; i++) {
        this.tableWidget[i].clear();
        this.dataObject.gridData.result.forEach((data, index) => {
          comThis.tableWidget[i].row.add(data);
        }, this);
        this.tableWidget[i].draw();
      }
    }
  }

  /**
   * Add New Row at top of the Grid Data
   * @param event
   */
  createNewRow(event: any, status: any) {

    // column visibility
    _.forEach(this.dataObject.gridData.headers, (v, i) => {
      this.tableWidget[this.tableId - 1].columns(i).visible(true);
    });
    $('.btn.action').prop('disabled', true);
    this.addButtonID = event.srcElement || this.addButtonID;
    const table: any = $('#' + this.setId);
    const headers = this.dataObject.gridData.headers;
    const result = this.dataObject.gridData.result;

    const comThis = this;
    let addDivButton = '';
    addDivButton += '<div class="temp-btn">';
    addDivButton += '<button type="button" id="btn-cancel" value="cancel" class="inaction-btn btn-cancel" >CANCEL</button>';
    addDivButton += '<button type="submit" value="Reset" class="action-btn btn-save">SAVE</button>';
    addDivButton += '</div>';
    table.find('tr th:first-of-type input').prop('checked', false);
    table.find('tfoot').remove();
    $(this.addButtonID).prop('disabled', true);
    $('.data-right-panel').removeClass('active');
    table.find('tr.selected').removeClass('selected');

    // Uncheck all checkboxes on Add function
    $.each(table.find('tbody tr'), (e: any) => {
      $(e.currentTarget).find('td:eq(0) input[type="checkbox"]').prop('checked', false);
    });

    let tabAdd;
    if (result.length > 0) {
      tabAdd = table.find('tbody tr:eq(0)').clone();
    } else {
      tabAdd = table.find('thead tr:eq(0)').clone();
      table.find('tbody tr').addClass('hidden');
    }
    table.find('tbody').prepend(tabAdd);
    table.find('tbody tr').eq(0).addClass('newRow');

    const maparrr = _.map(headers, 'data');
    tabAdd.find('td,th').each(function (i, n) {
      let hi = i;
      hi = tabAdd.find('td,th').length === headers.length ? hi : hi + 1;
      const maxTxt = headers[hi].maxLength !== undefined ? headers[hi].maxLength : '524288';
      const minTxt = headers[hi].minLength !== undefined ? headers[hi].minLength : '0';
      const disabled = headers[hi].isDisabled ? 'disabled' : '';
      const disabledClass = disabled !== '' ? 'form-group-readonly' : '';
      const fieldClass = headers[hi].class ? headers[hi].class : '';
      if (headers[i]['isCheckbox']) {
        $(this).html('');
      } else if (headers[i]['fieldType'] === 'select') {
        const opt = [];

        opt.push('<option value="">select</option>');
        headers[i]['fieldOptions'].forEach(v => {
          let fieldValue = headers[i]['fieldValue'] === v.value ? 'selected' : '';
          if (typeof headers[i]['fieldValue'] === 'boolean') {
            fieldValue = headers[i]['fieldValue'].toString() === v.value ? 'selected' : '';
          }
          opt.push('<option ' + fieldValue + ' value="' + v.value + '">' + v.text + '</option>');
        });
        $(this).html('<div class="form-group ' + disabledClass + '"><select ' + disabled +
          ' tabindex="' + hi + '" id="' + maparrr[i] + '" class="form-fields ' + fieldClass + '" size="' +
          headers[hi].size + '"' + headers[hi].selectType + '>' + opt + '</select><div  class="valid-msg" > Required Field </div></div>');
      } else if (headers[i]['fieldType'] === 'list') {
        const tagOptions = headers[i].fieldValue || [];
        const label = $(this).parent().find('input,select').eq(0).val();
        const description = $(this).parent().find('input,select').eq(1).val();
        comThis.domService.appendComponent($(this), TagComponent, {
          Value: tagOptions, id: '', label: label,
          description: description, action: 'add', inHerit: status
        });
      } else if (headers[i]['fieldType'] === 'empty') {
        $(this).html('');
      } else {
        const typ = headers[hi].fieldType === undefined ? 'text' : headers[hi].fieldType;
        let upc = headers[hi].fieldUppercase === undefined ? '' : headers[hi].fieldUppercase;
        const fieldValue = headers[hi].fieldValue || '';
        $(this).html('<div class="form-group ' + disabledClass + '"><input ' + disabled + ' tabindex="' + hi +
          '" value="' + fieldValue + '" type="' + typ + '" maxlength="' + maxTxt + '" minlength="' + minTxt +
          '" id="' + maparrr[i] + '" class="form-fields ' + fieldClass + '"/><div  class="valid-msg" > Required Field </div></div>');
        upc = upc ? $(this).find('input').addClass('text-uppercase') : '';

      }
      if (i === ($(this).parent().children().length - 1)) {
        $(this).append(addDivButton).find('.btn-save').removeClass('btn-save').addClass('btn-save-newrow ' + status);
        $(this).find('.btn-cancel').removeClass('btn-cancel').addClass('btn-cancel-newrow');
      }
    });
  }

  getRowData(tableRow) {
    const headers = this.dataObject.gridData.headers;
    const $tds = tableRow.find('td,th');
    const ps = {};
    _.forEach(headers, (v, i) => {
      let txt = '', oldtxt = '';
      $.each($tds, (j: any, event: any) => {
        txt = $(event).find('input,select').val();
        oldtxt = $(event).find('input,select').attr('data-index');
        if ($(event).find('input,select').attr('id') === v.data) {
          ps[v.data] = txt;
        }
      });
    });
    return ps;
  }

  /**
   * Edit Row Event Emitter
   * @param data
   */
  editRow(data) {
    const inputChange = { edit: data, functionRef: 'editRow' };
    this.filterValues.emit(inputChange);
  }

  /**
   * Delete Row Event Emitter
   * @param data
   */
  rowSelected(data) {
    const inputChange = { selected: data, functionRef: 'rowSelected' };
    this.filterValues.emit(inputChange);
  }

  onEditRow(v) {
    const inputChange = { edit: v, functionRef: 'onEditRow' };
    this.filterValues.emit(inputChange);
  }

  /**
   * Add Row Event Emitter
   * @param data
   */
  addRow(data) {
    const inputChange = { add: data, functionRef: 'addRow' };
    this.filterValues.emit(inputChange);
  }

  /**
   * Select Row Event Emitter
   * @param data
   */
  selectRowData(data) {
    const inputChange = { select: data, functionRef: 'selectRow' };
    this.filterValues.emit(inputChange);
  }

  /**
   * Next Step Event Emitter
   * @param data
   * @param id
   * @param id2
   */
  dataModelNext(v, id, id2) {
    const inputChange = { nxt: v, id: id, id2: id2, functionRef: 'nxtData' };
    this.filterValues.emit(inputChange);
  }

  handleEdit(rowObj: any, rowData: any) {
    this.dataTableAction.handleEdit(rowObj, rowData);
  }

  handleRun(rowObj: any, rowData: any) {
    this.dataTableAction.handleRun(rowObj, rowData);
  }

  handleDownload(rowObj: any,  rowData: any) {
    this.dataTableAction.handleDownload(rowObj, rowData);
  }

  handleEmail(rowObj: any,  rowData: any) {
    this.dataTableAction.handleEdit(rowObj, rowData);
  }

  handleDelete(rowObj: any,  rowData: any) {
    this.dataTableAction.handleDelete(rowObj, rowData);
  }
}
