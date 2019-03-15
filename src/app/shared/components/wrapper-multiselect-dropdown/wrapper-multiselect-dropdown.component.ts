import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-wrapper-multiselect-drop-down',
  templateUrl: './wrapper-multiselect-dropdown.component.html',
  styleUrls: ['./wrapper-multiselect-dropdown.component.scss']
})

export class WrapperMultiSelectDropdownComponent implements OnInit {

  constructor(public router: Router) {
  }

  @Output() valueUpdate: EventEmitter<{filterConfig: any }> = new EventEmitter<{filterConfig: any}>();
  @Input() filterConfig: any;
  @Input() dependentConfig: any;

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

    var selectedItem = {
      id: '2019-2-01',
      itemName: 'Feb 2019'
    };

    this.filterConfig.values.push(selectedItem);
    this.valueUpdate.emit(this.filterConfig);
  }

  getData() {
    var months = [];
    var monthName = new Array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');
    var d = new Date();
    for (var i=0; i<=12; i++) {
      months.push({
        'id' : d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + '01',
        'itemName' : monthName[d.getMonth()] + ' ' + d.getFullYear()
      })
      d.setMonth(d.getMonth() - 1);
    }
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
}
