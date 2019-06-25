/**
 * Copyright 2019. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2019-06-17 10:00:00
 */
import {Component, EventEmitter, Input, ViewChild, OnInit, Output, ElementRef, Sanitizer, SimpleChanges, OnChanges} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import 'datatables.net';
import * as _ from 'lodash';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { isBoolean } from 'util';
import { DataTableService } from '../../../../services';
import { DomService } from '../dom.service';
import {PopUpModalComponent} from '../pop-up-modal/pop-up-modal.component';
import { DropDownComponent } from '../dropdown/dropdown.component';
import { TagComponent } from '../tag/tag.component';
import * as common from '../../../../constants/common';
// import {ModalDirective} from 'ngx-bootstrap/modal';
import {Http} from '@angular/http';

declare var $: any;

@Component({
  selector: 'app-data-table2',
  templateUrl: './app-data-table2.component.html',
  styleUrls: ['./app-data-table2.component.scss'],
  moduleId: module.id
})
export class AppDataTable2Component implements OnInit, OnChanges {

  @Input() dataObject: any;
  Object = Object;
  @Output() triggerActions: EventEmitter<any> = new EventEmitter<any>();
  loaded = false;

  constructor(
    public toastr: ToastsManager,
    private formBuilder: FormBuilder,
    private domService: DomService,
    private dataTableService: DataTableService,
    private http: Http) {
  }

  ngOnInit(): void {
    // this.initializeTable();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['dataObject']) {
      console.log('dataObject >>>')
      console.log(this.dataObject);
      this.initializeTable();
    }
  }

  initializeTable() {

    const __this = this;

    if (this.dataObject) {

      const columns = this.dataObject.gridData.headers.map(function (x) {
        return { title : x.title };
      });

      // Add additional column in the row for checkboxes
      if (this.dataObject.gridData.options.isRowSelection) {
         columns.unshift({title: ''});
      }

      const dataSet = [];
      this.dataObject.gridData.result.forEach(function (result) {
          const rowData = [];
          if (this.dataObject.gridData.options.isRowSelection) {
            rowData.push('');
          }
          for (const prop in result) {
            const findProp = this.dataObject.gridData.headers.find(x => x.key === prop);
            if (findProp) {
              rowData.push(result[prop]);
            }
          }
          dataSet.push(rowData);
      }, this);

      const columnDefs = [];
      const gridButtons = [];

      let domConfig = '';
      if (this.dataObject.gridData.options) {

        let columnButtonDefs = '';
        if (this.dataObject.gridData.options.isEditOption) {
          columnButtonDefs += '<a class="fa fa-pencil fa-action-view editLink" style="margin-right: 15px; cursor: pointer">';
        }
        if (this.dataObject.gridData.options.isDeleteOption) {
          columnButtonDefs += '<a class="fa fa-trash fa-action-view deleteLink" style="cursor: pointer"></a>';
        }

        if (columnButtonDefs) {
          columns.push({
            title: 'Action'
          });
          columnDefs.push({
            targets: -1,
            defaultContent : columnButtonDefs
          });
        }

        if (this.dataObject.gridData.options.isRowSelection) {
          columnDefs.push({
            targets: 0,
            searchable: false,
            orderable: false,
            width: '30px',
            className: 'dt-body-center',
            render: function (data, type, full, meta){
              return '<input type="checkbox" name="id[]" value="' + $('<div/>').text(data).html() + '">';
            }
          });
        }

        if (this.dataObject.gridData.options.isDownload) {
          gridButtons.push({ extend: 'csv',
            text: '<span><i class="fa fa-download fa-Idown" aria-hidden="true"></i></span>',
          });
        }

        if (this.dataObject.gridData.options.isColVisibility) {
          gridButtons.push({ extend: 'colvis',
            text: '<span><i class="fa fa-cog fa-Ivisible" aria-hidden="true"></i></span>',
          });
        }

        if (this.dataObject.gridData.options.isSearchColumn) {
          domConfig += 'f';
        }

        domConfig += 'Bt';

        if (this.dataObject.gridData.options.isTableInfo) {
          domConfig += 'i';
        }

        if (this.dataObject.gridData.options.isPageLength) {
          domConfig += 'l';
        }

        if (this.dataObject.gridData.options.isPagination) {
          domConfig += 'p';
        }
      }

      if(!domConfig) {
        domConfig = 'fBtilp';
      }

      const dataTableOptions = {
        scrollY: 200,
        scrollX: true,
        columns: columns,
        data: dataSet,
        dom: domConfig, // l - length changing input control ,f - filtering input ,t - The table!,i - Table information summary,p - pagination control
        buttons: gridButtons,
        columnDefs: columnDefs,
          select: {
            style: this.dataObject.gridData.options.isRowSelection && this.dataObject.gridData.options.isRowSelection.isMultiple ? 'multi' : 'os',
            // selector: 'td:first-child'
          },
          order: [[ 1, 'asc' ]],
          rowCallback: function(nRow, aData, iDisplayIndex, iDisplayIndexFull){
            // Get row ID
            // console.log('ROW SELECTED >>')
            // console.log('header column length : ' + $('#example thead tr').eq(0).find('th').length);
            // console.log('body column length : ' + $('#example tbody tr').eq(0).find('td').length);

             // var rowId = aData[0];
            // // If row ID is in the list of selected row IDs
            // if($.inArray(rowId, rows_selected) !== -1){
            //   $(row).find('input[type="checkbox"]').prop('checked', true);
            //   $(row).addClass('selected');
            // }
          },
          createdRow : function ( row, data, index ) {
            if (__this.dataObject.gridData.columnsToColor) {
              __this.dataObject.gridData.columnsToColor.forEach(function (column) {
                   $('td', row).eq(column.index).css('background-color', column.color);
              });
            }
          }
      };


      // console.log('clearContents >>> ' + loaded);

      // if (loaded) {
      //   $('#example').DataTable().clear().destroy();
      //   $('#example').find('thead').empty();
      //   $('#example').find('tbody').empty();
      // }

      // if (!loaded) {
      //   this.loaded = true;
      // }

      console.log('dataTableOptions >>>')
      console.log(dataTableOptions);

      const table = $('#example').DataTable(dataTableOptions);

      // Set column display box location
      $('.dt-button.buttons-collection.buttons-colvis').on('click',function () {
        $('.dt-button-collection').css('left', '-90px');

        // Show tick for the selected items
        $('.dt-button-collection button.dt-button.buttons-columnVisibility').each(function () {
          if ($(this).hasClass('active') && !$(this).find('.check-tick').length) {
            $('<span class="check-tick" style="font-family: wingdings; font-size: 200%; position: relative; top: 3px; left: -5px">&#252;</span>').insertBefore($(this).find('span'));
          } else {
            $(this).find('.check-tick').remove();
          }
        });
      });

      // Delegate click event to show/hide tick
      $(document).on('click','.buttons-columnVisibility', function () {
        if ($(this).hasClass('active') && !$(this).find('.check-tick').length) {
          $('<span class="check-tick" style="font-family: wingdings; font-size: 200%; position: relative; top: 3px; left: -5px">&#252;</span>').insertBefore($(this).find('span'));
        } else {
          $(this).find('.check-tick').remove();
        }
      });

      // Apply selected class when a row is clicked
      $('#example tbody').on( 'click', 'tr', function () {
           $(this).toggleClass('selected');
      } );

      // Handle sort column event
      $('#example').on( 'order.dt', function () {
        // Remove sorting_1 class if a row is selected

        console.log('header column length : ' + $('#example thead tr').eq(0).find('th').length);
        console.log('body column length : ' + $('#example tbody tr').eq(0).find('td').length);
      });

      // Add header checkbox
      if (this.dataObject.gridData.options.isRowSelection && this.dataObject.gridData.options.isRowSelection.isMultiple) {
       if (!$('.dataTables_scrollHeadInner table.dataContainer thead tr').find('#example-select-all').length) {
         $('.dataTables_scrollHeadInner table.dataContainer thead tr th').eq(0).html('<input name="select_all" value="1" id="example-select-all" type="checkbox" />');
         $('.dataTables_scrollHeadInner table.dataContainer thead tr th').eq(0).css('position', 'relative');
         $('.dataTables_scrollHeadInner table.dataContainer thead tr th').eq(0).css('left', '7px');
       }
      }

      // Edit Click
      $('#example tbody').on('click', '.editLink', function () {
        const data = table.row($(this).parents('tr')).data();
        __this.triggerActions.emit({
          action: 'handleEdit',
          data: __this.dataObject.gridData.result[table.row($(this).parents('tr')).index()],
          rowIndex: table.row($(this).parents('tr')).index()
        });
      });

      // Delete Click
      $('#example tbody').on('click', '.deleteLink', function () {
        const data = table.row($(this).parents('tr')).data();
        __this.triggerActions.emit({
          action: 'handleDelete',
          data: __this.dataObject.gridData.result[table.row($(this).parents('tr')).index()],
          rowIndex: table.row($(this).parents('tr')).index()
        });
      });

      // Handle click on "Select all" control
      $('#example-select-all').on('click', function(){
        // Check/uncheck all checkboxes in the table
        var rows = table.rows({ 'search': 'applied' }).nodes();
        $('input[type="checkbox"]', rows).prop('checked', this.checked);
        if (this.checked) {
          $('input[type="checkbox"]', rows).closest('tr').addClass('selected');
          // if (!$('input[type="checkbox"]', rows).closest('tr').hasClass('selected')) {
          //   $('input[type="checkbox"]', rows).closest('tr').addClass('selected');
          // }
        } else {
            $('input[type="checkbox"]', rows).closest('tr').removeClass('selected');
          }
      });

      // Handle click on checkbox to set state of "Select all" control
      $('#example tbody').on('change', 'input[type="checkbox"]', function(){
        // If checkbox is not checked
        if(!this.checked){
          var el = $('#example-select-all').get(0);
          // If "Select all" control is checked and has 'indeterminate' property
          if(el && el.checked && ('indeterminate' in el)){
            // Set visual state of "Select all" control
            // as 'indeterminate'
            el.indeterminate = true;
          }
        }

        // Highlight selected rows
        if ($(this).is(':checked')) {
          if (!$(this).closest('tr').hasClass('selected')) {
            $(this).closest('tr').addClass('selected');
          }
        } else {
          $(this).closest('tr').removeClass('selected');
        }
      });


      // Handle table draw event
      table.on('draw', function(){
        // Update state of "Select all" control
        console.log('drawn ....')
      });

      // Handle table row select event
      table.on( 'select', function ( e, dt, type, indexes ) {
         table[ type ]( indexes ).nodes().to$().find('td input[type="checkbox"]').prop('checked', true);
      });

      // Handle table row deselect event
      table.on( 'deselect', function ( e, dt, type, indexes ) {
        table[ type ]( indexes ).nodes().to$().find('td input[type="checkbox"]').prop('checked', false);
      });


      // FORM SUBMIT
      $('#frm-example').on('submit', function(e){
        var form = this;
        // Iterate over all checkboxes in the table
        table.$('input[type="checkbox"]').each(function(){
          // If checkbox doesn't exist in DOM
          if(!$.contains(document, this)){
            // If checkbox is checked
            if(this.checked){
              // Create a hidden element
              $(form).append(
                  $('<input>')
                      .attr('type', 'hidden')
                      .attr('name', this.name)
                      .val(this.value)
              );
            }
          }
        });

        // FOR TESTING ONLY

        // Output form data to a console
        $('#example-console').text($(form).serialize());
        console.log("Form submission", $(form).serialize());

        // Prevent actual form submission
        e.preventDefault();
      });

    }
  }
}