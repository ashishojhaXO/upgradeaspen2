import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Subject} from 'rxjs/Subject';
import {MultiSelectDropdownAction} from './multiselect-dropdown-action';
import {MultiSelectDropdownSettings} from './multiselect-dropdown.settings';

@Component({
  selector: 'app-multiselect-drop-down',
  templateUrl: './multiselect-dropdown.component.html',
  styleUrls: ['./multiselect-dropdown.component.scss']
})

export class MultiSelectDropdownComponent implements OnInit {

  constructor(public router: Router) {
  }

  @Input()
  data: Array<any>;

  @Input()
  selectedItems: Array<any>;

  @Input()
  dropDownAction: MultiSelectDropdownAction;

  @Input()
  settings: MultiSelectDropdownSettings;

  @Input()
  loading: boolean;

  @Output('onSelect')
  onSelect: EventEmitter<any> = new EventEmitter<any>();

  @Output('onDeSelect')
  onDeSelect: EventEmitter<any> = new EventEmitter<any>();

  @Output('onSelectAll')
  onSelectAll: EventEmitter<Array<any>> = new EventEmitter<Array<any>>();

  @Output('onDeSelectAll')
  onDeSelectAll: EventEmitter<Array<any>> = new EventEmitter<Array<any>>();

  @Output('onOpen')
  onOpen: EventEmitter<any> = new EventEmitter<any>();

  @Output('onClose')
  onClose: EventEmitter<any> = new EventEmitter<any>();

  @Output('onScrollToEnd')
  onScrollToEnd: EventEmitter<any> = new EventEmitter<any>();

  @Output('onAddFilterNewItem')
  onAddFilterNewItem: EventEmitter<any> = new EventEmitter<any>();

  defaultSettings: MultiSelectDropdownSettings = {
    singleSelection: false,
    text: 'Select',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    primaryKey: 'id',
    labelKey: 'itemName',
    searchBy: ['itemName'],
    noDataLabel: 'No Data Available',
    enableCheckAll: true,
    enableSearchFilter: false,
    enableFilterSelectAll: false,
    disabled: false,
    searchPlaceholderText: 'Search',
    showCheckbox: true,
    searchAutofocus: true,
    addNewItemOnFilter: false,
    addNewButtonText: 'Add',
    maxHeight: 250,
    showTooltip: false,
    tooltipElementsSize: 10
  };

  cloneOfItemList = [];
  bufferSize = 10;
  searchTerm$ = new Subject<any>();

  ngOnInit() {
    this.settings = Object.assign(this.defaultSettings, this.settings);
    if (this.settings.enableServerSideSearch) {
      this.cloneOfItemList = JSON.parse(JSON.stringify(this.data));
      const resp = this.dropDownAction.handleSearch(this.searchTerm$);
      if (resp) {
        resp.subscribe(res => {
          if (res && res.body && res.body.length) {
            this.data = [];
            const matchedItems = res.body;
            let maxId = this.getMaxId(this.cloneOfItemList);
            matchedItems.forEach(item => {
              this.checkAndAdd(this.data, item, maxId);
              maxId = maxId + 1;
            });
          }
        });
      } else {
        this.data = this.cloneOfItemList;
      }
    }
  }

  onItemSelect(item: any) {
    if (this.settings.enableServerSideSearch) {
      this.checkAndAdd(this.cloneOfItemList, item, item.id);
      this.checkAndAdd(this.selectedItems, item, item.id);
    }

    this.onSelect.emit(item);
  }

  OnItemDeSelect(item: any) {
    if (this.settings.enableServerSideSearch) {
      this.checkAndRemove(this.cloneOfItemList, item);
      this.checkAndRemove(this.selectedItems, item);
    }

    this.onDeSelect.emit(item);
  }

  handleOnSelectAll(items: any) {
    this.onSelectAll.emit(this.selectedItems);
  }

  handleOnDeSelectAll(items: any) {
    this.onDeSelectAll.emit(this.selectedItems);
  }

  onSearch(evt: any) {
    const searchTerm = evt.target.value;
    const searchObj = {itemName: searchTerm};
    this.searchTerm$.next(searchObj);
  }

  onAddItem(data: string) {
    const maxId = this.getMaxId(this.cloneOfItemList);
    const item = {id: maxId, itemName: data};
    this.checkAndAdd(this.data, item, maxId);
    this.checkAndAdd(this.cloneOfItemList, item, maxId);
    this.checkAndAdd(this.selectedItems, item, maxId);
  }

  fetchMore(event: any) {
    if (event.end === this.data.length - 1) {
      this.loading = true;
      this.dropDownAction.fetchMore(this.data.length, this.bufferSize).then(chunk => {
        this.data = this.data.concat(chunk);

        if (this.cloneOfItemList && this.cloneOfItemList.length === 0) {
          this.cloneOfItemList = JSON.parse(JSON.stringify(this.data));
        } else {
          this.cloneOfItemList.concat(JSON.parse(JSON.stringify(this.data)));
        }

        this.loading = false;
      }, () => this.loading = false);
    }
  }

  private checkAndAdd(arr: any, item: any, id: any) {
    const found = arr.some(el => el.itemName === item.itemName);
    if (!found) {
      arr.push({id: id, itemName: item.itemName});
    }
  }

  private checkAndRemove(arr: any, item: any) {
    arr = arr.filter(el => el.itemName !== item.itemName);
  }

  private getMaxId(arr: any) {
    if (arr && arr.length === 0) {
      return 1;
    } else {
      const maxObject = this.getMax(arr);
      return maxObject.id + 1;
    }
  }

  private getMax(arr: any) {
    return arr.reduce((prev, current) => (prev.id > current.id) ? prev : current);
  }
}
