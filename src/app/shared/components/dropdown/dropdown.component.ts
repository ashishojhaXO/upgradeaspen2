/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Gobinath samuvel
 * Date: 2018-07-01
 */
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
@Component({
  selector: 'app-drop-down',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})

export class DropDownComponent implements OnInit {

  inputValues: any = [];
  dropDownSettings: any = {};
  data: any = [];
  selectedData = [];
  itemName = 'select';
  itemPlaceholder = '-';
  onSelected = [];
  onSingleSelection = true;
  enableCheckAll = false;
  itemLimit = 5;
  maxHeight = '500';
  searchFilter = true;
  ddID = 'ddID';
  dataIndex: any = '';
  oldData: any = [];
  ddClass = 'singleSelection';

  @Output()
  triggerModal: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
    if (!_.isUndefined(this['items'])) {
      if (this['items']['data'].length > 0) {
        this.data = _.sortBy(this['items']['data'], ['value']);
      }
      this.ddID = this['items']['id'];
      if (this['items']['selected'].length > 0 && !this['items']['config']['singleSelection']) {
        const selectItem = _.isArray(this['items']['selected']) ?
          _.uniq(this['items']['selected'].join().replace(/\s/g, '').split(',')) : this['items']['selected'];
        this.selectedData = !_.isArray(selectItem) ?
          _.filter(this.data, (v, i) => v['value'].toLowerCase() === selectItem.toLowerCase()) : selectItem;
        this.oldData = !_.isArray(selectItem) && _.size(this.selectedData) > 0 ? this.selectedData[0]['text'] : this.selectedData;
        this.onSelected = !_.isArray(selectItem) && _.size(this.selectedData) > 0 ? [this.selectedData[0]['text']] : this.selectedData;
        this.ddClass = 'multiselection';
      } else if (this['items']['selected'].length > 0 && this['items']['config']['singleSelection']) {
        this.selectedData = _.filter(this.data, (v, i) => v['text'].toLowerCase() === this['items']['selected'].toLowerCase());
        this.oldData = _.size(this.selectedData) > 0 ? this.selectedData[0]['text'] : [];
        this.onSelected = _.size(this.selectedData) > 0 ? [this.selectedData[0]['text']] : [];
      }
      if (_.size(this['items']['config']) > 0) {
        const config = this['items']['config'];
        this.onSingleSelection = config['singleSelection'];
        this.enableCheckAll = config['enableCheckAll'];
        this.itemLimit = config['itemLimit'];
        this.maxHeight = config['maxHeight'];
        this.searchFilter = config['searchFilter'];
      }
      this.dropDownSettings = {
        singleSelection: this.onSingleSelection,
        idField: 'value',
        textField: 'text',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        itemsShowLimit: this.itemLimit,
        allowSearchFilter: this.searchFilter,
        closeDropDownOnSelection: false,
        disabled: false,
        maxHeight: this.maxHeight,
        enableCheckAll: this.enableCheckAll,
      };
    }
  }

  onSelect(e) {
    if (this.onSingleSelection) {
      this.onSelected = _.isUndefined(e['value']) ? e : e['value'];
    } else {
      this.onSelected.push(e);
    }
    this.triggerModal.emit(this.onSelected);
  }

  onSelectAll(e) {
    this.onSelected = e;
    this.triggerModal.emit(this.onSelected);
  }

  onDeselect(e) {
    if (this.onSelected.length >= 1) {
      this.onSelected = _.pull(this.onSelected, e);
    }
    this.triggerModal.emit(this.onSelected);
  }

  onDeSelectAll(e) {
    this.onSelected = e;
    this.triggerModal.emit(this.onSelected);
  }

}
