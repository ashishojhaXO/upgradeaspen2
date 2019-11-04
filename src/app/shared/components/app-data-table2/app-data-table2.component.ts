/**
 * Copyright 2019. FusionSeven Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2019-06-17 10:00:00
 */
import {Component, EventEmitter, Input, ViewChild, OnInit, Output, ElementRef, Sanitizer, SimpleChanges, OnChanges} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import 'datatables.net';
import * as _ from 'lodash';
import {ToastsManager} from 'ng2-toastr/ng2-toastr';
import {isBoolean} from 'util';
import {DataTableService} from '../../../../services';
import {DomService} from '../dom.service';
import {PopUpModalComponent} from '../pop-up-modal/pop-up-modal.component';
import {DropDownComponent} from '../dropdown/dropdown.component';
import {TagComponent} from '../tag/tag.component';
import * as common from '../../../../constants/common';
// import {ModalDirective} from 'ngx-bootstrap/modal';
import {Headers, Http, RequestOptions} from '@angular/http';
import { DatePipe } from '@angular/common';
import { OktaAuthService } from '../../../../services/okta.service';
import set = Reflect.set;

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
    @Input() sendResponseOnCheckboxClick?: any;
    widget: any;
    api_fs: any;
    tableId = 'example';
    @Input() dataFieldsConfiguration: any;
    table: any;
    @Input() dataRowUpdated: boolean;
    @Input() identity: any;

    constructor(
        public toastr: ToastsManager,
        private formBuilder: FormBuilder,
        private domService: DomService,
        private dataTableService: DataTableService,
        private http: Http,
        private datePipe: DatePipe,
        private okta: OktaAuthService) {
    }

    ngOnInit(): void {
        this.widget = this.okta.getWidget();
        this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
        // console.log('this.externalTableId >>>@@@')
        // console.log(this.externalTableId);
        // if(this.externalTableId) {
        //     this.tableId = this.externalTableId;
        // }
        // this.initializeTable();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['dataObject'] || changes['dataRowUpdated']) {
            console.log('dataObject >>>');
            console.log(this.dataObject);

            console.log('this.dataObject.gridId >>>@@@##');
            console.log(this.dataObject.gridId);

            if(this.dataObject.gridId) {
                this.tableId = this.dataObject.gridId;
            }

            if ( $.fn.DataTable.isDataTable('#' + this.tableId) ) {
                $('#' + this.tableId).DataTable().clear().destroy();
                $('#' + this.tableId).empty();
            }

            const __this = this;
            setTimeout(function () {
                __this.initializeTable();
            }, 0);
            // this.initializeTable();
        }
    }

    initializeTable() {
        const __this = this;

        if (this.dataObject) {

            // columns defines the header columns
            const columns = this.dataObject.gridData.headers.map(function (x) {
                return {title: x.title};
            });

            // Add additional column in the row for checkboxes
            if (this.dataObject.gridData.options.isRowSelection) {
                columns.unshift({title: ''});
            }

            // Add additional column in the row for expand/collapse
            if (this.dataObject.gridData.options.isTree) {
                columns.unshift({title: ''});
            }

            const dataSet = [];
            if (this.dataObject.gridData.result) {
                this.dataObject.gridData.result.forEach(function (result) {
                    const rowData = [];
                    if (this.dataObject.gridData.options.isRowSelection) {
                        rowData.push('');
                    }
                    if (this.dataObject.gridData.options.isTree) {
                        rowData.push('');
                    }
                    for (const prop in result) {
                        const findProp = this.dataObject.gridData.headers.find(x => x.data === prop);
                        if (findProp) {
                            rowData.push(result[prop]);
                        }
                    }
                    dataSet.push(rowData);
                }, this);
            }

            console.log('dataSet >>>')
            console.log(dataSet);

            const columnDefs = []; // columnDef define the table body row schema
            const gridButtons = [];

            let domConfig = '';
            if (this.dataObject.gridData.options) {

                let columnButtonDefs = '';
                if (this.dataObject.gridData.options.isEditOption) {
                    columnButtonDefs += '<a class="fa fa-pencil fa-action-view editLink" style="margin-right: 15px; cursor: pointer">';
                }
                if (this.dataObject.gridData.options.isPlayOption) {
                    columnButtonDefs += '<a class="fa fa-play fa-action-view playLink" style="margin-right: 15px; cursor: pointer">';
                }
                if (this.dataObject.gridData.options.isDownloadOption) {
                    columnButtonDefs += '<a class="fa fa-download fa-action-view downloadLink" style="margin-right: 15px; cursor: pointer">';
                }
                if (this.dataObject.gridData.options.isDeleteOption) {
                    columnButtonDefs += '<a class="fa fa-trash fa-action-view deleteLink" style="cursor: pointer"></a>';
                }

                if (columnButtonDefs) {
                    columns.push({
                        title: 'ACTIONS'
                    });
                    columnDefs.push({
                        targets: -1,
                        defaultContent: columnButtonDefs
                    });
                }

                if (this.dataObject.gridData.options.isTree) {
                    columnDefs.push({
                        targets: 0,
                        searchable: false,
                        orderable: false,
                        width: '30px',
                        className: 'dt-body-center',
                        render: function (data, type, row, meta) {
                            return '<img class="details-control collapsed" style="width: 15px; cursor: pointer" src="./../../../../assets/images/expand.png"/>';
                        }
                    });
                }

                if (this.dataObject.gridData.options.isRowSelection) {
                    columnDefs.push({
                        targets: this.dataObject.gridData.options.isTree ? 1 : 0,
                        searchable: false,
                        orderable: false,
                        width: '30px',
                        className: 'dt-body-center',
                        render: function (data, type, row, meta) {
                            return '<input class="check-row-selection" type="checkbox" name="id[]" value="' + $('<div/>').text(data).html() + '">';
                        }
                    });
                }

                if (this.dataObject.gridData.options.isDownload) {
                    gridButtons.push({
                        extend: 'csv',
                        text: '<span><i class="fa fa-download fa-Idown" aria-hidden="true"></i></span>',
                        exportOptions: {
                            columns: ":visible"
                        }
                    });
                }

                if (this.dataObject.gridData.options.isColVisibility) {
                    gridButtons.push({
                        extend: 'colvis',
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

            if (!domConfig) {
                domConfig = 'fBtilp';
            }

            const dataTableOptions = {
                scrollY: 200,
                scrollX: true,
                retrieve: true,
                columns: columns,
                pageLength: localStorage.getItem('gridPageCount') || 25,
                data: dataSet,
                dom: domConfig, // l - length changing input control ,f - filtering input ,t - The table!,i - Table information summary,p - pagination control
                buttons: gridButtons,
                columnDefs: columnDefs,
                select: {
                    style: this.dataObject.gridData.options.isRowSelection && this.dataObject.gridData.options.isRowSelection.isMultiple ? 'multi' : 'os',
                },
                order: [[1, 'asc']],
                rowCallback: function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    // Get row ID
                    // console.log('ROW SELECTED >>')
                    // console.log('header column length : ' + $('#example thead tr').eq(0).find('th').length);
                    // console.log('body column length : ' + $('#example tbody tr').eq(0).find('td').length);

                    //  var rowId = aData[0];
                    // // If row ID is in the list of selected row IDs
                    // if($.inArray(rowId, rows_selected) !== -1){
                    //   $(row).find('input[type="checkbox"]').prop('checked', true);
                    //   $(row).addClass('selected');
                    // }
                },
                createdRow: function (row, data, index, cells) {
                    if (__this.dataObject.gridData.columnsToColor) {
                        __this.dataObject.gridData.columnsToColor.forEach(function (column) {
                            $('td', row).eq(column.index).css('background-color', column.color);
                        });
                    }

                    if (__this.dataObject.gridData.result[index] && __this.dataObject.gridData.result[index].isChecked) {
                        $('td', row).find('input.check-row-selection').prop('checked', true);
                        // $(row).addClass('selected');
                    }

                    // Initialize inline-edit fields
                    if (__this.dataFieldsConfiguration) {
                        __this.dataFieldsConfiguration.forEach(function (field) {
                            const headerColumnField = __this.dataObject.gridData.headers.find(x=> x.key === field.name);
                            if (headerColumnField) {
                                let columnIndex = __this.dataObject.gridData.headers.indexOf(headerColumnField);
                                if (__this.dataObject.gridData.options.isRowSelection) {
                                    columnIndex++;
                                }
                                if (field.type === 'text' || field.type === 'decimal' || field.type === 'varchar') {
                                    $('td', row).eq(columnIndex).html('<div class="form-group" rowIndex="' + index + '" columnIndex="' + columnIndex + '"><input placeholder="Select ' + field.label + '" class="inlineEditor" type="text" style="width:' + (((field.size ? field.size : 20) * 7.5) + 10)  + 'px; padding: 6px 12px; font-size: 12px; height: 34px; color: #495057; border: 1px solid #ced4da;background-clip: padding-box; border-radius: 4px" value="' + $('td', row).eq(columnIndex).text() +  '"/></div><div class="col-lg-12 col-md-12 form-field alert alert-danger" style="display:' + ($('td', row).eq(columnIndex).text() ? 'none' : 'inline-block') + '"><div>' + field.label  + ' is required</div></div>');
                                } else if (field.type === 'int') {
                                    $('td', row).eq(columnIndex).html('<div class="form-group" rowIndex="' + index + '" columnIndex="' + columnIndex + '"><input placeholder="Select ' + field.label + '" class="inlineEditor" type="number" style="width:' + (((field.size ? field.size : 20) * 7.5) + 10)  + 'px; padding: 6px 12px; font-size: 12px; height: 34px; color: #495057; border: 1px solid #ced4da;background-clip: padding-box; border-radius: 4px" value="' + $('td', row).eq(columnIndex).text() +  '"/></div><div class="col-lg-12 col-md-12 form-field alert alert-danger" style="display:' + ($('td', row).eq(columnIndex).text() ? 'none' : 'inline-block') + '"><div>' + field.label  + ' is required</div></div>');
                                } else if (field.type === 'amount') {
                                    $('td', row).eq(columnIndex).html('<div class="form-group" rowIndex="' + index + '" columnIndex="' + columnIndex + '">' + (field.includeCurrency ? '<select style="width: 38px; padding: 6px 12px; font-size: 12px; height: 33px; color: #495057; border: 1px solid #ced4da; background-clip: padding-box; border-radius: 4px;"><option value="$">$</option></select>' : '') + '<input placeholder="Select ' + field.label + '" class="inlineEditor" type="text" style="width:' + (((field.size ? field.size : 20) * 7.5) + 10)  + 'px; padding: 6px 12px; font-size: 12px; height: 34px; color: #495057; border: 1px solid #ced4da;background-clip: padding-box; border-radius: 4px" value="' + $('td', row).eq(columnIndex).text() +  '"/></div><div class="col-lg-12 col-md-12 form-field alert alert-danger" style="display:' + ($('td', row).eq(columnIndex).text() ? 'none' : 'inline-block') + '"><div>' + field.label  + ' is required</div></div>');
                                } else if (field.type === 'date') {
                                    const html = '<div class="form-group" rowIndex="' + index + '" columnIndex="' + columnIndex + '"><div class="input-group date datepicker"><input placeholder="Select ' + field.label + '" type="text" class="form-control inlineEditor" style="border-radius: 4px; font-size: 12px" value="' + $('td', row).eq(columnIndex).text()  + '" /> <span class="input-group-addon"><span class="glyphicon glyphicon-th"></span></span></div></div><div class="col-lg-12 col-md-12 form-field alert alert-danger" style="display:' + ($('td', row).eq(columnIndex).text() ? 'none' : 'inline-block') + '"><div>' + field.label  + ' is required</div></div>';
                                    $('td', row).eq(columnIndex).html(html);
                                } else if (field.type === 'list') {
                                    let options = '';
                                    field.options.forEach(function (option) {
                                        options += '<option value="' + option.key + '">' + option.text + '</option>';
                                    });
                                    const html = '<div class="form-group" rowIndex="' + index + '" columnIndex="' + columnIndex + '"><select class="form-control inlineEditor" style="border-radius: 4px; font-size: 12px; width:' + (((field.size ? field.size : 20) * 7.5) + 10)  + 'px;">' + options  + '</select></div><div class="col-lg-12 col-md-12 form-field alert alert-danger" style="display:' + ($('td', row).eq(columnIndex).text() ? 'none' : 'inline-block') + '"><div>' + field.label  + ' is required</div></div';
                                    $('td', row).eq(columnIndex).html(html);
                                }
                            }
                        });
                    }
                }
            };

            console.log('dataTableOptions >>>');
            console.log(dataTableOptions);

            // Initialize Data Table
            const table = $('#' + this.tableId).DataTable(dataTableOptions);
            this.table = table;

            console.log('table >>>');
            console.log(table);

            // Set column display box location
            $('.dt-button.buttons-collection.buttons-colvis').on('click', function () {
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
            $(document).on('click', '.buttons-columnVisibility', function () {
                if ($(this).hasClass('active') && !$(this).find('.check-tick').length) {
                    $('<span class="check-tick" style="font-family: wingdings; font-size: 200%; position: relative; top: 3px; left: -5px">&#252;</span>').insertBefore($(this).find('span'));
                } else {
                    $(this).find('.check-tick').remove();
                }
            });

            // Apply selected class when a row is clicked
            $('#' + this.tableId + ' tbody').on('click', 'tr', function () {
                if (__this.dataObject.gridData.options.isRowHighlight) {
                    $(this).toggleClass('selected');
                }
            });

            // Handle sort column event
            $('#' + this.tableId).on('order.dt', function () {
                // Remove sorting_1 class if a row is selected
            });

            // Add header checkbox
            if (this.dataObject.gridData.options.isRowSelection && this.dataObject.gridData.options.isRowSelection.isMultiple) {
                if (!$('.dataTables_scrollHeadInner table.dataContainer thead tr').find('#' + this.tableId + '-select-all').length) {
                    $('.dataTables_scrollHeadInner table.dataContainer thead tr th').eq(0).html('<input name="select_all" value="1" id="' + this.tableId + '-select-all" type="checkbox" />');
                    $('.dataTables_scrollHeadInner table.dataContainer thead tr th').eq(0).css('position', 'relative');
                    $('.dataTables_scrollHeadInner table.dataContainer thead tr th').eq(0).css('left', '7px');
                }
            }

            // On row selection
            $('#' + this.tableId + ' tbody').on('click', 'tr', function () {
                __this.triggerActions.emit({
                    action: 'handleRowSelection',
                    data: table.row( this ).data(),
                    tableId: __this.tableId,
                    rowIndex: table.row(this).index()
                });
            });

            // Edit Click
            $('#' + this.tableId + ' tbody').on('click', '.editLink', function () {
                // const data = table.row($(this).parents('tr')).data();
                __this.triggerActions.emit({
                    action: 'handleEdit',
                    data: __this.dataObject.gridData.result[table.row($(this).parents('tr')).index()],
                    rowIndex: table.row($(this).parents('tr')).index()
                });
            });

            // Run/Play Click
            $('#' + this.tableId + ' tbody').on('click', '.playLink', function () {
                // const data = table.row($(this).parents('tr')).data();
                __this.triggerActions.emit({
                    action: 'handleRun',
                    data: __this.dataObject.gridData.result[table.row($(this).parents('tr')).index()],
                    rowIndex: table.row($(this).parents('tr')).index()
                });
            });

            // Download Click
            $('#' + this.tableId + ' tbody').on('click', '.downloadLink', function () {
                // const data = table.row($(this).parents('tr')).data();
                __this.triggerActions.emit({
                    action: 'handleDownload',
                    data: __this.dataObject.gridData.result[table.row($(this).parents('tr')).index()],
                    rowIndex: table.row($(this).parents('tr')).index()
                });
            });

            // Delete Click
            $('#' + this.tableId + ' tbody').on('click', '.deleteLink', function () {
                // const data = table.row($(this).parents('tr')).data();
                __this.triggerActions.emit({
                    action: 'handleDelete',
                    data: __this.dataObject.gridData.result[table.row($(this).parents('tr')).index()],
                    rowIndex: table.row($(this).parents('tr')).index()
                });
            });

            // Handle click on "Select all" control
            $('#' + this.tableId + '-select-all').on('click', function () {

                // Check/uncheck all checkboxes in the table
                const rows = table.rows({'search': 'applied'}).nodes();
                $('input.check-row-selection', rows).prop('checked', this.checked);
                this.checked ? table.rows().select() : table.rows().deselect();

                if (__this.sendResponseOnCheckboxClick) {
                    __this.triggerActions.emit({
                        action: 'handleHeaderCheckboxSelection',
                        data: this.checked ? __this.dataObject.gridData.result : []
                    });
                }
            });

            // Handle click on checkbox to set state of "Select all" control
            $('#' + this.tableId + ' tbody').on('change', 'input.check-row-selection', function () {
                // If checkbox is not checked
                if (!this.checked) {
                    const el = $('#' + this.tableId + '-select-all').get(0);
                    // If "Select all" control is checked and has 'indeterminate' property
                    if (el && el.checked && ('indeterminate' in el)) {
                        // Set visual state of "Select all" control
                        // as 'indeterminate'
                        el.indeterminate = true;
                    }
                }

                // Highlight selected rows
                // if ($(this).is(':checked')) {
                //   if (!$(this).closest('tr').hasClass('selected')) {
                //     $(this).closest('tr').addClass('selected');
                //   }
                // } else {
                //   $(this).closest('tr').removeClass('selected');
                // }
            });

            // Handle table draw event ( like pagination, sorting )
            table.on('draw', function () {
                // Update state of "Select all" control
                console.log('drawn ....');
            });

            // Highlight pre checked rows
            if (__this.dataObject.gridData && __this.dataObject.gridData.result) {
                __this.dataObject.gridData.result.forEach(function (data, index) {
                    if (data.isChecked) {
                        table.row(':eq(' + index + ')').select();
                    }
                });
            }

            // FIX *** FOR PROBLEM WHERE THE COLUMN WIDTH IS RENDERED INCORRECTLY
            setTimeout(function () {
                table.columns.adjust().draw();
            }, 0);

            __this.registerCheckboxSelection(table, __this);
            __this.registerUnCheckboxSelection(table, __this);

            // Event for tree grid
            $('#' + this.tableId + ' tbody').on('click', 'img.details-control', function () {


                console.log('__this.dataObject.gridData >>');
                console.log(__this.dataObject.gridData);

                const tr = $(this).closest('tr');
                const row = table.row(tr);
                const rowData = __this.dataObject.gridData.result[row[0][0]];

                if ($(this).hasClass('collapsed')) {

                    $(this).attr('src', './../../../../assets/images/collapse.png');
                    $(this).removeClass('collapsed');

                    if(__this.dataObject.gridData.options.inheritHeadersForTree) {
                        if (!tr.hasClass('details')) {
                            let ret = '';
                            const data = __this.dataObject.gridData.result[row[0][0]].heirarchyData;
                            const rowData = __this.dataObject.gridData.result[row[0][0]];
                            data.forEach(function (d) {
                                console.log('d >>>')
                                console.log(d);
                                ret += '<tr class="heirarchy" role="row">';
                                ret += '<td class=" dt-body-center"><img style="width: 15px; position: relative; top: -2px" src="./../../../../assets/images/details_arrow.png">' + (rowData.alertEnabled && rowData.heirarchyData && rowData.heirarchyData.length ? '<div><b>ALERT</b></div>' : '') + '</td>';
                                for (const prop in rowData) {
                                    let applyHeirarChyData;
                                    if (prop === 'name') {
                                        applyHeirarChyData = d['name'];
                                    } else if (prop === 'frequency') {
                                        applyHeirarChyData = d['frequency'];
                                    } else if (prop === 'period') {
                                        applyHeirarChyData = __this.datePipe.transform(d['report_run_start_time'], 'MMM-dd-yyyy') + ' - ' + __this.datePipe.transform(d['report_run_end_time'], 'MMM-dd-yyyy');
                                    } else if (prop === 'created_by') {
                                        applyHeirarChyData = d['created_by'];
                                    } else if (prop === 'lastruntime') {
                                        applyHeirarChyData = __this.datePipe.transform(d['report_run_end_time'], 'yyyy-dd-M h:mm:ss a');
                                    } else if (prop === 'status') {
                                        applyHeirarChyData = d['report_run_status'];
                                    }
                                    const field = __this.dataObject.gridData.headers.find(x => x.data === prop);
                                    if (field || applyHeirarChyData) {
                                        ret += '<td class="sorting_disabled" style="width: 30px;" aria-label="">' + (applyHeirarChyData ? applyHeirarChyData : rowData[prop]) + '</td>';
                                    }
                                }

                                ret += '<td class="sorting_disabled" style="width: 30px;"><a class="fa fa-pencil fa-action-view" style="margin-right: 15px; visibility: hidden; cursor: pointer"></a><a class="fa fa-play fa-action-view" style="margin-right: 15px; visibility: hidden; cursor: pointer"></a><a class="fa fa-download fa-action-view" href="' + d.report_run_file_location + '" style="margin-right: 15px; cursor: pointer"></a></td>';

                                ret += '</tr>';
                            });
                            tr.after(ret);
                            tr.addClass('details');
                        } else {
                            tr.nextUntil('tr:not(".heirarchy")').show();
                        }
                    } else {
                        if (row.child.isShown()) {
                            // This row is already open - close it
                            row.child.hide();
                            tr.removeClass('shown');
                        } else {
                            // Open this row
                            if (__this.identity === 'vendor') {
                                __this.getSearchData(rowData.external_vendor_id, rowData.org_id).subscribe(
                                    response => {
                                        let retHtml = '';
                                        if (response && response.body && response.body.length) {
                                            response.body.forEach(function (ele) {
                                                retHtml += '<div style="margin-left: 10px; margin-bottom: 10px"><label>Payment Method:</label><span style="margin-left: 10px">' + ele.payment_method + '</span><br><label>Last 4 digits:</label><span style="margin-left: 10px">' + ele.last_four_digits + '</span><br><label>Payment Status:</label><span style="margin-left: 10px">' + ele.status + '</span><br><label>Default:</label><span style="margin-left: 10px">' + (ele.is_default == 1 ? 'Yes' : 'No') + '</span></div>';
                                            });
                                        } else {
                                            retHtml += ' No details found';
                                        }

                                        row.child(retHtml).show();
                                        tr.addClass('shown');
                                    },
                                    err => {
                                    }
                                );
                            } else if (__this.identity === 'usermanagement') {
                                const retHtml = '<div><button class="btn action-btn" style="width: auto; background: #fefefe; color: #3b3b3b; border-color: #c3c3c3; font-weight: 600;"><span style="margin-right: 5px; position: relative;"><i class="fa fa-user" style="font-size: 20px" aria-hidden="true"></i><i class="fa fa-check" style="color: #3FA8F4; font-size: 8px; position: absolute; top: 4px; left: 5px" aria-hidden="true"></i></span>Set Password & Activate</button><button class="btn action-btn" style="width: auto; background: #fefefe; color: #3b3b3b; border-color: #c3c3c3; font-weight: 600;"><span style="margin-right: 5px; position: relative;"><i class="fa fa-user" style="font-size: 20px" aria-hidden="true"></i><i class="fa fa-arrow-right" style="color: #5cb85c; font-size: 8px; position: absolute; top: 4px; left: 5px" aria-hidden="true"></i></span>Resend Activatation Email</button><div class="dropdown"><button class="btn action-btn dropdown-toggle" style="width: auto; background: #fefefe; color: #3b3b3b; border-color: #c3c3c3; line-height: 1.7; font-weight: 600;" type="button" id="menu1" data-toggle="dropdown">More Actions<span class="caret" style="margin-left: 5px"></span></button><ul class="dropdown-menu" role="menu" aria-labelledby="menu1"><li role="presentation" style="margin: 5px 0px"><i class="fa fa-recycle" style="font-size: 20px; margin-left: 10px" aria-hidden="true"></i><a role="menuitem" tabindex="-1" style="line-height: 1.5; cursor: pointer; font-weight: 600; font-size: 12px; padding-left: 5px; display: inline-block; position: relative; top: -2px" href="#">RESET MULTIFACTOR</a></li><li role="presentation" style="margin: 5px 0px"><span style="position: relative; margin-left: 13px"><i class="fa fa-user" style="font-size: 20px;" aria-hidden="true"></i><i class="fa fa-pause" style="color: #3FA8F4; font-size: 8px; position: absolute; top: 8px; left: 6px" aria-hidden="true"></i></span><a role="menuitem" tabindex="-1" style="line-height: 1.5; cursor: pointer; font-weight: 600; font-size: 12px; padding-left: 6px; display: inline-block; position: relative; top: -2px" href="#">SUSPEND</a></li><li role="presentation" style="margin: 5px 0px"><span style="position: relative; margin-left: 13px"><i class="fa fa-user" style="font-size: 20px;" aria-hidden="true"></i><i class="fa fa-times" style="color: #3FA8F4; font-size: 8px; position: absolute; top: 8px; left: 6px" aria-hidden="true"></i></span><a role="menuitem" tabindex="-1" style="line-height: 1.5; cursor: pointer; font-weight: 600; font-size: 12px; padding-left: 6px; display: inline-block; position: relative; top: -2px" href="#">DEACTIVATE</a></li></ul></div></div>';
                                row.child(retHtml).show();
                                tr.addClass('shown');
                            } else if (__this.identity === 'orders') {
                                let retHtml = '';
                                const orderSteps = [];
                                orderSteps.push({
                                    title: 'Order Started',
                                    subTitle: '10/01/2019',
                                    state : 'done',
                                    description: 'Order details during started'
                                });
                                orderSteps.push({
                                    title: 'Payment Received',
                                    subTitle: '10/01/2019',
                                    state : 'done',
                                    description: 'Order details during payment received'
                                });
                                orderSteps.push({
                                    title: 'Payment Processing',
                                    subTitle: 'Pending',
                                    state : 'current',
                                    description: 'Payment Processing Pending'
                                });
                                orderSteps.push({
                                    title: 'Order Ended',
                                    subTitle: '---',
                                    state : 'invalid'
                                });
                                retHtml += '<div><h4>Order Details</h4></div>';
                                const id = Math.floor(Math.random() * (10000 - 1 + 1)) + 1;
                                retHtml += __this.smartSteps(id, orderSteps);
                                retHtml += '<div class="col-lg-6 col-md-6 col-sm-12" style="width: 450px; border-radius: 4px; overflow-y: scroll;"><h4>Order History</h4><ul></ul><li>10/03/2019 - Order Modified</li><li>10/01/2019 - Payment Received - AMEX xxxx0747 </li><li>10/01/2019 - Order Created</li></div>';
                                retHtml += '<p style="clear: both">';
                                retHtml += '<div class="col-lg-6 col-md-6 col-sm-12" style="margin-top: -20px; margin-bottom: 20px"><button class="btn action-btn" style="width: auto; background: #fefefe; color: #3b3b3b; border-color: #c3c3c3; font-weight: 600;"><span style="margin-right: 5px; position: relative;"><i class="fa fa-user" style="font-size: 20px" aria-hidden="true"></i><i class="fa fa-check" style="color: #3FA8F4; font-size: 8px; position: absolute; top: 4px; left: 5px" aria-hidden="true"></i></span>Modify Order</button><button class="btn action-btn" style="width: auto; background: #fefefe; color: #3b3b3b; border-color: #c3c3c3; font-weight: 600;"><span style="margin-right: 5px; position: relative;"><i class="fa fa-user" style="font-size: 20px" aria-hidden="true"></i><i class="fa fa-check" style="color: #3FA8F4; font-size: 8px; position: absolute; top: 4px; left: 5px" aria-hidden="true"></i></span>Cancel Order</button></div>';
                                retHtml += '<p style="clear: both">';
                                // retHtml += '<div class="col-lg-6 col-md-6 col-sm-12" id="' + accordian + '" style="width: 700px; height: 50px; background: lavender; margin-left: 15px"><h5 style="margin-top: 17px">Line Item 1</h5><div><p>Some Details</p></div><h5 style="margin-top: 17px">Line Item 2</h5><div><p>Some Details</p></div><h5 style="margin-top: 17px">Line Item 3</h5><div><p>Some Details</p></div></div>';
                                const items = [];
                                items.push({
                                    header: 'Line Item 1',
                                    content: 'Line Item 1 details goes here',
                                    steps : [{
                                        title: 'Campaign Start',
                                        subTitle: '10/01/2019',
                                        state : 'done',
                                        description: 'Information on Line Item 1 start'
                                    },{
                                        title: 'Campaign End',
                                        subTitle: '10/31/2019',
                                        state : 'done'
                                    }]
                                });
                                items.push({
                                    header: 'Line Item 2',
                                    content: 'Line Item 2 details goes here',
                                    steps : [{
                                        title: 'Campaign Start',
                                        subTitle: '11/01/2019',
                                        state : 'done',
                                        description: 'Information on Line Item 2 start'
                                    },{
                                        title: 'Campaign End',
                                        subTitle: '11/30/2019',
                                        state : 'invalid'
                                    }]
                                });
                                items.push({
                                    header: 'Line Item 3',
                                    content: 'Line Item 3 details goes here',
                                    steps : [{
                                        title: 'Campaign Start',
                                        subTitle: '12/01/2019',
                                        state : 'invalid'
                                    },{
                                        title: 'Campaign End',
                                        subTitle: '12/31/2019',
                                        state : 'invalid'
                                    }]
                                });
                                retHtml += __this.lineItemDetails(items);

                                row.child(retHtml).show();
                                tr.addClass('shown');

                                // Register Accordian click event
                                $('.accordion .accordion-header').on('click', function() {
                                    $(this).toggleClass('active').next().slideToggle();
                                });
                            }
                            // row.child(__this.format(rowData)).show();
                            // tr.addClass('shown');
                        }
                    }
                } else {
                    $(this).attr('src', './../../../../assets/images/expand.png');
                    $(this).addClass('collapsed');
                    if (__this.dataObject.gridData.options.inheritHeadersForTree) {
                        tr.nextUntil('tr:not(".heirarchy")').hide();
                    } else {
                        if (row.child.isShown()) {
                            // This row is already open - close it
                            row.child.hide();
                            tr.removeClass('shown');
                        } else {
                            // Open this row
                            if (__this.identity === 'vendor') {
                                __this.getSearchData(rowData.external_vendor_id, rowData.org_id).subscribe(
                                    response => {
                                        let retHtml = '';
                                        if (response && response.body && response.body.length) {
                                            response.body.forEach(function (ele) {
                                                retHtml += '<div style="margin-left: 10px; margin-bottom: 10px"><label>Payment Method:</label><span style="margin-left: 10px">' + ele.payment_method + '</span><br><label>Last 4 digits:</label><span style="margin-left: 10px">' + ele.last_four_digits + '</span><br><label>Payment Status:</label><span style="margin-left: 10px">' + ele.status + '</span><br><label>Default:</label><span style="margin-left: 10px">' + (ele.is_default == 1 ? 'Yes' : 'No') + '</span></div>';
                                            });
                                        } else {
                                            retHtml += ' No details found';
                                        }
                                        row.child(retHtml).show();
                                        tr.addClass('shown');
                                    },
                                    err => {
                                    }
                                );
                            } else if (__this.identity === 'usermanagement') {
                                const retHtml = '<div><button class="btn action-btn" style="width: auto">Set Password & Activate</button><button class="btn action-btn" style="width: auto">Resend Activation Email</button></div>';
                                row.child(retHtml).show();
                                tr.addClass('shown');
                            } else if (__this.identity === 'orders') {
                                let retHtml = '';
                                const orderSteps = [];
                                orderSteps.push({
                                    title: 'Created',
                                    subTitle: 'Date Order Created'
                                });
                                orderSteps.push({
                                    title: 'Payment Submitted',
                                    subTitle: 'Date Payment Submitted'
                                });
                                orderSteps.push({
                                    title: 'Payment Received',
                                    subTitle: 'Date Payment Received'
                                });
                                orderSteps.push({
                                    title: 'Ended',
                                    subTitle: 'Date order ended'
                                });
                                retHtml += '<div>Order #123</div>';
                                const id = Math.floor(Math.random() * (10000 - 1 + 1)) + 1;
                                retHtml += __this.smartSteps(id, orderSteps);
                                retHtml += '<div class="col-lg-6 col-md-6 col-sm-12" style="border: 1px solid; width: 450px"> Test </div>';
                                row.child(retHtml).show();
                                tr.addClass('shown');

                                $('#' + id).smartWizard({
                                    theme: 'dots',
                                    enableFinishButton: false
                                });
                            }

                            // row.child(__this.format(rowData)).show();
                            // tr.addClass('shown');
                        }
                    }
                }
            });


            // Initialize bootstrap datepicker for inline date fields
            $('.datepicker').datepicker({
                format: 'yyyy-mm-dd',
                clearBtn: true,
                todayBtn: true,
                autoclose: true
            });

            // Register change event on inline edit fields
            $('.inlineEditor').on('change', function () {
                console.log('$(this).closest(\'.form-group\')')
                const rowIndex = $(this).closest('.form-group').attr('rowIndex');
                let columnIndex = $(this).closest('.form-group').attr('columnIndex');
                console.log($(this).closest('.form-group').attr('rowIndex'));
                console.log($(this).closest('.form-group').attr('columnIndex'));
                if (!$(this).val()) {
                    $(this).closest('.form-group').next('div.alert').show();
                } else {
                    $(this).closest('.form-group').next('div.alert').hide();
                };

                if (__this.dataObject.gridData.options.isRowSelection) {
                    columnIndex--;
                }
                __this.dataObject.gridData.result[rowIndex][__this.dataObject.gridData.headers[columnIndex].key] = $(this).val();
                console.log('__this.dataObject.gridData.result >>>')
                console.log(__this.dataObject.gridData);
            });

            $(document).on('click', '.step-nav', function() {
                const id = $(this).attr('id').replace('#','');
                $(this).closest('div.steps-main').find('div.step-container').find('.step-content').removeClass('active');
                $(this).closest('div.steps-main').find('div.step-container').find('.step-content').each(function () {
                    if($(this).attr('id') === id) {
                        $(this).addClass('active');
                    }
                });
            });
        }
    }

    smartSteps(id, steps, isLineItem = false) {
        const $mainDiv = $('<div/>', {
            'class': 'col-lg-6 col-md-6 col-sm-12',
            css : {
                'width' : isLineItem ? '600px' : '700px',
                'margin' : '20px 0px'
            }
        });
        const $div = $('<div/>', {
            id: id,
            class: 'steps-main'
        });
        const $ul = $('<ul/>', {
            class : 'step-anchor nav nav-tabs'
        });
        const $divDetails = $('<div/>', {
            class : 'step-container tab-content',
            css : {
                'min-height' : '37px'
            }
        });
        for (let i=0; i < steps.length; i++) {
            $ul.append('<li class="' + (steps[i].state === 'invalid' ? (steps[i].state + ' nav-item disabled') : (steps[i].state + ' nav-item')) + '"><a href="javascript:void(0)" style="padding-right: ' + (i === 0 && isLineItem ? '334px' : '0px')  +  '" class="step-nav nav-item nav-link" id="#step-' + i + '">' + steps[i].title + '<br/><small>'  + steps[i].subTitle + '</small></a></li>');
            if(i === 0 && isLineItem && this.displayTag(steps, true)) {
                const daysLeft = this.getDaysBetweenDates(new Date(steps[1].subTitle), new Date()) + 1;
                const totaldays = (this.getDaysBetweenDates(new Date(steps[1].subTitle), new Date(steps[0].subTitle))) + 1;
                const markerPointLeft = -378 + ((429 / (totaldays)) * (totaldays - (daysLeft + 1)));
                // px point between 2 line items = 429 ( -378 - 0 - 51 ). Ex: with 30 days, each px is 14.33 , so the logic has to start from -378 + (429/no_of_days);
                $ul.append('<li><span style="position: absolute; top: 64px; left: '  + (markerPointLeft - 32)  + 'px; border: 1px solid #5bc0de; padding: 4px; background: #5bc0de; color: white; border-radius: 4px; ">' + (daysLeft) + ' days left</span></li>');
                $ul.append('<li><span style="position: absolute; top: 50px; z-index: 100; left: ' + markerPointLeft + 'px; color: #5bc0de">|</span></li>');
            }
            $divDetails.append('<div class="'  + (steps[i].state === 'current' ? 'tab-pane step-content active' : 'tab-pane step-content') +  '" style="margin-top: 20px" id="step-' + i + '">' + (steps[i].description || 'No Description Available') + '</div>');
        }
        if(this.displayTag(steps, true)) {
            $divDetails.append('<div class="col-lg-6 col-md-6 col-sm-12" style="margin-top: 20px"><button class="btn action-btn" style="width: auto; background: #fefefe; color: #3b3b3b; border-color: #c3c3c3; font-weight: 600;"><span style="margin-right: 5px; position: relative;"><i class="fa fa-user" style="font-size: 20px" aria-hidden="true"></i><i class="fa fa-check" style="color: #3FA8F4; font-size: 8px; position: absolute; top: 4px; left: 5px" aria-hidden="true"></i></span>Modify Line Item</button><button class="btn action-btn" style="width: auto; background: #fefefe; color: #3b3b3b; border-color: #c3c3c3; font-weight: 600;"><span style="margin-right: 5px; position: relative;"><i class="fa fa-user" style="font-size: 20px" aria-hidden="true"></i><i class="fa fa-check" style="color: #3FA8F4; font-size: 8px; position: absolute; top: 4px; left: 5px" aria-hidden="true"></i></span>Cancel Line Item</button></div>');
        }
        $div.append($ul);
        $div.append($divDetails);
        $mainDiv.append($div);

        // setTimeout(function () {
        //     $('#' + id).smartWizard({
        //         theme: 'dots',
        //         keyNavigation: false,
        //         enableFinishButton: false,
        //         showStepURLhash: false,
        //         enableAll: true,
        //         anchorSettings: {
        //             anchorClickable: true, // Enable/Disable anchor navigation
        //             enableAllAnchors: false, // Activates all anchors clickable all times
        //             //  markDoneStep: false, // add done css
        //             //  enableAnchorOnDoneStep: false // Enable/Disable the done steps navigation
        //         }
        //     });
        //
        //     $('#' + id).smartWizard("stepState", [1], "enable");
        //
        // }, 100);

        return $mainDiv[0].outerHTML;
    }

    displayTag(steps, isLineItem) {
        let ret = false;
        if (isLineItem) {
            const d = new Date();
            if (d.getTime() <= new Date(steps[1].subTitle).getTime() && d.getTime() >= new Date(steps[0].subTitle).getTime()) {
                ret = true;
            }
        }
        return ret;
    }

    getDaysBetweenDates(second, first) {
        return Math.round((second - first) / (1000 * 60 * 60 * 24));
    }

    lineItemDetails(items) {
        const $mainDiv = $('<div/>', {
            'class': 'accordion'
        });
        for (let i=0; i < items.length; i++) {
            const id = Math.floor(Math.random() * (10000 - 1 + 1)) + 1;
            $mainDiv.append('<div class="accordion-header">' + items[i].header + '</div>');
            $mainDiv.append('<div class="accordion-content"><p>' + items[i].content + '</p>' + this.smartSteps(id, items[i].steps, true) + '<p style="clear: both"</div>');
        }
        return $mainDiv[0].outerHTML;
    }

    format(row) {

        console.log('row >>>')
        console.log(row);

        let retHtml = '';

        // retHtml += '<div style="margin-left: 10px; margin-bottom: 10px"><label>Payment Method</label><span>ACH</span><br><label>Last 4 digits</label><span>7827</span><br><label>Payment Status</label><span>Completed</span><label>Default</label><span>true</span></div>';

        this.getSearchData(row.external_vendor_id, row.org_id).subscribe(
            response => {
                if (response && response.body) {
                    response.body.forEach(function (ele) {
                        retHtml += '<div style="margin-left: 10px; margin-bottom: 10px"><label>Payment Method</label><span>' + ele.payment_method  + '</span><br><label>Last 4 digits</label><span>' + ele.last_four_digits +  '</span><br><label>Payment Status</label><span>' + ele.status + '</span><label>Default</label><span>' + (ele.is_default == 1 ? 'Yes' : 'No') + '</span></div>';
                    });

                    console.log('retHtml >>')
                    console.log(retHtml);

                    return retHtml;
                }
            },
            err => {
            }
        );

        //  retHtml = '<div>Fetching Details ... </div>';
        return retHtml;
    }

    getSearchData(vendorID, orgID ) {

        const AccessToken: any = this.widget.tokenManager.get('accessToken');
        let token = '';
        if (AccessToken) {
            token = AccessToken.accessToken;
        }

        const dataObj = JSON.stringify({
            vendor_id : vendorID.toString(),
            org_id: orgID.toString()
        });

        const headers = new Headers({'Content-Type': 'application/json' , 'callingapp' : 'pine', 'token' : token});
        const options = new RequestOptions({headers: headers});
        const url = this.api_fs.api + '/api/payments/vendor-payment-methods';

        return this.http
            .post(url, dataObj, options)
            .map(res => {
                return res.json();
            }).share();
    }

    registerCheckboxSelection(table, __this) {

        console.log('checkbox checked .....');

        // Handle table row select event
        table.on('select', function (e, dt, type, indexes) {
            if (__this.dataObject.gridData.options.isRowSelection && !__this.dataObject.gridData.options.isRowSelection.isMultiple) {
                $('input.check-row-selection').prop('checked', false);
                $('#example tbody tr').removeClass('selected');
            }
            // if (table[type]) {
            // TODO : need to expose another property to do this
            table[type](indexes).nodes().to$().find('td input.check-row-selection').prop('checked', true);
            table[type](indexes).nodes().to$().addClass('selected');
            // if (__this.dataObject.gridData.options.isRowHighlight) {
            //    table[type](indexes).nodes().to$().find('td input.check-row-selection').prop('checked', true);
            //    table[type](indexes).nodes().to$().addClass('selected');
            // } else {
            //     table[type](indexes).nodes().to$().removeClass('selected');
            // }

            console.log('indexes >>')
            console.log(indexes)

            if (__this.sendResponseOnCheckboxClick) {
                __this.triggerActions.emit({
                    action: 'handleCheckboxSelection',
                    data: __this.dataObject.gridData.result[indexes[0]],
                    rowIndex: indexes[0]
                });
            }
            //}
        });
    }

    registerUnCheckboxSelection(table, __this) {
        // Handle table row deselect event
        table.on('deselect', function (e, dt, type, indexes) {
            table[type](indexes).nodes().to$().find('td input.check-row-selection').prop('checked', false);
            if (__this.sendResponseOnCheckboxClick) {
                __this.triggerActions.emit({
                    action: 'handleUnCheckboxSelection',
                    data: __this.dataObject.gridData.result[indexes[0]],
                    rowIndex: indexes[0]
                });
            }
        });
    }
}
