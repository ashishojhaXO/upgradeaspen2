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
  @Input() displayLabel: boolean;
  @Input() displayClearOption: boolean;
  @Input() displayDropDownIcon: boolean;
  @Output() OnDelete = new EventEmitter();
  dataObject: any;
  showPopUp: boolean;
  tableId: any;
  customText: any;
  customValue: any;
  gridData: any;
  selected = [];
  selectedText: any;
  originalResult: any;
  originalSelection: any;

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
    if (this.filterConfig.displayDefault != null) {
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
    } else {
      if (this.filterConfig.values) {
        this.selectedText = '';
        this.filterConfig.values.forEach(function (item, index) {
          this.selectedText += item.label + (this.filterConfig.values.indexOf(item) !== (this.filterConfig.values.length - 1) ? ',' : '');
        }, this);
      }
    }
  }

  _OnDelete() {
    this.OnDelete.emit();
  }

  handleRowSelection(rowObj: any, rowData: any) {

  }

  invokePopUp(modalComponent: PopUpModalComponent) {
    this.tableId = 'table' + Math.floor(Math.random() * (1000 - 1 + 1)) + 1;
    this.dataObject.gridData = {};
    this.dataObject.gridData.options = this.externalGridData ? this.externalGridData.options : {
      isSearchColumn: true,
      isTableInfo: true,
      isEditOption: false,
      isDeleteOption: false,
      isAddRow: false,
      isColVisibility: false,
      isDownloadAsCsv: true,
      isDownloadOption: false,
      isRowSelection: {
        isMultiple : this.filterConfig.isMultiSelect
      },
      isPageLength: true,
      isPagination: true,
      sendResponseOnCheckboxClick: true
    };

    this.dataObject.gridData.headers = this.externalGridData ? this.externalGridData.headers : [
      // {
      //   'key': 'id',
      //   'title': '',
      //   'data': 'id',
      //   'isFilterRequired': false,
      //   'isCheckbox': true,
      //   'class': 'nocolvis'
      // },
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
    this.originalSelection = JSON.parse(JSON.stringify(this.filterConfig.values));

    if (this.externalGridData) {
      this.gridData = this.externalGridData.data;
      this.originalResult = JSON.parse(JSON.stringify(this.gridData));

      this.gridData.forEach(item => {
        item.isChecked = this.filterConfig.values.find( e => e.id == item.id) ? true : false;
      });

      this.showPopUp = true;
      this.dataObject.isDataAvailable = true;
      this.dataObject.gridData.result = this.gridData;

    } else {
      this.popupDataAction.getData(this.filterConfig, this.dependentConfig).subscribe(response => {

            this.showPopUp = true;

            if(response.length) {

              console.log('response >>!!!')
              console.log(response);

              this.gridData = response;
              this.originalResult = JSON.parse(JSON.stringify(this.gridData));
              this.gridData.options  = this.dataObject.gridData.options;
              this.dataObject.isDataAvailable = true;

              console.log('this.filterConfig.values >>>')
              console.log(this.filterConfig.values)

              this.gridData.forEach(item => {
                item.isChecked = this.filterConfig.values.find( e => e.id == item.id) ? true : false;
              });

              this.gridData = response.filter(function (x) {
                delete x.id
                return x;
              });

              console.log('this.gridData >>>')
              console.log(this.gridData)

              this.dataObject.gridData.result = this.gridData;
            }
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
      isSearchColumn: true,
      isTableInfo: true,
      isEditOption: false,
      isDeleteOption: false,
      isAddRow: false,
      isColVisibility: true,
      isDownloadAsCsv: true,
      isDownloadOption: false,
      isRowSelection: {
        isMultiple : this.filterConfig.isMultiSelect
      },
      isPageLength: true,
      isPagination: true
    };
    this.dataObject.gridData.headers = this.externalGridData ? this.externalGridData.headers : [
      // {
      //   'key': 'id',
      //   'title': '',
      //   'data': 'id',
      //   'isFilterRequired': false,
      //   'isCheckbox': true,
      //   'class': 'nocolvis'
      // },
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
      // id : this.customValue,
      label: this.customText,
      isChecked: false
    });

    this.customValue = '';
    this.customText = '';

    this.dataObject.gridData.result = this.gridData;
  }

  handleCloseModal(modalComponent: PopUpModalComponent) {
    this.showPopUp = false;
    modalComponent.hide();
    const retObj: any = this.filterConfig;

    console.log('this.originalResult >>')
    console.log(this.originalResult);

    console.log('this.originalSelection >>')
    console.log(this.originalSelection);

    if (this.originalResult) {
      retObj.values = [];

      this.originalResult.forEach(function (gridItem, index) {
        this.originalSelection.forEach(function (selectedItem) {
          if (gridItem.id === selectedItem['id']) {
            retObj.values.push(gridItem);
          }
        });
      }, this);

      console.log('this.originalSelection >>')
      console.log(retObj.values);

      this.valueUpdate.emit(retObj);
    }

  }

  onValueUpdate(modalComponent: PopUpModalComponent) {
    this.filterConfig.values = [];
    modalComponent.hide();
    const retObj: any = this.filterConfig;

    console.log('this.originalResult >>>>')
    console.log(this.originalResult);

    console.log('this.selected >>>>')
    console.log(this.selected);

    if (this.originalResult) {

      retObj.values = [];
      this.originalResult.forEach(function (gridItem, index) {
        this.selected.forEach(function (selectedItem) {
          if (gridItem.id === selectedItem['id']) {
            retObj.values.push(gridItem);
          }
        });
      }, this);

      console.log('retObj >>>>')
      console.log(retObj);

      this.valueUpdate.emit(retObj);
      this.selectedText = this.filterConfig.values.length > 1 ? 'Multiple' : this.filterConfig.values[0].label;
      // this.filterConfig.values.forEach(function (item, index) {
      //   this.selectedText += item.label + (this.filterConfig.values.indexOf(item) !== (this.filterConfig.values.length - 1) ? ',' : '');
      // }, this);
    }

    this.showPopUp = false;
  }

  handleCheckboxSelection(obj) {

    if (this.dataObject.gridData.options.isRowSelection && !this.dataObject.gridData.options.isRowSelection.isMultiple) {
      this.selected = [];
    }

    const selectedValue = {
      id: obj.data[Object.keys(obj.data)[0]],
      label: obj.data[Object.keys(obj.data)[0]]
    }

    this.selected.push(selectedValue);

    console.log('this.selected >>')
    console.log(this.selected);

  }

  handleUnCheckboxSelection(obj) {
    const unSelectedItem = this.selected.find(x=> x.id === obj.data.label || x.label === obj.data.label);
    if(unSelectedItem) {
      this.selected.splice(this.selected.indexOf(unSelectedItem), 1);
    }
  }

  handleHeaderCheckboxSelection(obj) {
    this.selected = [];
    if (obj.data.length) {
      this.originalResult.forEach(function(dat) {
        this.selected.push({
          id: dat.id,
          label: dat.label
        });
      }, this);
    }

    console.log('this.selected >>')
    console.log(this.selected);
  }
}
