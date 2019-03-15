import {Subject} from 'rxjs/Subject';

export interface MultiSelectDropdownAction {

  handleSearch(searchSubject: Subject<any>);
  fetchMore(skip: number, limit: number);
}
