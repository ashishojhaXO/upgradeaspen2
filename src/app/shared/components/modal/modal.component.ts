import { Component, OnInit, Input, ViewChild, Output, EventEmitter, TemplateRef } from '@angular/core';
import { BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { DataTableOptions } from '../../../../models/dataTableOptions';
import { MESSAGE } from '../../../../constants/message';
import * as _ from 'lodash';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})

export class ModalComponent implements OnInit {
  @ViewChild('autoShownModal') autoShownModal: ModalDirective;
  @Output()
  modalValues: EventEmitter<any> = new EventEmitter();
  @Input()
  modalData: any;

  inHerit: any;
  modalRef: BsModalRef;
  content: any = '';
  title: any = '';
  configuration: any = { isHeader: false };
  objectData: any;
  isDataAvailable: any = true;
  removeData: any = [];
  errorMessage: any = '';
  errorVisible: any = false;
  isModalShown = false;
  constructor(
    private modalService: BsModalService
  ) { }

  gridData: any;
  gridId2 = 'modal-grid-table';

  headers: any = [
    { key: '1', title: '', data: 'id', isFilterRequired: false, isCheckbox: true },
    { key: '2', title: 'Value', data: 'value', isFilterRequired: true, isCheckbox: false },
    { key: '3', title: 'Description', data: 'description', isFilterRequired: true, isCheckbox: false }
  ];

  options: Array<DataTableOptions> = [{
    isSearchColumn: false,
    isOrdering: false,
    isPageLength: 10,
    isTableInfo: false,
    isEditOption: true,
    isDeleteOption: true,
    isAddRow: true,
    isColVisibility: false,
    isRowSelection: false
  }];

  ngOnInit() {
    this.title = 'Modal Title';
    this.content = 'This is modal content';
    this.gridData = {};
    this.gridData['headers'] = this.headers;
    this.gridData['options'] = this.options[0];
  }

  triggerModal(object) {
    if (_.size(object.data) === 0 && !_.isUndefined(this.objectData) && !_.isUndefined(object.data) ) {
      object.data = this.objectData.data;
    }

    if (object.event === 'open') {
      let tempId = 0;
      const obj = [];
      for (const item of object.data) {
        item['id'] = tempId.toString();
        obj[tempId] = item;
        tempId++;
      }
      this.gridData['result'] = object.data.reverse();
      this.inHerit = object.inHerit;
      this.objectData = object;
      this.errorVisible = false;
      this.showModal();
    }
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  showModal(): void {
    this.isModalShown = true;
  }

  hideModal(): void {
    this.autoShownModal.hide();
  }

  onHidden(): void {
    this.isModalShown = false;
  }

  refreshData(event) {
    if (event.functionRef === 'addRow') {
      this.isDataAvailable = false;
      const id = this.objectData['data'].length > 0 ? (this.objectData['data'].length) : 0;
      event.add['id'] = String(id);
      this.objectData['data'].push(event.add);
      this.objectData['data'].reverse();
      setTimeout(() => this.isDataAvailable = true, 200);
    } else if (event.functionRef === 'editRow') {

    } else if (event.functionRef === 'removeRow') {
      this.removeData = event.remove;
    }
    this.errorVisible = false;
  }

  saveModal() {
    if (this.objectData['data'].length > 0) {
      this.modalValues.emit(this.objectData);
      this.errorVisible = false;
      this.hideModal();
    } else {
      this.errorMessage = MESSAGE.MODAL_PARAMETER_ADD_NEW_ERROR;
      this.errorVisible = true;
    }
  }

  handleRemove(e) {
    if (!e.target.classList.contains('disabled')) {
      this.isDataAvailable = false;
      const modalInstance = this;
      const itemRemove = [];
      _.forEach(this.objectData['data'], (v, i) => {
        if (!_.includes(_.map(modalInstance.removeData, 'id'), v['id'])) {
          itemRemove.push(v);
        }
      });
      this.gridData['result'] = itemRemove;
      this.objectData['data'] = itemRemove;
      e.target.classList.add('disabled');
      setTimeout(() => this.isDataAvailable = true, 200);
    }
  }

}
