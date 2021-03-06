import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { DataTableService } from '../../../../services';
@Component({
  selector: 'app-tag1',
  templateUrl: './tag1.component.html',
  styleUrls: ['./tag1.component.css']
})

export class Tag1Component implements OnInit {

  inputValues: any = [];
  @Input() tagData: any;
  @Output()
  triggerModal: EventEmitter<any> = new EventEmitter();
  items: any = [];
  tagConfig: any;
  removableData: any = false;
  editableData: any = false;
  disableData: any = false;
  onlyFromAutocomplete: any = false;
  tagDisable: any = '';
  secondaryPlaceHolder: any = '';
  placeHolder: any = '';
  tagDropDownValues: any = [];

  constructor(
    private dataTableService: DataTableService
  ) {
    this.dataTableService.componentMethodCalled$.subscribe(
      result => {
        const object = {
          event: 'open',
          data: typeof result.Value === 'object' ? result.Value : [],
          id: result.id,
          label: result.Label,
          description: result.Description,
          action: this.items['action'],
          inHerit: this.items['inHerit']
        };
        if (this.items['action'] === 'edit' || this.items['action'] === 'add') {
          this.triggerModal.emit(object);
        }
      }
    );
  }

  ngOnInit() {

    if (this.tagConfig !== undefined) {
      this.tagConfigFn();
    }

    this.formatInput();
  }

  tagConfigFn() {

    if (this.tagConfig.removable !== undefined) {
      this.removableData = this.tagConfig.removable;
    }

    if (this.tagConfig.editable !== undefined) {
      this.editableData = this.tagConfig.editable;
    }

    if (this.tagConfig.disable !== undefined) {
      this.tagDisable = 'tag-disable';
    }

    if (this.tagConfig.cleanseDropDown !== undefined) {
      this.onlyFromAutocomplete = true;
      this.tagDropDownValues = ['Remove space ( )', 'Remove hyphen (‑)', 'Remove period (.)'];
    }

  }

  /**
   * Conversion of array values to Objects.
   */
  formatInput() {
    this.items['Value'] = typeof this.items['Value'] === 'object' ? this.items['Value'] : [];
    const iterateItems = [];
    const objectValues = [];
    let count = 0;

    _.forEach(this.items['Value'], (object, key) => {

      objectValues.push({ id: key, display: object.value, value: object.value, readonly: 'true' });
      iterateItems.push({ id: String(key), value: object.value, description: object.description });
      count++;
    });

    this.inputValues = objectValues;
    this.items['Value'] = iterateItems;

    if (this.items['action'] === 'edit') {
      this.secondaryPlaceHolder = 'Add value(s)';
      if (this.items['inHerit']) {
        this.placeHolder = 'Remove value(s)';
      } else {
        this.placeHolder = 'Add / Remove value(s)';
      }
    } else if (this.items['action'] === 'add') {
      this.secondaryPlaceHolder = 'Add value(s)';
      this.placeHolder = 'Remove value(s)';
    } else {
      this.placeHolder = 'Add value';
      this.secondaryPlaceHolder = 'Add value';
    }
  }

  /**
   * Trigger tag values on focus event.
   */
  onInputFocused(e) {
    const object = {
      event: 'open',
      data: this.items['Value'],
      id: this.items['id'],
      label: this.items['label'],
      description: this.items['description'],
      action: this.items['action'],
      inHerit: this.items['inHerit']
    };
    if (this.items['action'] === 'edit' || this.items['action'] === 'add') {
      this.triggerModal.emit(object);
    }
  }
}
