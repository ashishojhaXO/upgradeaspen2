import {Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {formatDate} from 'ngx-bootstrap/chronos';

@Component({
  selector: 'app-wrapper-multiselect-drop-down',
  templateUrl: './wrapper-multiselect-dropdown.component.html',
  styleUrls: ['./wrapper-multiselect-dropdown.component.scss']
})

export class WrapperMultiSelectDropdownComponent implements OnInit, OnChanges {

  constructor(public router: Router) {
  }

  @Output() valueUpdate: EventEmitter<{filterConfig: any }> = new EventEmitter<{filterConfig: any}>();
  @Input() filterConfig: any;
  @Input() dependentConfig: any;
  @Input() updatedValue: any;

  selectedItems: any;
  settings: any;
  loading: any;
  data: any;

  ngOnInit() {

    this.selectedItems = this.filterConfig.values.map(function (v) {
      return {
        'id' : v,
        'itemName' : v
      };
    });

    this.settings = {
      singleSelection: !this.filterConfig.isMultiSelect,
      text: 'Select ' + this.filterConfig.label,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      labelKey: 'itemName',
      searchBy: ['itemName'],
      enableCheckAll: true,
      enableSearchFilter: true,
      showTooltip: true,
      tooltipElementsSize: 10
    };
    this.loading = false;
    this.data = this.getData();

    const selectedItem = this.data[0];
    this.selectedItems = [selectedItem];
    this.filterConfig.values.push(selectedItem);

    this.valueUpdate.emit(this.filterConfig);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['updatedValue']) {
      if (this.updatedValue) {
          this.selectedItems = this.updatedValue;
          this.filterConfig.values = this.updatedValue;
      }
    }
  }

  getData() {
    var months = [];
    var monthName = new Array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');
    var d = new Date();
    for (var i=0; i<=12; i++) {
      var monthVal = (d.getMonth() + 1).toString().length === 1 ? ('0' + (d.getMonth() + 1)) : (d.getMonth() + 1);
      const corrMonth = months.find(x=> x.id === (d.getFullYear() + '-' + monthVal + '-' + '01'));
      if(!corrMonth) {
        months.push({
          'id': d.getFullYear() + '-' + monthVal + '-' + '01',
          'itemName': monthName[d.getMonth()] + ' ' + d.getFullYear()
        })
      }
      d.setMonth(d.getMonth() - 1);
    }

    console.log('months >')
    console.log(months);
    return months;
  }

  handleSelect(selectedItem) {

    console.log('selectedItem >>')
    console.log(selectedItem);

    if(!this.filterConfig.isMultiSelect) {
      this.filterConfig.values = [];
    }
    this.filterConfig.values.push(selectedItem);
    this.valueUpdate.emit(this.filterConfig);
  }

  handleDeSelect(selectedItem) {
    var item = this.filterConfig.values.find(x => x.id === selectedItem);
    if(item) {
      this.filterConfig.values.splice(this.filterConfig.values.indexOf(item), 1);
    }
    this.valueUpdate.emit(this.filterConfig);
  }

  formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }
}
