import {Component, EventEmitter, Input, ViewChild, OnInit, Output, ElementRef, Sanitizer, SimpleChanges, OnChanges} from '@angular/core';
import {PopUpModalComponent} from '../pop-up-modal/pop-up-modal.component';
import {ToastsManager} from 'ng2-toastr';
import {ActivatedRoute, Router} from '@angular/router';
import {PopupDataAction} from './popup-data-action';
import { Http } from '@angular/http';

declare var $: any;
declare var jquery: any;

@Component({
  selector: 'app-popup-button',
  templateUrl: './app-popup-button.component.html',
  styleUrls: ['./app-popup-button.component.scss'],
  moduleId: module.id
})
export class AppPopupButtonComponent implements OnInit, OnChanges {

  @Output() valueUpdate: EventEmitter<{filterConfig: any }> = new EventEmitter<{filterConfig: any}>();
  @Input() filterConfig: any;
  @Input() externalGridData: any;
  @Input() dependentConfig: any;
  @Input() hideSelectedValues: boolean;
  @Input() popupDataAction: PopupDataAction;
  dataObject: any;
  showPopUp: boolean;
  tableId: any;
  customText: any;
  customValue: any;
  gridData: any;
  selected: any;
  selectedText: any;

  constructor(public toastr: ToastsManager,
              public router: Router,
              private http: Http) {
  }

  ngOnChanges(changes: SimpleChanges) {

  }

  ngOnInit() {
    this.dataObject = {};
    this.dataObject.isDataAvailable = false;
    this.selectedText = this.filterConfig.values.length ? this.filterConfig.values.join( ' , ') : '';
    if(this.filterConfig.displayDefault != null) {
      this.popupDataAction.getData(this.filterConfig, this.dependentConfig).subscribe(response => {
        if(response.length) {

          this.gridData = response;
          this.filterConfig.values = [response[0]];
          this.valueUpdate.emit(this.filterConfig);
          this.selectedText = '';
          this.filterConfig.values.forEach(function (item, index) {
            this.selectedText += item.label + (this.filterConfig.values.indexOf(item) !== (this.filterConfig.values.length - 1) ? ',' : '');
          }, this);
        }
      });
    }
  }

  invokePopUp(modalComponent: PopUpModalComponent) {
    this.tableId = 'table' + Math.floor(Math.random() * (1000 - 1 + 1)) + 1;
    this.dataObject.gridData = {};
    const isMultiSelect = this.filterConfig.isMultiSelect;
    this.dataObject.gridData.options = this.externalGridData ? this.externalGridData.options : {
      isSearchColumn: true,
      isOrdering: true,
      isTableInfo: true,
      isEditOption: true,
      isDeleteOption: true,
      isAddRow: true,
      isColVisibility: true,
      isRowSelection: true,
      isShowEntries: false,
      isPageLength: 5,
      isPagination: true,
      isEmptyTable: 'No data found.',
      isMultiSelect: isMultiSelect != null ? isMultiSelect : true
    };

    console.log('this.dataObject.gridData.options >>>');
    console.log(this.dataObject.gridData.options);

    this.dataObject.gridData.headers = this.externalGridData ? this.externalGridData.headers : [
      {
        'key': '_id',
        'title': '',
        'data': 'id',
        'isFilterRequired': false,
        'isCheckbox': true,
        'class': 'nocolvis'
      },
      {
        'key': 'label',
        'title': this.filterConfig.label,
        'data': 'label',
        'isFilterRequired': true,
        'editButton': false
      }
    ];

    modalComponent.show();

    this.selected = this.filterConfig.values;

    if (this.externalGridData) {
      this.gridData = this.externalGridData.data;
      this.showPopUp = true;
      this.dataObject.isDataAvailable = true;
      this.dataObject.gridData.result = this.gridData;

    } else {
      this.popupDataAction.getData(this.filterConfig, this.dependentConfig).subscribe(response => {
            this.showPopUp = true;

            if(response.length) {
              this.gridData = response;
              this.gridData.options  = this.dataObject.gridData.options;
              this.dataObject.isDataAvailable = true;

              this.gridData.forEach(item => {
                item.isChecked = this.filterConfig.values.find( e => e.id == item.id) ? true : false;
              });
              
              this.dataObject.gridData.result = this.gridData;
            }


            // if (resp && resp.length > 0) {
            //   this.gridData = resp;
            //   this.showPopUp = true;
            //   this.dataObject.isDataAvailable = true;
            //   this.dataObject.gridData.result = this.gridData;
            // }
          },
          err => {
            // const message = JSON.parse(err._body).error.errors[0].message;
          });
    };

    // if (!this.gridData) {
    //
    // } else {
    //
    //   this.popupDataAction.getData(this.filterConfig, this.dependentConfig).subscribe(response => {
    //         this.showPopUp = true;
    //
    //         if(response.length) {
    //           this.gridData = response;
    //           this.gridData.options  = this.dataObject.gridData.options;
    //           this.dataObject.isDataAvailable = true;
    //           this.dataObject.gridData.result = this.gridData;
    //         }
    //         // if (resp && resp.length > 0) {
    //         //   this.gridData = resp;
    //         //   this.showPopUp = true;
    //         //   this.dataObject.isDataAvailable = true;
    //         //   this.dataObject.gridData.result = this.gridData;
    //         // }
    //       },
    //       err => {
    //         // const message = JSON.parse(err._body).error.errors[0].message;
    //       });
    //   // this.gridData.forEach(item => {
    //   //   item.isChecked = this.filterConfig.values.find( e => e.id == item.id) ? true : false;
    //   // });
    //   //
    //   // this.showPopUp = true;
    //   // this.dataObject.isDataAvailable = true;
    //   // this.dataObject.gridData.result = this.gridData;
    // }
  }

  addItem() {
    var table = $('#' + this.tableId).DataTable();
    if (table) {
      console.log('table >>')
      console.log(table);
      table.destroy();
    }
    this.dataObject = {};
    this.dataObject.gridData = {};
    this.dataObject.isDataAvailable = true;
    this.dataObject.gridData.options = this.externalGridData ? this.externalGridData.options : {
      'isSearchColumn': true,
      'isOrdering': true,
      'isTableInfo': true,
      'isEditOption': true,
      'isDeleteOption': true,
      'isAddRow': true,
      'isColVisibility': true,
      'isRowSelection': true,
      'isShowEntries': false,
      'isPageLength': 5,
      'isEmptyTable': 'No data found'
    };
    this.dataObject.gridData.headers = this.externalGridData ? this.externalGridData.headers : [
      {
        'key': '_id',
        'title': '',
        'data': 'id',
        'isFilterRequired': false,
        'isCheckbox': true,
        'class': 'nocolvis'
      },
      {
        'key': 'label',
        'title': 'label',
        'data': 'label',
        'isFilterRequired': true,
        'editButton': false
      }
    ];

    if(!this.gridData) {
      this.gridData = [];
    }
    this.gridData.push({
      id : this.customValue,
      label: this.customText,
      isChecked: false
    });

    this.customValue = '';
    this.customText = '';

    this.dataObject.gridData.result = this.gridData;
  }

  handleCloseModal(modalComponent: PopUpModalComponent) {
    var table = $('#' + this.tableId).DataTable();
    if (table) {
      table.destroy();
    }
    this.showPopUp = false;
    modalComponent.hide();
  }

  onValueUpdate(modalComponent: PopUpModalComponent) {
    console.log(this.selected);
    this.filterConfig.values = [];
    var table = $('#' + this.tableId).DataTable();
    if (table) {
      table.destroy();
    }
    modalComponent.hide();
    const retObj: any = this.filterConfig;
    this.dataObject.gridData.result.forEach(function (gridItem, index) {
      this.selected.forEach(function (selectedItem) {
        if (gridItem.id === selectedItem['id']) {
          retObj.values.push(gridItem);
        }
      });
    }, this);

    console.log('retObj >>>>')
    console.log(retObj);

    this.valueUpdate.emit(retObj);
    this.selectedText = '';
    this.filterConfig.values.forEach(function (item, index) {
      this.selectedText += item.label + (this.filterConfig.values.indexOf(item) !== (this.filterConfig.values.length - 1) ? ',' : '');
    }, this);

    this.showPopUp = false;
  }

  refreshData(event) {
    // console.log('this.selected before >>>')
    // console.log(this.selected);
    // console.log(event);
    // if (event.functionRef === 'rowSelected' && event.selected && event.selected.length > 0) {
    //   this.selected = event.selected;
    // } else if (event.functionRef === 'selectRow' && event.select && event.select.length && this.selected && this.selected.length) {
    //   alert();
    //   var newlySelectedItems = this.selected.filter(function (item) {
    //     return item.id != event.select[0].id;
    //   });
    //   this.selected = newlySelectedItems;
    // }
    //
    // console.log('this.selected >>>')
    // console.log(this.selected);
  }

  interceptActions(event) {
    console.log('event.rowData >>')
    console.log(event.rowData);
    const selectedItems = [];
    event.rowData.forEach(function (fieldIndex) {
      var findEle = this.dataObject.gridData.result.find(x=> x.id == fieldIndex);
      if(findEle) {
        selectedItems.push(findEle);
      }
    }, this);
    this.selected = selectedItems;
    console.log('this.selected >>')
    console.log(this.selected);
  }
}
