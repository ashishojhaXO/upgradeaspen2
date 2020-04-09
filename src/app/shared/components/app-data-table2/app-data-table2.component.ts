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
// import { OktaAuthService } from '../../../../services/okta.service';
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
    // widget: any;
    api_fs: any;
    tableId = 'example';
    @Input() dataFieldsConfiguration: any;
    table: any;
    @Input() dataRowUpdated: boolean;
    @Input() dataRowUpdatedLen: number;
    @Input() identity: any;
    @Input() height: any;
    @Input() existingIdentity: boolean;
    fixedColumnFlag: boolean;

    constructor(
        public toastr: ToastsManager,
        private formBuilder: FormBuilder,
        private domService: DomService,
        private dataTableService: DataTableService,
        private http: Http,
        private datePipe: DatePipe,
        // private okta: OktaAuthService
    ) {
    }

    ngOnInit(): void {
        // this.widget = this.okta.getWidget();
        this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
        // console.log('this.externalTableId >>>@@@')
        // console.log(this.externalTableId);
        // if(this.externalTableId) {
        //     this.tableId = this.externalTableId;
        // }
        // this.initializeTable();
    }

    ngOnChanges(changes: SimpleChanges) {

        if (changes['dataObject'] || changes['dataRowUpdated']  ) {

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

        if ( changes['dataRowUpdatedLen']) {

            if(this.dataObject.gridId) {
                this.tableId = this.dataObject.gridId;
            }

            if ( $.fn.DataTable.isDataTable('#' + this.tableId) ) {
                $('#' + this.tableId).DataTable().clear().destroy();
                $('#' + this.tableId).empty();
            }

            const __this = this;
            // setTimeout(function () {
            __this.initializeTable();
            // }, 0);
            // this.initializeTable();
        }

    }

    attachEvents(row) {
        const __this = this;
        $(".api-action")
            .on('click', function($event){
                const elem = this;
                // __this.triggerActions.emit($event);
                __this.triggerActions.emit({
                        action: 'handleActions',
                        elem: elem,
                        data: row
                    }
                );
            });
    }

    attachInvoiceEvent(row, invoiceHeaderId) {
        const __this = this;
        const invoice_header_Id = invoiceHeaderId;
        $(document).off('click', '.invoicePay');
        $(document).on('click', '.invoicePay', function () {

            let totalAmount = 0;
            $(this).closest('div.form-group-fields').find('div.invoiceBody').find('input.invoicePayAmount').each(function (ele) {
                totalAmount += $(this).val() ? (parseFloat($(this).val()) ? parseFloat($(this).val()) : 0) : 0;
            });

            const lineItems = [];
            $(this).closest('div.form-group-fields').find('div.invoiceBody').find('div.row').each(function () {
                lineItems.push({
                    id : parseInt($(this).find('span.invoice-lineItem').text(), 10) ? parseInt($(this).find('span.invoice-lineItem').text(), 10) : null,
                    amount: parseFloat($(this).find('input.invoicePayAmount').val()) ? parseFloat($(this).find('input.invoicePayAmount').val())  : 0,
                    client_id: $(this).find('span.invoice-clientId').text() === "null" ? null : $(this).find('span.invoice-clientId').text()
                });
            });


            const rowIndex = row[0][0];
            const rowData = __this.dataObject.gridData.result[rowIndex];

            const dataObj = {
                invoice: {
                    number: rowData.invoice_number,
                    header_id: invoice_header_Id,
                    amount : totalAmount
                },
                line_items: lineItems
            };

            __this.triggerActions.emit({
                action: 'handleInvoicePay',
                data: dataObj
            });
        });

        $(document).off('keup', '.invoicePayAmount');
        $(document).on('keyup', '.invoicePayAmount', function () {
            console.log('this !!!')
            console.log($(this).closest('div.invoiceBody'));

            let totalAmount = 0;
            $(this).closest('div.invoiceBody').find('input.invoicePayAmount').each(function (ele) {
                totalAmount += $(this).val() ? (parseFloat($(this).val()) ? parseFloat($(this).val()) : 0.00) : 0.00;
            });

            $(this).closest('div.form-group-fields').find('div.invoiceFooter').find('span.totalInvoice').text(totalAmount.toLocaleString());
        });

        $(document).off('change', '.header-applyAmount');
        $(document).on('change', '.header-applyAmount', function (e) {
            if ($(this).is(':checked')) {
                $(this).closest('div.form-group-fields').find('div.invoiceBody').find('input.applyAmount').prop('checked', true);
            } else {
                $(this).closest('div.form-group-fields').find('div.invoiceBody').find('input.applyAmount').prop('checked', false);
            }

            $(this).closest('div.form-group-fields').find('div.invoiceBody').find('input.applyAmount').each(function () {
                if ($(this).is(':checked')) {
                    let billed_amount_text = $(this).closest('div.row').find('.invoiceBilledAmount').text();
                    billed_amount_text = billed_amount_text.replace(/,/g, '').replace('$', '');
                    const billed_amount = billed_amount_text ? (parseFloat(billed_amount_text) ? parseFloat(billed_amount_text) : 0.00) : 0.00;
                    $(this).closest('div.row').find('.invoicePayAmount').val(billed_amount);
                } else {
                    $(this).closest('div.invoiceBody').find('.invoicePayAmount').val(0.00);
                }
            });

            //update total
            let totalAmount = 0.00;
            $(this).closest('div.form-group-fields').find('div.invoiceBody').find('input.invoicePayAmount').each(function () {
                totalAmount += parseFloat($(this).val());
            });

            $(this).closest('div.form-group-fields').find('div.invoiceFooter').find('span.totalInvoice').text(totalAmount.toLocaleString());
        });

        $(document).off('change', '.applyAmount');
        $(document).on('change', '.applyAmount', function (e) {
            if ($(this).is(':checked')) {
                let billed_amount_text = $(this).closest('div.row').find('.invoiceBilledAmount').text();
                billed_amount_text = billed_amount_text.replace(/,/g, '').replace('$', '');
                const billed_amount = billed_amount_text ? (parseFloat(billed_amount_text) ? parseFloat(billed_amount_text) : 0.00) : 0.00;
                $(this).closest('div.row').find('.invoicePayAmount').val(billed_amount);
            } else {
                $(this).closest('div.row').find('.invoicePayAmount').val(0.00);
            }

            //update total
            let totalAmount = 0.00;
            $(this).closest('div.form-group-fields').find('div.invoiceBody').find('input.invoicePayAmount').each(function () {
                totalAmount += parseFloat($(this).val());
            });

            $(this).closest('div.form-group-fields').find('div.invoiceFooter').find('span.totalInvoice').text(totalAmount.toLocaleString());

        });
    }

    initializeTable() {
        const __this = this;

        if (this.dataObject) {

            // columns defines the header columns
            const columns = this.dataObject.gridData.headers.map(function (x) {
                return {id: x.key, title: x.title};
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

                    // ACTION col
                    if(
                        this.dataObject.gridData.options.isActionColPosition ||
                        this.dataObject.gridData.options.isEditOption ||
                        this.dataObject.gridData.options.isPlayOption ||
                        this.dataObject.gridData.options.isDownloadOption ||
                        this.dataObject.gridData.options.isDeleteOption ||
                        this.dataObject.gridData.options.isCustomOption
                    ) {
                        rowData.splice(
                            this.dataObject.gridData.options.isActionColPosition || 0,
                            0, 'ACTIONS'
                        );
                    }

                    dataSet.push(rowData);
                }, this);
            }

            const columnDefs = []; // columnDef define the table body row schema
            const gridButtons = [];
            let fixedColumn:any = false;

            let domConfig = '';
            if (this.dataObject.gridData.options) {

                let columnButtonDefs = '';
                if (this.dataObject.gridData.options.isEditOption && this.dataObject.gridData.options.isEditOption.value) {
                    columnButtonDefs += '<a class="fa fa-pencil fa-action-view editLink" title="' + (this.dataObject.gridData.options.isEditOption.tooltip ? this.dataObject.gridData.options.isEditOption.tooltip : 'Edit' ) + '" style="margin-right: 15px; cursor: pointer">';
                    // columnButtonDefs += '<span class="ng-tooltip ng-tooltip-right" style="transition: opacity 500ms ease 0s; left: 55px;">' + (this.dataObject.gridData.options.isEditOption.tooltip ? this.dataObject.gridData.options.isEditOption.tooltip : 'Edit' )  + '</span>';
                }
                if (this.dataObject.gridData.options.isPlayOption && this.dataObject.gridData.options.isPlayOption.value) {
                    const iconClass = this.dataObject.gridData.options.isPlayOption.icon ? this.dataObject.gridData.options.isPlayOption.icon : 'fa-play';
                    columnButtonDefs += '<a class="fa ' + iconClass  + ' fa-action-view playLink" title="' + (this.dataObject.gridData.options.isPlayOption.tooltip ? this.dataObject.gridData.options.isPlayOption.tooltip : 'Click' ) + '" style="margin-right: 15px; cursor: pointer">';
                    //  columnButtonDefs += '<span class="ng-tooltip ng-tooltip-right" style="transition: opacity 500ms ease 0s; left: 55px;">' + (this.dataObject.gridData.options.isPlayOption.tooltip ? this.dataObject.gridData.options.isPlayOption.tooltip : 'Click' )  + '</span>';
                }
                if (this.dataObject.gridData.options.isDownloadOption && this.dataObject.gridData.options.isDownloadOption.value) {
                    columnButtonDefs += '<a class="fa fa-download fa-action-view downloadLink" title="' + (this.dataObject.gridData.options.isDownloadOption.tooltip ? this.dataObject.gridData.options.isDownloadOption.tooltip : 'Download' ) + '" style="margin-right: 15px; cursor: pointer">';
                    //  columnButtonDefs += '<span class="ng-tooltip ng-tooltip-right" style="transition: opacity 500ms ease 0s; left: 55px;">' + (this.dataObject.gridData.options.isDownloadOption.tooltip ? this.dataObject.gridData.options.isDownloadOption.tooltip : 'Download' )  + '</span>';
                }

                if (this.dataObject.gridData.options.isDeleteOption && this.dataObject.gridData.options.isDeleteOption.value) {
                    columnButtonDefs += '<a class="fa fa-trash fa-action-view deleteLink" title="' + (this.dataObject.gridData.options.isDeleteOption.tooltip ? this.dataObject.gridData.options.isDeleteOption.tooltip : 'Delete' ) + '" style="cursor: pointer"></a>';
                    //  columnButtonDefs += '<span class="ng-tooltip ng-tooltip-right" style="transition: opacity 500ms ease 0s; left: 55px;">' + (this.dataObject.gridData.options.isDeleteOption.tooltip ? this.dataObject.gridData.options.isDeleteOption.tooltip : 'Delete' )  + '</span>';
                }
                if (this.dataObject.gridData.options.isCustomOption && this.dataObject.gridData.options.isCustomOption.value) {
                    const iconClass = this.dataObject.gridData.options.isCustomOption.icon ? this.dataObject.gridData.options.isCustomOption.icon : 'fa-play';
                    columnButtonDefs += '<a class="fa ' + iconClass  + ' fa-action-view customLink" title="' + (this.dataObject.gridData.options.isCustomOption.tooltip ? this.dataObject.gridData.options.isCustomOption.tooltip : 'Click' ) + '" style="margin-right: 15px; cursor: pointer">';
                }

                if (this.dataObject.gridData.options.isEmailOption) {
                    columnButtonDefs += '<a class="fa fa-envelope fa-action-view emailLink" style="cursor: pointer"></a>';
                }

                // if (columnButtonDefs) {
                //     console.log("CDEFFEFEF 1", columns, columnDefs, columnButtonDefs)
                //     columns.push({
                //         title: 'ACTIONS'
                //     });
                //     columnDefs.push(
                //         {
                //         targets: -1,
                //         defaultContent: columnButtonDefs
                //     });
                // }

                if (columnButtonDefs) {
                    let actionColPosition =
                        this.dataObject.gridData.options.isActionColPosition && this.dataObject.gridData.options.isActionColPosition != null ?
                            this.dataObject.gridData.options.isActionColPosition :
                            0;

                    columns.splice(
                        actionColPosition,
                        0,
                        {
                            title: 'ACTIONS',
                            data: null,
                            orderable: false,
                            render: function() {
                                return columnButtonDefs
                            }
                        }
                    );
                    // columnDefs.push(
                    //     {
                    //     targets: -1,
                    //     defaultContent: columnButtonDefs
                    // });
                }

                if (this.dataObject.gridData.options.isTree) {
                    columnDefs.push({
                        targets: this.dataObject.gridData.options.isActionColPosition === 0 ? 1 : 0,
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
                        targets: this.dataObject.gridData.options.isTree && this.dataObject.gridData.options.isActionColPosition !== 0 ? 1 : 0,
                        searchable: false,
                        orderable: false,
                        width: '30px',
                        className: 'dt-body-center',
                        render: function (data, type, row, meta) {
                            return '<input class="check-row-selection" type="checkbox" name="id[]" value="' + $('<div/>').text(data).html() + '">';
                        }
                    });
                }


                if (this.dataObject.gridData.options.isHideColumns) {
                    let targ: Array<Number>;
                    targ = columns.map(
                        (v, k) => {
                            if( v.id
                                &&
                                this.dataObject.gridData.options.isHideColumns.indexOf(v.id) != -1
                            ) {
                                return k;
                            }
                        }
                    ).filter( (v, k) => v != undefined);

                    columnDefs.push({
                        targets: targ,
                        visible: false,
                    })
                }

                

                if (this.dataObject.gridData.options.isDownloadAsCsv) {
                    let dict = {
                        extend: 'csv',
                        text: '<span><i class="fa fa-download fa-Idown" aria-hidden="true"></i></span>',
                        exportOptions: {
                            columns: ":visible"
                        }
                    }
                    if(__this.dataObject.gridData.options.isDownloadAsCsvFunc) {
                        dict['action'] = function ( e, dt, node, config ) {
                            // __this.dataObject.gridData.options.isApiCallForNextPage.apiMethod.apply(__this, [table, table.page.len(), "csv" ] );
                            __this.dataObject.gridData.options.isDownloadAsCsvFunc(table, table.page.len(), "csv");
                        }
                    }
                    gridButtons.push(dict);
                }

                if (this.dataObject.gridData.options.isColVisibility) {
                    gridButtons.push({
                        extend: 'colvis',
                        text: '<span><i class="fa fa-cog fa-Ivisible" aria-hidden="true"></i></span>',
                    });
                }

                if (this.dataObject.gridData.options.fixedColumn){
                    this.fixedColumnFlag = true;
                    fixedColumn = {
                        "leftColumns": this.dataObject.gridData.options.fixedColumn
                    }
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

                // columnDefs
                if (this.dataObject.gridData.options.isColumnDefs) {
                    console.log("col Defs: ", columnDefs);
                    columnDefs.push( ...this.dataObject.gridData.options.isColumnDefs )
                    console.log("AFTER col Defs: ", columnDefs);
                }

                console.log("---- columns: ", columns);

            }

            if (!domConfig) {
                domConfig = 'fBtilp';
            }

            let pageLength: Number = 25;
            if( localStorage.getItem('gridPageCount') ){
                pageLength = +localStorage.getItem('gridPageCount');
            } else if(this.dataObject.gridData.options.isPageLengthNo ) {
                pageLength = this.dataObject.gridData.options.isPageLengthNo;
            }

            // TODO: HERE
            const dataTableOptions = {
                scrollY: this.height ? this.height : 320,
                scrollX: true,
                retrieve: true,
                columns: columns,
                data: dataSet,
                dom: domConfig, // l - length changing input control ,f - filtering input ,t - The table!,i - Table information summary,p - pagination control
                buttons: gridButtons,
                columnDefs: columnDefs,
                fixedColumns: fixedColumn,
                select: {
                    style: this.dataObject.gridData.options.isRowSelection && this.dataObject.gridData.options.isRowSelection.isMultiple ? 'multi' : 'os',
                },

                order: this.dataObject.gridData.options.isOrder ?
                    this.dataObject.gridData.options.isOrder :
                    [[1, 'asc']],

                initComplete: function(settings) {
                    $('#' + __this.tableId + ' tbody td').each(function () {
                        $(this).attr('title', $(this).text());
                    });
                },
                pageLength: pageLength,
                // sort: true,
                displayStart: this.dataObject.gridData.options.isDisplayStart || 0,

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

                    if (__this.dataObject.gridData.rowsToColor) {
                        __this.dataObject.gridData.rowsToColor.forEach(function (rowAttr) {
                            if (index === rowAttr.index) {
                                $(row).css('background-color', rowAttr['background-color']);
                                $(row).css('color', rowAttr['color']);
                            }
                        });
                    }

                    if (__this.dataObject.gridData.options.isDownloadOption && __this.dataObject.gridData.options.isDownloadOption.dependency && __this.dataObject.gridData.options.isDownloadOption.dependency.length) {
                        let isValid = true;
                        __this.dataObject.gridData.options.isDownloadOption.dependency.forEach(function (ele) {
                            if(!__this.dataObject.gridData.result[index][ele]) {
                                isValid = false;
                            }
                        });

                        if (!isValid) {
                            $('td', row).find('a.fa-download').css('pointer-events', 'none');
                            $('td', row).find('a.fa-download').addClass('disabled');
                        }
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

                                const rowEle = __this.dataObject.gridData.result[index];
                                const extendedRow = rowEle.id && rowEle.id == rowEle.suppliedId;

                                field.value = __this.dataObject.gridData.result[index][field.name];

                                if((field.type === 'checkbox' || field.type === 'radio') && typeof field.value === 'string') {
                                    field.value = [field.value];
                                }

                                if (field.type === 'decimal' || field.type === 'varchar' || field.type === 'string') {
                                    $('td', row).eq(columnIndex).html('<div class="form-group" rowIndex="' + index + '" columnIndex="' + columnIndex + '"><input placeholder="Select ' + field.label + '" class="inlineEditor ' + ((((field.validation && field.validation.length && field.validation.indexOf('disabled') !== -1) || ( __this.existingIdentity && (!field.validation || (field.validation && field.validation.indexOf('PostOrderChange') === -1)))) && __this.dataObject.paymentReceived) && !extendedRow || (extendedRow && field.name !== 'end_date' && field.name !== 'additional_budget') ? 'disabled' : '' )  + '" type="text" style="width:' + (((field.size ? field.size : 20) * 7.5) + 10)  + 'px; padding: 6px 12px; font-size: 12px; height: 34px; color: #495057; border: 1px solid #ced4da;background-clip: padding-box; border-radius: 4px" value="' + $('td', row).eq(columnIndex).text() +  '"/></div>' + ( field.validation && field.validation.length && field.validation.indexOf('required') !== -1 ? '<div class="col-lg-12 col-md-12 form-field alert alert-danger" style="display:' + ($('td', row).eq(columnIndex).text() ? 'none' : 'inline-block') + '"><div>' + field.label  + ' is required</div></div>' : ''));
                                } else if(field.type === 'text') {
                                    $('td', row).eq(columnIndex).html('<div class="form-group" rowIndex="' + index + '" columnIndex="' + columnIndex + '"><textarea placeholder="Select ' + field.label + '" class="inlineEditor ' + ((((field.validation && field.validation.length && field.validation.indexOf('disabled') !== -1) || ( __this.existingIdentity && (!field.validation || (field.validation && field.validation.indexOf('PostOrderChange') === -1)))) && __this.dataObject.paymentReceived) && !extendedRow || (extendedRow && field.name !== 'end_date' && field.name !== 'additional_budget') ? 'disabled' : '' )  + '" style="width:' + (((field.size ? field.size : 20) * 7.5) + 10)  + 'px; padding: 6px 12px; font-size: 12px; height: 34px; color: #495057; border: 1px solid #ced4da;background-clip: padding-box; border-radius: 4px" value="' + $('td', row).eq(columnIndex).text() +  '"></textarea></div>' + ( field.validation && field.validation.length && field.validation.indexOf('required') !== -1 ? '<div class="col-lg-12 col-md-12 form-field alert alert-danger" style="display:' + ($('td', row).eq(columnIndex).text() ? 'none' : 'inline-block') + '"><div>' + field.label  + ' is required</div></div>' : ''));
                                } else if (field.type === 'int') {
                                    $('td', row).eq(columnIndex).html('<div class="form-group" rowIndex="' + index + '" columnIndex="' + columnIndex + '"><input placeholder="Select ' + field.label + '" class="inlineEditor ' + ((((field.validation && field.validation.length && field.validation.indexOf('disabled') !== -1) || ( __this.existingIdentity && (!field.validation || (field.validation && field.validation.indexOf('PostOrderChange') === -1)))) && __this.dataObject.paymentReceived) && !extendedRow || (extendedRow && field.name !== 'end_date' && field.name !== 'additional_budget') ? 'disabled' : '' )  + '" type="number" style="width:' + (((field.size ? field.size : 20) * 7.5) + 10)  + 'px; padding: 6px 12px; font-size: 12px; height: 34px; color: #495057; border: 1px solid #ced4da;background-clip: padding-box; border-radius: 4px" value="' + $('td', row).eq(columnIndex).text() +  '"/></div>' + ( field.validation && field.validation.length && field.validation.indexOf('required') !== -1 ? '<div class="col-lg-12 col-md-12 form-field alert alert-danger" style="display:' + ($('td', row).eq(columnIndex).text() ? 'none' : 'inline-block') + '"><div>' + field.label  + ' is required</div></div>' : ''));
                                } else if (field.type === 'amount') {
                                    $('td', row).eq(columnIndex).html('<div class="form-group" rowIndex="' + index + '" columnIndex="' + columnIndex + '">' + (field.includeCurrency ? '<select style="width: 38px; padding: 6px 12px; font-size: 12px; height: 33px; color: #495057; border: 1px solid #ced4da; background-clip: padding-box; border-radius: 4px;"><option value="$">$</option></select>' : '<select style="width: 38px; padding: 6px 12px; font-size: 12px; height: 33px; color: #495057; border: 1px solid #ced4da; background-clip: padding-box; border-radius: 4px;"><option value="$">$</option></select>') + '<input placeholder="Select ' + field.label + '"  class="inlineEditor ' + ((((field.validation && field.validation.length && field.validation.indexOf('disabled') !== -1) || ( __this.existingIdentity && (!field.validation || (field.validation && field.validation.indexOf('PostOrderChange') === -1)))) && __this.dataObject.paymentReceived) && !extendedRow || (extendedRow && field.name !== 'end_date' && field.name !== 'additional_budget') ? 'disabled' : '' ) + '" type="text" style="width:' + (((field.size ? field.size : 20) * 7.5) + 10)  + 'px; padding: 6px 12px; font-size: 12px; height: 34px; color: #495057; border: 1px solid #ced4da;background-clip: padding-box; border-radius: 4px" value="' + $('td', row).eq(columnIndex).text() +  '"/></div>' + ( field.validation && field.validation.length && field.validation.indexOf('required') !== -1 ? '<div class="col-lg-12 col-md-12 form-field alert alert-danger" style="display:' + ($('td', row).eq(columnIndex).text() ? 'none' : 'inline-block') + '"><div>' + field.label  + ' is required</div></div>' : ''));
                                } else if (field.type === 'date') {
                                    const html = '<div class="form-group" rowIndex="' + index + '" columnIndex="' + columnIndex + '"><div class="input-group date datepicker"><input placeholder="Select ' + field.label + '" type="text" class="form-control inlineEditor ' + ((((field.validation && field.validation.length && field.validation.indexOf('disabled') !== -1) || ( __this.existingIdentity && (!field.validation || (field.validation && field.validation.indexOf('PostOrderChange') === -1)))) && __this.dataObject.paymentReceived) && !extendedRow || (extendedRow && field.name !== 'end_date' && field.name !== 'additional_budget') ? 'disabled' : '' ) + '" style="border-radius: 4px; font-size: 12px" value="' + $('td', row).eq(columnIndex).text()  + '" /> <span class="input-group-addon"><span class="glyphicon glyphicon-th"></span></span></div></div>' + ( field.validation && field.validation.length && field.validation.indexOf('required') !== -1 ? '<div class="col-lg-12 col-md-12 form-field alert alert-danger" style="display:' + ($('td', row).eq(columnIndex).text() ? 'none' : 'inline-block') + '"><div>' + field.label  + ' is required</div></div>' : '');
                                    $('td', row).eq(columnIndex).html(html);
                                } else if (field.type === 'list') {

                                    let options = '<option value="">--Select--</option>';
                                    field.options.forEach(function (option, index1) {
                                        options += '<option value="' + option.key + '"';
                                        if(option.key === field.value) {
                                            options += ' selected ';
                                        }
                                        options += '>' + option.text + '</option>';
                                    });
                                    const html = '<div class="form-group" rowIndex="' + index + '" columnIndex="' + columnIndex + '"><select data-validation="' + ( field.validation && field.validation.length && field.validation.indexOf('required') !== -1 ? 'true' : 'false' ) + '" class="form-control inlineEditor select-control ' + ((((field.validation && field.validation.length && field.validation.indexOf('disabled') !== -1) || ( __this.existingIdentity && (!field.validation || (field.validation && field.validation.indexOf('PostOrderChange') === -1)))) && __this.dataObject.paymentReceived) && !extendedRow || (extendedRow && field.name !== 'end_date' && field.name !== 'additional_budget') ? 'disabled' : '' )  + '" style="border-radius: 4px; font-size: 12px; width:' + (((field.size ? field.size : 20) * 7.5) + 10) + 'px;">' + options + '</select></div>' + ( field.validation && field.validation.length && field.validation.indexOf('required') !== -1 ? '<div class="col-lg-12 col-md-12 form-field alert alert-danger" style="display:' + ($('td', row).eq(columnIndex).text() ? 'none' : 'inline-block') + '"><div>' + field.label  + ' is required</div></div>' : '');
                                    $('td', row).eq(columnIndex).html(html);

                                    // if (field.name === 'ad_copy') {
                                    //
                                    //     let options = '<option value="">--Select--</option>';
                                    //     field.options.forEach(function (option, index1) {
                                    //         options += '<option value="' + option.key + '"';
                                    //         if(option.key === field.value) {
                                    //             options += ' selected ';
                                    //         }
                                    //         options += '>' + option.text + '</option>';
                                    //     });
                                    //     const html = '<div class="form-group" rowIndex="' + index + '" columnIndex="' + columnIndex + '"><select data-validation="' + ( field.validation && field.validation.length && field.validation.indexOf('required') !== -1 ? 'true' : 'false' ) + '" class="form-control inlineEditor select-control ' + ((field.validation && field.validation.length && field.validation.indexOf('disabled') !== -1) || ( __this.existingIdentity && (!field.validation || (field.validation && field.validation.indexOf('PostOrderChange') === -1))) ? 'disabled' : '' )  + '" style="border-radius: 4px; font-size: 12px; width:' + (((field.size ? field.size : 20) * 7.5) + 10) + 'px;">' + options + '</select></div>' + ( field.validation && field.validation.length && field.validation.indexOf('required') !== -1 ? '<div class="col-lg-12 col-md-12 form-field alert alert-danger" style="display:' + ($('td', row).eq(columnIndex).text() ? 'none' : 'inline-block') + '"><div>' + field.label  + ' is required</div></div>' : '');
                                    //     $('td', row).eq(columnIndex).html(html);
                                    //
                                    //    // $('td', row).eq(columnIndex).html('<div><img class="display-ad" src="./../../../../assets/images/adCopy.png" style="width: 38px; cursor: pointer"/></div>');
                                    // } else {
                                    //     let options = '<option value="">--Select--</option>';
                                    //     field.options.forEach(function (option, index1) {
                                    //         options += '<option value="' + option.key + '"';
                                    //         if(option.key === field.value) {
                                    //             options += ' selected ';
                                    //         }
                                    //         options += '>' + option.text + '</option>';
                                    //     });
                                    //     const html = '<div class="form-group" rowIndex="' + index + '" columnIndex="' + columnIndex + '"><select data-validation="' + ( field.validation && field.validation.length && field.validation.indexOf('required') !== -1 ? 'true' : 'false' ) + '" class="form-control inlineEditor select-control ' + ((field.validation && field.validation.length && field.validation.indexOf('disabled') !== -1) || ( __this.existingIdentity && (!field.validation || (field.validation && field.validation.indexOf('PostOrderChange') === -1))) ? 'disabled' : '' )  + '" style="border-radius: 4px; font-size: 12px; width:' + (((field.size ? field.size : 20) * 7.5) + 10) + 'px;">' + options + '</select></div>' + ( field.validation && field.validation.length && field.validation.indexOf('required') !== -1 ? '<div class="col-lg-12 col-md-12 form-field alert alert-danger" style="display:' + ($('td', row).eq(columnIndex).text() ? 'none' : 'inline-block') + '"><div>' + field.label  + ' is required</div></div>' : '');
                                    //     $('td', row).eq(columnIndex).html(html);
                                    // }
                                } else if (field.type === 'checkbox') {
                                    let options = '';
                                    field.options.forEach(function (option, index1) {
                                        options += '<div><input class="inlineEditor-sub" data-type="checkbox" data-field="' + field.name +  '" value="' + option.key + '" type="checkbox"';

                                        console.log('field.value >>')
                                        console.log(field.value);

                                        console.log('option >')
                                        console.log(option);

                                        if(field.value.indexOf(option.key) !== -1) {
                                            options += ' checked=checked ';
                                        }
                                        options += '"/><span style="margin-left: 5px; position: relative; top: 2px">' + option.text +  '</span></div>';
                                        // if(option.key === field.value) {
                                        //     options += ' selected ';
                                        // }
                                        // options += '>' + option.text + '</option>';
                                    });
                                    const html = '<div class="form-group" rowIndex="' + index + '" columnIndex="' + columnIndex + '"><div data-validation="' + ( field.validation && field.validation.length && field.validation.indexOf('required') !== -1 ? 'true' : 'false' ) + '" class=" ' + ((((field.validation && field.validation.length && field.validation.indexOf('disabled') !== -1) || ( __this.existingIdentity && (!field.validation || (field.validation && field.validation.indexOf('PostOrderChange') === -1)))) && __this.dataObject.paymentReceived) && !extendedRow || (extendedRow && field.name !== 'end_date' && field.name !== 'additional_budget') ? 'disabled' : '' )  + '" style="border-radius: 4px; font-size: 12px; width:' + (((field.size ? field.size : 20) * 7.5) + 10) + 'px;">' + options + '</div></div>' + ( field.validation && field.validation.length && field.validation.indexOf('required') !== -1 ? '<div class="col-lg-12 col-md-12 form-field alert alert-danger" style="display:' + ($('td', row).eq(columnIndex).text() ? 'none' : 'inline-block') + '"><div>' + field.label  + ' is required</div></div>' : '');
                                    $('td', row).eq(columnIndex).html(html);
                                } else if (field.type === 'radio') {
                                    let options = '';
                                    field.options.forEach(function (option, index1) {
                                        options += '<div><input class="inlineEditor-sub" data-type="radio" value="' + option.key + '" type="radio" name="' + field.id + '" ';

                                        console.log('field.value >>')
                                        console.log(field.value);

                                        console.log('option >')
                                        console.log(option);

                                        if(field.value.indexOf(option.key) !== -1) {
                                            options += ' checked=checked ';
                                        }
                                        options += '"/><span style="margin-left: 5px; position: relative; top: 2px">' + option.text +  '</span></div>';
                                        // if(option.key === field.value) {
                                        //     options += ' selected ';
                                        // }
                                        // options += '>' + option.text + '</option>';
                                    });
                                    const html = '<div class="form-group" rowIndex="' + index + '" columnIndex="' + columnIndex + '"><div data-validation="' + ( field.validation && field.validation.length && field.validation.indexOf('required') !== -1 ? 'true' : 'false' ) + '" class=" ' + ((((field.validation && field.validation.length && field.validation.indexOf('disabled') !== -1) || ( __this.existingIdentity && (!field.validation || (field.validation && field.validation.indexOf('PostOrderChange') === -1)))) && __this.dataObject.paymentReceived) && !extendedRow || (extendedRow && field.name !== 'end_date' && field.name !== 'additional_budget') ? 'disabled' : '' )  + '" style="border-radius: 4px; font-size: 12px; width:' + (((field.size ? field.size : 20) * 7.5) + 10) + 'px;">' + options + '</div></div>' + ( field.validation && field.validation.length && field.validation.indexOf('required') !== -1 ? '<div class="col-lg-12 col-md-12 form-field alert alert-danger" style="display:' + ($('td', row).eq(columnIndex).text() ? 'none' : 'inline-block') + '"><div>' + field.label  + ' is required</div></div>' : '');
                                    $('td', row).eq(columnIndex).html(html);
                                }
                            }

                        });
                    }
                }
            };
            // console.log('height>>>>>>', this.height);
            if(!this.height){
                this.height = 320;
                // console.log('height was null', this.height);
            }
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
                } else {
                    $(this).removeClass('selected');
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
            $('#' + this.tableId + ' tbody').on('click', '.downloadLink', function (ev) {
                // const data = table.row($(this).parents('tr')).data();
                __this.triggerActions.emit({
                    action: 'handleDownload',
                    data: __this.dataObject.gridData.result[table.row($(this).parents('tr')).index()],
                    rowIndex: table.row($(this).parents('tr')).index(),
                    ev: ev
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

            // Custom Icon Click
            $('#' + this.tableId + ' tbody').on('click', '.customLink', function () {
                __this.triggerActions.emit({
                    action: 'handleCustom',
                    data: __this.dataObject.gridData.result[table.row($(this).parents('tr')).index()],
                    rowIndex: table.row($(this).parents('tr')).index()
                });
            });

            // Handle click on "Select all" control
            $('#' + this.tableId + '-select-all').on('click', function () {

                // Check/uncheck all checkboxes in the table
                const rows = table.rows({'search': 'applied'}).nodes();

                const selectedRowsIndexes = rows.map(function (r) {
                    return r._DT_RowIndex;
                });

                const selectedRows = __this.dataObject.gridData.result.filter(function (r) {
                    return selectedRowsIndexes.indexOf(__this.dataObject.gridData.result.indexOf(r)) !== -1;
                });

                console.log('table.rows() >>')
                console.log(table.rows());

                $('input.check-row-selection', rows).prop('checked', this.checked);
                this.checked ? rows.select() : table.rows().deselect();

                if (__this.dataObject.gridData.options.sendResponseOnCheckboxClick) {
                    __this.triggerActions.emit({
                        action: 'handleHeaderCheckboxSelection',
                        data: this.checked ? selectedRows : []
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
                if ($(this).is(':checked')) {
                    if (!$(this).closest('tr').hasClass('selected')) {
                        $(this).closest('tr').addClass('selected');
                    }
                } else {
                    $(this).closest('tr').removeClass('selected');
                }
            });

            // Handle table draw event ( like pagination, sorting )
            table.on('draw', function () {
                // Update state of "Select all" control
                console.log('drawn....');
                __this.adjustHeight(__this);

                table.off('draw');
            });


            // If we decide to get data of only 1 page to show in the table and not all data
            if (__this.dataObject.gridData.options.isApiCallForNextPage ) {

                // Instead of 'page.dt' page change event, call this on the onClick event on pagination numbers
                $(document).off('click', 'li.paginate_button');
                $(document).on('click', "li.paginate_button", function (ev) {
                    if (! $(ev.target).parent().is(".active") ) {
                        localStorage.setItem('gridPageCount', table.page.len() );
                        __this.dataObject.gridData.options.isApiCallForNextPage.apiMethod.apply(__this, [table, table.page.len()] );
                    }
                });

                // Using table.on for PageLength change, instead of class select input-sm
                table.off("length");
                table.on("length", function (ev) {
                    __this.dataObject.gridData.options.isPageLengthNo = table.page.len();
                    localStorage.setItem('gridPageCount', table.page.len() );

                    // Since dataTables adjusts startPage automatically on change of Length Dropdown
                    // If we need to pagss the previous pageNumber, this below maybe required
                    // if(currentPage && currentPage != table.page.info().page ){
                    //     __this.dataObject.gridData.options.isApiCallForNextPage.apiMethod.apply(__this, [table, table.page.len() ] );
                    // }
                    __this.dataObject.gridData.options.isApiCallForNextPage.apiMethod.apply(__this, [table, table.page.len() ] );

                    table.off("length");
                });

                
                let currentPage = table.page.info().page;

                // // Order
                // // On order of table
                // table.off('order.dt');
                // table.on('order.dt', function(e, settings, ordArr){

                //     // let redrawPageNumber = table.page.info().page;

                //     console.log('OORRDER....', "e: ", e, "sett: ", settings, " ordArr: ", ordArr, 
                //         "currenPage: ", currentPage,
                //         " table.page.info: ", table.page.info(),
                //         "PAGES: ", table.page.info().pages
                //     );

                //     // table.page(table.page.info().pages).draw(false);
                //     // table.off('order.dt');
                // });
                // // Order-


                $(document).off( 'keyup', 'input.input-sm');
                $(document).on( 'keyup', 'input.input-sm', function (ev) {
                    // If currentPage exists, currentPage is not the same as table's page & also input value goes empty
                    if(currentPage && currentPage != table.page.info().page && ev.currentTarget.value.trim() == "" ){
                        table.page(currentPage).draw(false);
                    }
                });

            }
                // TODO: remove after testing, as we need this a little above in the code
                // Order
                // On order of table
                let currentPage1 = table.page.info().page;
                table.off('order.dt');
                table.on('order.dt', function(e, settings, ordArr){

                    // let redrawPageNumber = table.page.info().page;

                    console.log('OORRDER....', "e: ", e, "sett: ", settings, " ordArr: ", ordArr, 
                        "currenPage1: ", currentPage1,
                        " table.page.info: ", table.page.info(),
                        "PAGES: ", table.page.info().pages
                    );

                    // table.off('order.dt');
                    // setTimeout( ( table ) => {
                    //     console.log("setTO ", table);
                    //     table.off('order.dt');
                    // }, 0, table );

                    // table.page(currentPage1).draw(false);
                });
                // Order-

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
                console.log("SETTTT")
                table.columns.adjust().draw(false);
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
                            let retStr = '';
                            const data = __this.dataObject.gridData.result[row[0][0]].heirarchyData;
                            const rowData = __this.dataObject.gridData.result[row[0][0]];
                            data.forEach(function (d) {
                                console.log('d >>>')
                                console.log(d);

                                // ret += '<tr class="heirarchy" role="row">';
                                // ret += '<td class=" dt-body-center"><img style="width: 15px; position: relative; top: -2px" src="./../../../../assets/images/details_arrow.png">' + (rowData.alertEnabled && rowData.heirarchyData && rowData.heirarchyData.length ? '<div><b>ALERT</b></div>' : '') + '</td>';
                                // for (const prop in rowData) {
                                //     let applyHeirarChyData;
                                //     if (prop === 'name') {
                                //         applyHeirarChyData = d['name'];
                                //     } else if (prop === 'frequency') {
                                //         applyHeirarChyData = d['frequency'];
                                //     } else if (prop === 'period') {
                                //         applyHeirarChyData = __this.datePipe.transform(d['report_run_start_time'], 'MMM-dd-yyyy') + ' - ' + __this.datePipe.transform(d['report_run_end_time'], 'MMM-dd-yyyy');
                                //     } else if (prop === 'created_by') {
                                //         applyHeirarChyData = d['created_by'];
                                //     } else if (prop === 'lastruntime') {
                                //         applyHeirarChyData = __this.datePipe.transform(d['report_run_end_time'], 'yyyy-dd-M h:mm:ss a');
                                //     } else if (prop === 'status') {
                                //         applyHeirarChyData = d['report_run_status'];
                                //     }
                                //     const field = __this.dataObject.gridData.headers.find(x => x.data === prop);
                                //     if (field || applyHeirarChyData) {
                                //         ret += '<td class="sorting_disabled" style="width: 30px;" aria-label="">' + (applyHeirarChyData ? applyHeirarChyData : rowData[prop]) + '</td>';
                                //     }
                                // }
                                // ret += '<td class="sorting_disabled" style="width: 30px;"><a class="fa fa-pencil fa-action-view" style="margin-right: 15px; visibility: hidden; cursor: pointer"></a><a class="fa fa-play fa-action-view" style="margin-right: 15px; visibility: hidden; cursor: pointer"></a><a class="fa fa-download fa-action-view" href="' + d.report_run_file_location + '" style="margin-right: 15px; cursor: pointer"></a></td>';
                                // ret += '</tr>';

                                let retTr = [];
                                let ret = []

                                retTr.push('<tr class="heirarchy" role="row">');

                                ret.push( '<td class=" dt-body-center"><img style="width: 15px; position: relative; top: -2px" src="./../../../../assets/images/details_arrow.png">' + (rowData.alertEnabled && rowData.heirarchyData && rowData.heirarchyData.length ? '<div><b>ALERT</b></div>' : '') + '</td>');
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
                                        ret.push( '<td class="sorting_disabled" style="width: 30px;" aria-label="">' + (applyHeirarChyData ? applyHeirarChyData : rowData[prop]) + '</td>');
                                    }
                                }
                                ret.push('<td class="sorting_disabled" style="width: 30px;"><a class="fa fa-pencil fa-action-view" style="margin-right: 15px; visibility: hidden; cursor: pointer"></a><a class="fa fa-play fa-action-view" style="margin-right: 15px; visibility: hidden; cursor: pointer"></a><a class="fa fa-download fa-action-view" href="' + d.report_run_file_location + '" style="margin-right: 15px; cursor: pointer"></a></td>');

                                if(__this.dataObject.gridData.options.isActionColPosition) {
                                    ret.splice(__this.dataObject.gridData.options.isActionColPosition, 0, '<td class="">  ---  </td>');
                                }

                                // retTr and not ret
                                retTr.push('</tr>');

                                retStr += retTr[0] +  ret.join('') + retTr[1];

                            });
                            tr.after(retStr);
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

                                const disableActivation = !(rowData['external_status'] === 'EXPIRED' || rowData['external_status'] === 'PROVISIONED');
                                const disableDeActivate = !(rowData['external_status'] !== 'DEACTIVATED');
                                const disableUnlock = !(rowData['external_status'] === 'DEACTIVATED');

                                const retHtml = '<div>' +
                                    '<button  class="btn action-btn api-action"  data-action="resendEmail" style="width: auto; background: #fefefe; color: #3b3b3b; border-color: #c3c3c3; font-weight: 600;"' + (disableActivation ? ' disabled="disabled" ' : '') + '><span style="margin-right: 5px; position: relative;"><i class="fa fa-user" style="font-size: 20px" aria-hidden="true"></i><i class="fa fa-arrow-right" style="color: #5cb85c; font-size: 8px; position: absolute; top: 4px; left: 5px" aria-hidden="true"></i></span> Resend Activation Email</button>' +
                                    '<button class="btn action-btn api-action" data-action="deactivate" style="width: auto; background: #fefefe; color: #3b3b3b; border-color: #c3c3c3; font-weight: 600;"' + (disableDeActivate ? ' disabled="disabled" ' : '') + '><span style="margin-right: 5px; position: relative;"> <i class="fa fa-user" style="font-size: 20px;" aria-hidden="true"></i><i class="fa fa-times" style="color: #3FA8F4; font-size: 8px; position: absolute; top: 8px; left: 6px" aria-hidden="true"></i></span>DEACTIVATE</button>' +
                                    '<button class="btn action-btn api-action" data-action="unlock" style="width: auto; background: #fefefe; color: #3b3b3b; border-color: #c3c3c3; font-weight: 600;"' + (disableUnlock ? ' disabled="disabled" ' : '') + '><span style="margin-right: 5px; position: relative;"><i class="fa fa-user" style="font-size: 20px;" aria-hidden="true"></i><i class="fa fa-unlock" style="color: #3FA8F4; font-size: 8px; position: absolute; top: 8px; left: 6px" aria-hidden="true"></i></span>Unlock and Resend Activation email</button>' +
                                    '</div>';
                                row.child(retHtml).show();
                                __this.attachEvents(row);
                                tr.addClass('shown');
                            } else if (__this.identity === 'orders') {
                                // If not childRowAction buttons present
                                if(!__this.dataObject.gridData.options.isChildRowActions) {

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
                                        title: 'Payment Processed',
                                        subTitle: '10/04/2019',
                                        state : 'done',
                                        description: 'Payment Processing Completed'
                                    });
                                    orderSteps.push({
                                        title: 'Order In Progress',
                                        subTitle: '10/07/2019',
                                        state : 'current',
                                        description: 'Order details during started'
                                    });
                                    const id = Math.floor(Math.random() * (10000 - 1 + 1)) + 1;
                                    retHtml += __this.smartSteps1(id, orderSteps);
                                    //  retHtml += '<div class="col-lg-6 col-md-6 col-sm-12" style="width: 450px; border-radius: 4px; overflow-y: scroll;"><h4>Order History</h4><ul></ul><li>10/03/2019 - Order Modified</li><li>10/01/2019 - Payment Received - AMEX xxxx0747 </li><li>10/01/2019 - Order Created</li></div>';
                                    retHtml += '<p style="clear: both">';
                                    retHtml += '<div class="col-lg-6 col-md-6 col-sm-12" style="margin-top: -20px; margin-bottom: 20px"><button class="btn action-btn" style="width: auto; background: #fefefe; color: #3b3b3b; border-color: #c3c3c3; font-weight: 600; padding: 4px; font-size: 10px"><span style="margin-right: 5px; position: relative;"><i class="fa fa-user" style="font-size: 15px" aria-hidden="true"></i><i class="fa fa-check" style="color: #3FA8F4; font-size: 8px; position: absolute; top: 4px; left: 5px" aria-hidden="true"></i></span>Extend</button></div>';
                                    retHtml += '<p style="clear: both">';
                                    // retHtml += '<div class="col-lg-6 col-md-6 col-sm-12" id="' + accordian + '" style="width: 700px; height: 50px; background: lavender; margin-left: 15px"><h5 style="margin-top: 17px">Line Item 1</h5><div><p>Some Details</p></div><h5 style="margin-top: 17px">Line Item 2</h5><div><p>Some Details</p></div><h5 style="margin-top: 17px">Line Item 3</h5><div><p>Some Details</p></div></div>';
                                    const items = [];
                                    items.push({
                                        header: 'Google',
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
                                        }],
                                        actions : [
                                            'Extend','Refund','RollOver'
                                        ],
                                        adGroup : 'North America'
                                    });
                                    items.push({
                                        header: 'Facebook',
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
                                        }],
                                        actions : [
                                            'Extend', 'Cancel'
                                        ],
                                        adGroup : 'Europe'
                                    });
                                    items.push({
                                        header: 'Pinterest',
                                        content: 'Line Item 3 details goes here',
                                        steps : [{
                                            title: 'Campaign Start',
                                            subTitle: '12/01/2019',
                                            state : 'invalid'
                                        },{
                                            title: 'Campaign End',
                                            subTitle: '12/31/2019',
                                            state : 'invalid'
                                        }],
                                        actions : [
                                            'Extend', 'Cancel', ' Refund', 'Modify'
                                        ],
                                        adGroup : 'Asia'
                                    });
                                    retHtml += __this.lineItemDetails(items);

                                    row.child(retHtml).show();
                                    tr.addClass('shown');

                                    // Register Accordian click event
                                    $('.accordion .accordion-header').on('click', function() {
                                        $(this).toggleClass('active').next().slideToggle();
                                    });

                                } else if (__this.dataObject.gridData.options.isChildRowActions) {
                                    // If child Row Action buttons are present
                                    // Put child row Action buttons here
                                    let retHtml = __this.dataObject.gridData.options.isChildRowActions.htmlFunction(rowData);
                                    row.child(retHtml).show();
                                    __this.attachEvents(row);
                                    tr.addClass('shown');

                                } else {
                                    console.log("Error Code: ADT2C-001: Else, something in orders else condition")
                                }

                            } else if (__this.identity === 'invoices') {
                                __this.getInvoiceDetails(rowData.id).subscribe(
                                    response => {

                                        console.log('response >>')
                                        console.log(response);

                                        let retHtml = '';
                                        let headerId = '';
                                        if (response && response.data && response.data.length) {
                                            retHtml += '<div class="col-lg-12 col-mg-12 col-sm-12 form-group-fields" style="background: #fff">';

                                            const divMain = $('<div/>', {
                                            });
                                            $(divMain).append('<div><div class="row margin0" style="margin-top: 10px;"> <div class="col-sm-4"><label>Invoice Number : ' + rowData['invoice_number'] + '</label></div></div> </div>');
                                            $(divMain).append('<div><div class="row margin0"> <div class="col-sm-4"><label>Invoice Date : ' + rowData['invoice_date'] + '</label></div></div> </div>');
                                            $(divMain).append('<div><div class="row margin0"> <div class="col-sm-4"><label>Supplier : ' + rowData['supplier'] + '</label></div></div> </div>');
                                            $(divMain).append('<div><div class="row margin0" style="margin-bottom: 10px"> <div class="col-sm-4"><label>Invoice Amount : ' + rowData['invoice_amount'] + '</label></div></div> </div>');
                                            retHtml += $(divMain)[0].outerHTML;

                                            const divHeader = $('<div/>', {
                                                style : 'margin-left: 15px;',
                                            });

                                            const divHeaderDetails = $('<div/>', {
                                                style : 'margin-top: 10px; margin-bottom: 10px; border-bottom: 1px solid;',
                                                class : 'row margin0'
                                            });

                                            $(divHeaderDetails).append('<div style="width: 100px; display: inline-block"><label>Line Item ID</label></div>');
                                            $(divHeaderDetails).append('<div style="width:100px; display: inline-block"><label>Order ID</label></div>');
                                            $(divHeaderDetails).append('<div style="width:100px; display: inline-block"><label>Site Name</label></div>');
                                            $(divHeaderDetails).append('<div style="width:100px; display: inline-block"><label>Vendor ID</label></div>');
                                            $(divHeaderDetails).append('<div style="width:100px; display: inline-block"><label>Vendor Name</label></div>');
                                            if (response.data[0].site_name === 'KENSHOO') {
                                                $(divHeaderDetails).append('<div style="width:100px; display: inline-block"><label>Profile Name</label></div>');
                                            }
                                            $(divHeaderDetails).append('<div style="text-align: right; width: 100px; display: inline-block"><label>Billed Amount</label></div>');
                                            $(divHeaderDetails).append('<div style="text-align: right; width: 150px; display: inline-block"><label>Calculated Amount</label></div>');
                                            $(divHeaderDetails).append('<div style="text-align: right; width: 150px; display: inline-block"><label>Discrepancy Amount</label></div>');
                                            $(divHeaderDetails).append('<div style="text-align: right; margin-top: -1px; width: 150px; display: inline-block"><label><input style="position: relative; top: 0px" type="checkbox" class="header-applyAmount"/> Apply Full Amount</label></div>');
                                            $(divHeaderDetails).append('<div style="text-align: center; width: 150px; display: inline-block"><label>Pay Amount</label></div>');

                                            $(divHeader).append($(divHeaderDetails)[0].outerHTML);
                                            retHtml += $(divHeader)[0].outerHTML;

                                            const divBody = $('<div/>', {
                                                class: 'invoiceBody',
                                                css : {
                                                    'max-height' : '250px',
                                                    'margin-left' : '15px',
                                                    'overflow-y' : 'scroll',
                                                    'overflow-x' : 'hidden'
                                                }
                                            });

                                            let total = 0.00;

                                            response.data.forEach(function (ele, index) {

                                                if(index === 0) {
                                                    headerId = ele.invoice_header_id;
                                                }

                                                const divBodyDetails = $('<div/>', {
                                                    style : 'margin-bottom: 10px; background : ' + (index % 2 === 0 ? '#f9f9f9' : '#fff')  + '',
                                                    class : 'row',
                                                });

                                                $(divBodyDetails).append('<div style="padding-top: 7px; width: 100px; display: inline-block; padding-left: 15px"><span class="paymentText invoice-lineItem">' + ele.line_item_id + '</span></div>');
                                                $(divBodyDetails).append('<div style="padding-top: 7px; width: 100px; display: inline-block"><span class="paymentText">' + ele.order_id  + '</span></div>');
                                                $(divBodyDetails).append('<div style="padding-top: 7px; width: 100px; display: inline-block"><span class="paymentText">' +  ele.site_name  + '</span></div>');
                                                $(divBodyDetails).append('<div style="padding-top: 7px; width: 100px; display: inline-block"><span class="paymentText invoice-clientId">' + ele.client_id  + '</span></div>');
                                                $(divBodyDetails).append('<div style="white-space: pre-wrap; padding-top: 7px; width: 100px; display: inline-block"><span class="paymentText">' + ele.company_name  + '</span></div>');
                                                if (ele.site_name === 'KENSHOO') {
                                                    $(divBodyDetails).append('<div style="white-space: pre-wrap; padding-top: 7px; width: 100px; display: inline-block"><span class="paymentText">' + ele.profile_name + '</span></div>');
                                                }
                                                $(divBodyDetails).append('<div style="text-align: right; padding-top: 7px; width: 100px; display: inline-block"><span class="paymentText invoiceBilledAmount">$' + (ele.billed_amount ? ele.billed_amount.toLocaleString() : '0.00') + '</span></div>');
                                                $(divBodyDetails).append('<div style="text-align: right; padding-top: 7px; width: 150px; display: inline-block"><span class="paymentText">$' + (ele.calculated_amount ? ele.calculated_amount.toLocaleString() : '0.00') + '</span></div>');
                                                $(divBodyDetails).append('<div style="text-align: right; padding-top: 7px; width: 150px; display: inline-block"><span class="paymentText">$' + (ele.discrepancy_amount ? ele.discrepancy_amount.toLocaleString() : '0.00') + '</span></div>');

                                                const $span = $('<span/>', {
                                                    class : 'paymentText'
                                                });

                                                if (ele.discrepancy_amount === 0) {
                                                    $($span).append('<input type="checkbox" class="applyAmount"/>');
                                                } else {
                                                    $($span).append('<input type="checkbox" disabled="disabled"/>');
                                                }

                                                $(divBodyDetails).append('<div style="text-align: center; padding-top: 5px; width: 150px; display: inline-block">' + $($span)[0].outerHTML  + '</div>');
                                                $(divBodyDetails).append('<div style="width: 150px; display: inline-block"><div sty class="input-group col-sm-11"><span class="input-group-addon">$</span><input type="number" class="form-control invoicePayAmount" value="' + '0.00' + '" style="border-radius: 0 4px 4px 0; text-align: right" [(ngModel)]="item.pay" (keyup)="updateTotal(invoice)"></div></div>');

                                                total += 0.00; // ele.discrepancy_amount === 0 ? ele.billed_amount : 0.00;

                                                $(divBody).append($(divBodyDetails)[0].outerHTML);
                                            });

                                            const divFooter = $('<div/>', {
                                                class: 'invoiceFooter',
                                                css : {
                                                    'margin-top': '10px'
                                                }
                                            });

                                            if (response.data[0].site_name === 'KENSHOO') {
                                                $(divHeaderDetails).append('<div style="width: 100px"><label>Profile Name</label></div>');
                                            }
                                            $(divFooter).append('<div class="col-sm-9" style="margin-left: ' + (response.data[0].site_name === 'KENSHOO' ? '-56' : '-40')  + 'px"><div class="col-sm-' + (response.data[0].site_name === 'KENSHOO' ? '10' : '9') + '"><span></span></div><div class="col-sm-2" style="padding-left: 36px"><span><b>Total($)</b></span><span class="totalInvoice" style="float: right; margin-right: 45px; font-size: 14px">' + total.toLocaleString() + '</span></div></div>');
                                            $(divFooter).append('<div class="col-sm-9" style="margin-left: ' + (response.data[0].site_name === 'KENSHOO' ? '-131' : '-115')  + 'px"><div class="col-sm-' + (response.data[0].site_name === 'KENSHOO' ? '11' : '10') + '"><span></span></div><div class="col-sm-1" style="padding-left: 42px; padding-right: 0px"><button class="btn pull-right invoicePay" style="position: relative; left: 19px; margin-top: 30px; margin-bottom: 10px">Pay</button></div></div>');

                                            retHtml +=  $(divBody)[0].outerHTML + $(divFooter)[0].outerHTML;

                                            retHtml += '</div>';

                                        } else {
                                            retHtml += ' No details found';
                                        }
                                        row.child(retHtml).show();
                                        __this.attachInvoiceEvent(row, headerId);
                                        tr.addClass('shown');
                                    },
                                    err => {
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
                                const retHtml = `<div>
                                    <button
                                        class="btn action-btn api-action"
                                        data-action="resendEmail"
                                        style="width: auto; background: #fefefe; color: #3b3b3b; border-color: #c3c3c3; font-weight: 600;"
                                    >
                                        <span style="margin-right: 5px; position: relative;">
                                            <i class="fa fa-user" style="font-size: 20px" aria-hidden="true"></i>
                                            <i class="fa fa-arrow-right" style="color: #5cb85c; font-size: 8px; position: absolute; top: 4px; left: 5px" aria-hidden="true"></i>
                                        </span>
                                        Resend Activation Email
                                    </button>
                                    <button
                                        class="btn action-btn api-action"
                                        data-action="deactivate"
                                        style="width: auto; background: #fefefe; color: #3b3b3b; border-color: #c3c3c3; font-weight: 600;"
                                    >
                                        <span style="margin-right: 5px; position: relative;">
                                            <i class="fa fa-user" style="font-size: 20px;" aria-hidden="true"></i>
                                            <i class="fa fa-times" style="color: #3FA8F4; font-size: 8px; position: absolute; top: 8px; left: 6px" aria-hidden="true"></i>
                                        </span>
                                        DEACTIVATE
                                    </button>
                                    <button
                                        class="btn action-btn api-action"
                                        data-action="unlock"
                                        style="width: auto; background: #fefefe; color: #3b3b3b; border-color: #c3c3c3; font-weight: 600;"
                                    >
                                        <span style="margin-right: 5px; position: relative;">
                                            <i class="fa fa-user" style="font-size: 20px;" aria-hidden="true"></i>
                                            <i class="fa fa-unlock" style="color: #3FA8F4; font-size: 8px; position: absolute; top: 8px; left: 6px" aria-hidden="true"></i>
                                        </span>
                                        Unlock and Resend Activation email
                                    </button>

                                    </div>`;
                                row.child(retHtml).show();
                                __this.attachEvents(row);
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
                                    title: 'Payment Processed',
                                    subTitle: '10/04/2019',
                                    state : 'done',
                                    description: 'Payment Processing Completed'
                                });
                                orderSteps.push({
                                    title: 'Order In Progress',
                                    subTitle: '10/07/2019',
                                    state : 'current',
                                    description: 'Order details during started'
                                });
                                const id = Math.floor(Math.random() * (10000 - 1 + 1)) + 1;
                                retHtml += __this.smartSteps1(id, orderSteps);
                                //  retHtml += '<div class="col-lg-6 col-md-6 col-sm-12" style="width: 450px; border-radius: 4px; overflow-y: scroll;"><h4>Order History</h4><ul></ul><li>10/03/2019 - Order Modified</li><li>10/01/2019 - Payment Received - AMEX xxxx0747 </li><li>10/01/2019 - Order Created</li></div>';
                                retHtml += '<p style="clear: both">';
                                retHtml += '<div class="col-lg-6 col-md-6 col-sm-12" style="margin-top: -20px; margin-bottom: 20px"><button class="btn action-btn" style="width: auto; background: #fefefe; color: #3b3b3b; border-color: #c3c3c3; font-weight: 600; padding: 4px; font-size: 10px"><span style="margin-right: 5px; position: relative;"><i class="fa fa-user" style="font-size: 15px" aria-hidden="true"></i><i class="fa fa-check" style="color: #3FA8F4; font-size: 8px; position: absolute; top: 4px; left: 5px" aria-hidden="true"></i></span>Extend</button></div>';
                                retHtml += '<p style="clear: both">';
                                // retHtml += '<div class="col-lg-6 col-md-6 col-sm-12" id="' + accordian + '" style="width: 700px; height: 50px; background: lavender; margin-left: 15px"><h5 style="margin-top: 17px">Line Item 1</h5><div><p>Some Details</p></div><h5 style="margin-top: 17px">Line Item 2</h5><div><p>Some Details</p></div><h5 style="margin-top: 17px">Line Item 3</h5><div><p>Some Details</p></div></div>';
                                const items = [];
                                items.push({
                                    header: 'Google',
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
                                    }],
                                    actions : [
                                        'Extend','Refund','RollOver'
                                    ],
                                    adGroup : 'North America'
                                });
                                items.push({
                                    header: 'Facebook',
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
                                    }],
                                    actions : [
                                        'Extend', 'Cancel'
                                    ],
                                    adGroup : 'Europe'
                                });
                                items.push({
                                    header: 'Pinterest',
                                    content: 'Line Item 3 details goes here',
                                    steps : [{
                                        title: 'Campaign Start',
                                        subTitle: '12/01/2019',
                                        state : 'invalid'
                                    },{
                                        title: 'Campaign End',
                                        subTitle: '12/31/2019',
                                        state : 'invalid'
                                    }],
                                    actions : [
                                        'Extend', 'Cancel', ' Refund', 'Modify'
                                    ],
                                    adGroup : 'Asia'
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
                }
            });


            // Initialize bootstrap datepicker for inline date fields
            $('.datepicker').datepicker({
                format: 'yyyy-mm-dd',
                clearBtn: true,
                // todayBtn: true,
                autoclose: true,
                todayHighlight: true
            });

            // Register change event on inline edit fields
            $(document).off('change', '.inlineEditor');
            $('.inlineEditor').on('change', function () {
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

            // Register change event on inline edit fields
            $(document).off('change', '.inlineEditor-sub');
            $('.inlineEditor-sub').on('change', function () {
                console.log('this.val >>>')
                console.log($(this).val());

                console.log('$(this).data(\'field\') >>>')
                console.log($(this).data('field'));

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

                const value = $(this).val();
                if ($(this).data('type') === 'checkbox') {
                    if(typeof __this.dataObject.gridData.result[rowIndex][__this.dataObject.gridData.headers[columnIndex].key] === 'string') {
                        __this.dataObject.gridData.result[rowIndex][__this.dataObject.gridData.headers[columnIndex].key] = [];
                    }
                    if ($(this).is(":checked") && __this.dataObject.gridData.result[rowIndex][__this.dataObject.gridData.headers[columnIndex].key].indexOf(value) === -1) {
                        __this.dataObject.gridData.result[rowIndex][__this.dataObject.gridData.headers[columnIndex].key].push(value);
                    } else if (__this.dataObject.gridData.result[rowIndex][__this.dataObject.gridData.headers[columnIndex].key].indexOf(value) !== -1) {
                        __this.dataObject.gridData.result[rowIndex][__this.dataObject.gridData.headers[columnIndex].key].splice(value, 1);
                    }
                } else {
                    __this.dataObject.gridData.result[rowIndex][__this.dataObject.gridData.headers[columnIndex].key] = value;
                }

                console.log('__this.dataObject.gridData.result[rowIndex] >>>')
                console.log(__this.dataObject.gridData.result[rowIndex]);

                console.log('__this.dataObject.gridData.headers[columnIndex].key >>>')
                console.log(__this.dataObject.gridData.headers[columnIndex].key);

                //  __this.dataObject.gridData.result[rowIndex][__this.dataObject.gridData.headers[columnIndex].key] = $(this).val();

                console.log('__this.dataObject.gridData.result >>>')
                console.log(__this.dataObject.gridData);
            });

            $(document).off('click', '.step-nav');
            $(document).on('click', '.step-nav', function() {
                const id = $(this).attr('id').replace('#','');
                $(this).closest('div.steps-main').find('div.step-container').find('.step-content').removeClass('active');
                $(this).closest('div.steps-main').find('div.step-container').find('.step-content').each(function () {
                    if($(this).attr('id') === id) {
                        $(this).addClass('active');
                    }
                });
            });

            // Register ad events
            $(document).off('click', '.adCopy');
            $(document).on('click', '.adCopy', function() {
                console.log('$thid')
                console.log($(this).next('.adDetails'));
                $(this).next('.adDetails').show(500);
            });

            $(document).off('click', '.closeAd');
            $(document).on('click', '.closeAd', function() {
                $(this).closest('.adDetails').hide(500);
            });

            // Initiate ad image click
            $(document).off('click', '.ad-image');
            $(document).on('click', '.ad-image', function () {

                // remove existing
                $('i.fa-check-circle.visible').hide();
                $('.ad-image').removeClass('visible');
                $('i.fa-check-circle.visible').removeClass('visible');

                if (!$(this).hasClass('visible')) {
                    $(this).addClass('visible');
                    $(this).next('i.fa-check-circle').addClass('visible');
                    $(this).next('i.fa-check-circle').show(500);
                } else {
                    $(this).removeClass('visible');
                    $(this).next('i.fa-check-circle').removeClass('visible');
                    $(this).next('i.fa-check-circle').hide(500);
                }
            });

            $(document).off('click', '.display-ad');
            $(document).on('click', '.display-ad', function () {

                $(this).addClass('selected');
                const adInfo = [{
                    placeHolder : 'News Feed',
                    price: 25
                },{
                    placeHolder : 'Shopping',
                    price: 15
                },{
                    placeHolder: 'Messenger',
                    price: 10
                },{
                    placeHolder:  'Group',
                    price: 5
                }];

                let retHtml = '';
                for (let i=0; i < adInfo.length; i++) {
                    retHtml += '<div class="col-lg-6 col-md-6 col-sm-6"><div style="cursor: pointer; height: 150px"><img class="ad-image" width="200px" src="./../../../../assets/images/test_ad_' + (i+1) + '.jpeg"/><i class="fa fa-check-circle" style="font-size: 38px; position: absolute; left: 0px; color: #5FA1DE; display: none"></i></div><div style="text-align: center;"><span>Click to Select</span><br/><span>Placeholder : ' + adInfo[i].placeHolder + '</span><br/><span>Price : $' + adInfo[i].price + '/day</span></div></div>';
                    if(i % 2 !== 0) {
                        retHtml += '<p style="clear:both"></p><p style="clear:both"></p>';
                    }
                }

                $('#bootstrap-modal-header').text('Select Inventory');
                $('#bootstrap-modal-body').html('<div style="padding: 15px; width: 500px;">' + retHtml + '<div>');
                $('#myModal').modal('show');
            });

            $(document).off('click', '.metric-info');
            $(document).on('click', '.metric-info', function () {
                const index1 = $('.metric-info').index(this);
                $('.metric-info').each(function (index) {
                    if (index1 !== index && $(this).next('.metric-details').hasClass('shown')) {
                        $(this).next('.metric-details').removeClass('shown');
                        $(this).next('.metric-details').hide(500);
                    }
                });
                if (!$(this).next('.metric-details').hasClass('shown')) {
                    $(this).next('.metric-details').addClass('shown');
                    $(this).next('.metric-details').show(500);
                } else {
                    $(this).next('.metric-details').removeClass('shown');
                    $(this).next('.metric-details').hide(500);
                }
            });

            $(document).off('change', '.select-control');
            $(document).on('change', '.select-control', function () {
                const required = $(this).data('validation');
                if(!$(this).val() && required) {
                    $(this).closest('td').find('div.alert-danger').show();
                } else {
                    $(this).closest('td').find('div.alert-danger').hide();
                }
            });

            // $(document).off('mouseenter mouseleave', '.editLink, .playLink, .downloadLink, .deleteLink');
            // $(document).on({
            //     mouseenter: function () {
            //         $(this).after('<span class="ng-tooltip ng-tooltip-right ng-tooltip-show" style="transition: opacity 500ms ease 0s; left: 55px;">Hello this is some text</span>')
            //       //  $(this).find('span.ng-tooltip').addClass('ng-tooltip-show');
            //     },
            //     mouseleave: function () {
            //         $(this).find('span.ng-tooltip').remove();
            //     }
            // }, '.editLink, .playLink, .downloadLink, .deleteLink');

            $('.disabled').attr('disabled', 'disabled');
            $('.disabled').css('cursor', 'not-allowed');
            $('.disabled').css('background', '#EEEEEE');
        }
    }

    handleModalSave() {
        const __this = this;
        $('.ad-image').each(function () {
            if ($(this).hasClass('visible')) {
                const index = $('.ad-image').index(this);
                const adInfo = [{
                    placeHolder : 'News Feed',
                    price: 25
                }, {
                    placeHolder : 'Shopping',
                    price: 15
                }, {
                    placeHolder: 'Messenger',
                    price: 10
                }, {
                    placeHolder:  'Group',
                    price: 5
                }];
                const price = adInfo[index].price;
                const imageIndex = (index + 1);
                $('.display-ad').each(function () {
                    if ($(this).hasClass('selected')) {
                        $(this).attr('src','./../../../../assets/images/test_ad_' + imageIndex + '.jpeg');
                        $(this).css('width', '100px');
                        const start = $(this).closest('tr').find('td').eq(1).find('input.inlineEditor').val();
                        const end = $(this).closest('tr').find('td').eq(2).find('input.inlineEditor').val();
                        if (start && end) {
                            const daysDiff = __this.getDaysBetweenDates(new Date(end), new Date(start));
                            $(this).closest('tr').find('td').last().find('input.inlineEditor').val((daysDiff + 1) * price);
                            $(this).closest('tr').find('td').find('.alert-danger').hide();
                        }
                    }
                });
                $('.display-ad').removeClass('selected');
            }
        });
        $('#myModal').modal('hide');
    }

    smartSteps1(id, steps, isLineItem = false, lineItemName = null) {
        const $mainDiv = $('<div/>', {
            'class': 'col-lg-6 col-md-6 col-sm-12',
            css : {
                'width' : isLineItem ? '800px' : '700px',
                'margin-bottom' : '20px'
            }
        });
        const $div = $('<div/>', {
            id: id,
            class: 'crumbs-main',
            css : {
                'position' : 'relative',
                'left' : isLineItem ? '-77px' : '-67px'
            }
        });
        const $ul = $('<ul/>', {
            class : 'crumb-trail clearfix'
        });
        for (let i=0; i < steps.length; i++) {
            if(i === 0 && isLineItem) {
                $ul.append(this.getLineItemWidth(i, steps));
            } else {
                $ul.append('<li class="crumb pull-left ' + steps[i].state + '"><div><span style="font-size: 10px">' + steps[i].title + '</span><p style="clear:both"></p><small style="position: absolute;top: 20px; font-size: 8px">' +  steps[i].subTitle +  '</small></div></li>');
            }
        }
        if (isLineItem) {
            $div.append('<img class="adCopy" tooltip="View/Change AdCopy" style="width: 38px;position: relative;left: 10px;margin-left: 42px;margin-right: 12px;float: left; cursor: pointer; top: -4px" src="./../../../../assets/images/adCopy.png"/>');
            $div.append('<div class="adDetails" style="position: absolute;left: 50px;z-index: 100;border: 1px solid;border-radius: 4px;margin: 4px;padding: 5px 10px;background: #f2f2f9;top: -3px; display: none; width: 540px"><div><b style="font-size: 14px">Ad Details</b><i class="fa fa-times-circle closeAd" aria-hidden="true" style="float: right;font-size: 20px; cursor: pointer" ></i></div><div class="col-lg-6 col-md-6 col-sm-6"><div style="margin-top: 10px"><img style="width: 200px" src="../../../../assets/images/test_ad_1.jpeg"/></div><div style="margin-top: 10px"><label>Header</label><br><span style="white-space: pre-wrap">Samsung Galaxy S10 - 40% Off</span></div><div style="margin-top: 10px"><label>Description</label><br><span style="white-space: pre-wrap">For a limited time, get Samsung Galaxy S10 smart phone at just $649 </span></div></div>   <div class="col-lg-6 col-md-6 col-sm-6"><span><b>Targeting Parameters</b></span><div style="margin-top: 10px"><ul><li style="white-space: pre-wrap">Age : 17-25</li><li>Geo : North America</li><li>Geneder: Male</li><li>Education: College</li><li>Language: English</li><li>Interests: Consumer Electronics</li></ul></div></div> <div class="col-lg-6 col-md-6 col-sm-6"><span><b>First Party Data Plan : </b>Plan 1</span><div style="margin-top: 10px"></div></div>  <div class="col-lg-6 col-md-6 col-sm-6"><span><b>Summary ( As of '   +  (((new Date().getMonth() > 8) ? (new Date().getMonth() + 1) : ('0' + (new Date().getMonth() + 1))) + '/' + ((new Date().getDate() > 9) ? new Date().getDate() : ('0' + new Date().getDate())) + '/' + new Date().getFullYear())   +    ' )</b></span><div style="margin-top: 10px"><ul><li style="white-space: pre-wrap">Ad Copy displays on ' +  lineItemName  + ( lineItemName === "Google" ? " Search" : " News Feed" ) + '</li><li>Ad Reach : 20,000</li><li>ROAS : 40%</li><li>Revenue : $8,000</li><li>7-day attribution period</li><li style="position: relative"><div style="display: inline-block; width: 80px">Impressions :</div><div class="metric-info" style="display: inline-block; margin-left: 10px; position: relative; top: 3px; cursor: pointer"><div style="width: 50px; height: 15px; border: 1px solid #7CCC71; border-right: 1px solid #989498; text-align: center; display: inline-block; background: #7CCC71; color: #fff"></div><div style="width: 30px; height: 15px; border: 1px solid #7CCC71; text-align: center; display: inline-block; background: #7CCC71; color: #fff"></div><div style="width: 20px; height: 15px; border: 1px solid #fff; text-align: center; display: inline-block; background: #fff"></div></div><div class="metric-details" style="background: #fff;position: absolute;top: 2px;left: 194px;z-index: 100;padding: 5px;border-radius: 4px; display: none"><label>Impressions</label><br>Target : 10,000<br>Actual : 12,000<br>Percentage : 120%<br><a href="/app/dashboards/spend">View details in dashboard</a></div></li><li style="position: relative"><div style="display: inline-block; width: 80px">Clicks :</div><div class="metric-info" style="display: inline-block; margin-left: 10px; position: relative; top: 3px; cursor: pointer"><div style="width: 20px; height: 15px; border: 1px solid #D54E56; text-align: center; display: inline-block; background: #D54E56; color: #fff"></div><div style="width: 30px; height: 15px; border-right: 1px solid #989498; text-align: center; display: inline-block; background: #fff; color: #fff"></div><div style="width: 50px; height: 15px; border: 1px solid #fff; text-align: center; display: inline-block; background: #fff"></div></div><div class="metric-details" style="background: #fff;position: absolute;top: 2px;left: 194px;z-index: 100;padding: 5px;border-radius: 4px; display: none"><label>Clicks</label><br>Target : 10,000<br>Actual : 4,000<br>Percentage : 40%<br><a href="/app/dashboards/spend">View details in dashboard</a></div></li><li style="position: relative"><div style="display: inline-block; width: 80px">Spend :</div><div class="metric-info" style="display: inline-block; margin-left: 10px; position: relative; top: 3px; cursor: pointer"><div style="width: 40px; height: 15px; border: 1px solid #F3A42B; text-align: center; display: inline-block; background: #F3A42B; color: #fff"></div><div style="width: 10px; height: 15px; border-right: 1px solid #989498; text-align: center; display: inline-block; background: #fff; color: #fff"></div><div style="width: 50px; height: 15px; border: 1px solid #fff; text-align: center; display: inline-block; background: #fff"></div></div><div class="metric-details" style="background: #fff;position: absolute;top: 2px;left: 194px;z-index: 100;padding: 5px;border-radius: 4px; display: none"><label>Spend</label><br>Target : $20,000<br>Actual : $16,000<br>Percentage : 80%<br><a href="/app/dashboards/spend">View details in dashboard</a></div></li><li style="position: relative"><div style="display: inline-block; width: 80px">ROAS :</div><div class="metric-info" style="display: inline-block; margin-left: 10px; position: relative; top: 3px; cursor: pointer"><div style="width: 20px; height: 15px; border: 1px solid #D54E56; text-align: center; display: inline-block; background: #D54E56; color: #fff"></div><div style="width: 30px; height: 15px; border-right: 1px solid #989498; text-align: center; display: inline-block; background: #fff; color: #fff"></div><div style="width: 50px; height: 15px; border: 1px solid #fff; text-align: center; display: inline-block; background: #fff"></div></div><div class="metric-details" style="background: #fff;position: absolute;top: 2px;left: 194px;z-index: 100;padding: 5px;border-radius: 4px; display: none"><label>ROAS</label><br>Target : $40,000<br>Actual : $16,000<br>Percentage : 40%<br><a href="/app/dashboards/spend">View details in dashboard</a></div></li><li style="position: relative"><div style="display: inline-block; width: 80px">Revenue :</div><div class="metric-info" style="display: inline-block; margin-left: 10px; position: relative; top: 3px; cursor: pointer"><div style="width: 5px; height: 15px; border: 1px solid #D54E56; text-align: center; display: inline-block; background: #D54E56; color: #fff"></div><div style="width: 45px; height: 15px; border-right: 1px solid #989498; text-align: center; display: inline-block; background: #fff; color: #fff"></div><div style="width: 50px; height: 15px; border: 1px solid #fff; text-align: center; display: inline-block; background: #fff"></div></div><div class="metric-details" style="background: #fff;position: absolute;top: 2px;left: 194px;z-index: 100;padding: 5px;border-radius: 4px; display: none;"><label>Revenue</label><br>Target : $20,000<br>Actual : $1,000<br>Percentage : 5%<br><a href="/app/dashboards/spend">View details in dashboard</a></div></li></ul></div></div>');
        }
        $div.append($ul);
        $mainDiv.append($div);

        return $mainDiv[0].outerHTML;
    }

    getLineItemWidth(i, steps) {
        const d = new Date();
        let retHtml = '';
        if (d.getTime() <= new Date(steps[1].subTitle).getTime() && d.getTime() >= new Date(steps[0].subTitle).getTime()) {
            const daysLeft = this.getDaysBetweenDates(new Date(steps[1].subTitle), new Date()) + 1;
            const totaldays = (this.getDaysBetweenDates(new Date(steps[1].subTitle), new Date(steps[0].subTitle))) + 1;
            const markerPointLeft = 128.28 + ((485 / (totaldays)) * (totaldays - (daysLeft + 1)));
            retHtml += '<li class="crumb pull-left done" style="width: ' + markerPointLeft + 'px"><div><span style="font-size: 10px">' + steps[i].title + '</span><p style="clear:both"></p><small style="position: absolute;top: 20px; font-size: 8px">' +  steps[i].subTitle +  '</small></div></li>';
            retHtml += '<li><span style="position: absolute; top: -22px; left: '  + (markerPointLeft + 21)  + 'px; border: 1px solid #5bc0de; padding: 4px; background: #5bc0de; color: white; border-radius: 4px; font-size: 9px ">In Progress (' + (daysLeft) + ' days left)</span></li>';
            // retHtml += '<li><span style="position: absolute; top: -6px; z-index: 100; left: ' + markerPointLeft + 'px; color: #5bc0de">|</span></li>';
        } else if (d.getTime() >= new Date(steps[1].subTitle).getTime()) {
            retHtml += '<li class="crumb pull-left done" style="width: 485px"><div><span style="font-size: 10px">' + steps[i].title + '</span><p style="clear:both"></p><small style="position: absolute;top: 20px; font-size: 8px">' +  steps[i].subTitle +  '</small></div></li>';
            retHtml += '<li><span style="position: absolute; top: -22px; left: '  + (485 + 48)  + 'px; border: 1px solid #5bc0de; padding: 4px; background: #5bc0de; color: white; border-radius: 4px; font-size: 9px ">Completed</span></li>';
        } else {
            retHtml += '<li class="crumb pull-left invalid"><div><span style="font-size: 10px">' + steps[i].title + '</span><p style="clear:both"></p><small style="position: absolute;top: 20px; font-size: 8px">' +  steps[i].subTitle +  '</small></div></li>';
            retHtml += '<li><span style="position: absolute; top: -22px; left: '  + (170)  + 'px; border: 1px solid #5bc0de; padding: 4px; background: #5bc0de; color: white; border-radius: 4px; font-size: 9px ">Not Started</span></li>';
        }

        return retHtml;
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

            $divDetails.append('<div class="col-lg-6 col-md-6 col-sm-12" style="margin-top: 20px"></div>');
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
            'class': 'accordion',
            css : {
                'margin-top' : '-20px'
            }
        });
        for (let i=0; i < items.length; i++) {
            const id = Math.floor(Math.random() * (10000 - 1 + 1)) + 1;
            $mainDiv.append('<div class="accordion-header"><span style="position: relative; top: -5px">' + items[i].header + '</span></div>');
            if(items[i].actions) {
                let buttons = '';
                items[i].actions.forEach(function (action) {
                    buttons += '<button class="btn action-btn" style="width: auto; background: #fefefe; color: #3b3b3b; border-color: #c3c3c3; font-weight: 600; padding: 4px; font-size: 10px"><span style="margin-right: 5px; position: relative;"><i class="fa fa-user" style="font-size: 15px" aria-hidden="true"></i><i class="fa fa-check" style="color: #3FA8F4; font-size: 8px; position: absolute; top: 4px; left: 5px" aria-hidden="true"></i></span>' + action  + '</button>';
                });
                $mainDiv.append('<div class="accordion-content">' + this.smartSteps1(id, items[i].steps, true, items[i].header) + '<p style="clear: both"></p><div class="col-lg-6 col-md-6 col-sm-12" style="margin-top: -20px; margin-bottom: 20px; margin-left: 15px">' + buttons + '</div><p style="clear: both"></p><div class="col-lg-6 col-md-6 col-sm-12" style="margin-top: -20px; margin-left: 15px"><span>Ad Group : ' + items[i].adGroup + '</span></div></div>');
            }
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

        const AccessToken: any = localStorage.getItem('accessToken');
        let token = '';
        if (AccessToken) {
            // token = AccessToken.accessToken;
            token = AccessToken;
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

    getInvoiceDetails(invoiceId) {
        const AccessToken: any = localStorage.getItem('accessToken');
        let token = '';
        if (AccessToken) {
            // token = AccessToken.accessToken;
            token = AccessToken;
        }
        const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen' });
        const options = new RequestOptions({headers: headers});
        var url = this.api_fs.api + '/api/payments/invoices/' + invoiceId;
        return this.http
            .get(url, options)
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
                if (__this.dataObject.gridData.options.isRowHighlight) {
                    $('#example tbody tr').removeClass('selected');
                }
            }
            if (table[type]) {

                table[type](indexes).nodes().to$().find('td input.check-row-selection').prop('checked', true);
                if (__this.dataObject.gridData.options.isRowHighlight) {
                    table[type](indexes).nodes().to$().addClass('selected');
                }

                if (__this.dataObject.gridData.options.isRowHighlight) {
                    table[type](indexes).nodes().to$().find('td input.check-row-selection').prop('checked', true);
                    table[type](indexes).nodes().to$().addClass('selected');
                } else {
                    table[type](indexes).nodes().to$().removeClass('selected');
                }

                console.log('indexes >>')
                console.log(indexes)
                console.log('__this.sendResponseOnCheckboxClick >>')
                console.log(__this);

                if (__this.dataObject.gridData.options.sendResponseOnCheckboxClick) {
                    __this.triggerActions.emit({
                        action: 'handleCheckboxSelection',
                        data: __this.dataObject.gridData.result[indexes[0]],
                        rowIndex: indexes[0]
                    });
                }
            }
            __this.adjustHeight(__this);
        });
    }

    registerUnCheckboxSelection(table, __this) {
        // Handle table row deselect event
        table.on('deselect', function (e, dt, type, indexes) {
            table[type](indexes).nodes().to$().find('td input.check-row-selection').prop('checked', false);
            if (__this.dataObject.gridData.options.sendResponseOnCheckboxClick) {
                __this.triggerActions.emit({
                    action: 'handleUnCheckboxSelection',
                    data: __this.dataObject.gridData.result[indexes[0]],
                    rowIndex: indexes[0]
                });
            }
            __this.adjustHeight(__this);
        });
    }

    adjustHeight(context){
        if(context.fixedColumnFlag){
            // console.log('context.height>>>>>>', context.height);
            let height = context.height - 18;
            $('.DTFC_LeftWrapper>.DTFC_LeftBodyWrapper').css('height', height);
            $('.DTFC_LeftBodyWrapper>.DTFC_LeftBodyLiner').css('height', height);
            $('.DTFC_LeftBodyWrapper>.DTFC_LeftBodyLiner').css('max-height', height);
            $('.DTFC_LeftBodyWrapper>.DTFC_LeftBodyLiner').css('padding-top', '15px');
            $('.DTFC_LeftBodyWrapper>.DTFC_LeftBodyLiner>table').css('border', 0);
        }
    }

    exportTable(){
        // console.log('from table', $.fn.jquery);
        $('.buttons-csv').click();
    }
}
