/**
 * Copyright 2018. FusionSeven Inc. All rights reserved.
 *
 * Author: Arun Govindaraj
 * Date: 2018-05-10 12:11:31
 */

import { Component } from '@angular/core';
import { AppDataTableComponent } from './app-data-table.component';

@Component({
    selector: 'app-data-table-popup',
    templateUrl: './app-data-table-popup.component.html',
    styleUrls: ['./app-data-table.component.scss']
})

/**
 * Inheriting DataTableComponent for Popup Data Table
 */
export class AppDataTablePopupComponent extends AppDataTableComponent {

  // Overriding variables of DataTableComponent
  tableWrapper = '.dataTablePopupWrapper';
  addButtonID = '#add-parameter';
  removeButtonID = '#remove-parameter';
  popupIdentifier = true;

}
