import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import * as gridData from '../../../../localService/tableData.json';
import * as _ from 'lodash';

declare var $: any;
declare var jquery: any;
import 'datatables.net';

@Component({
  selector: 'app-ng-data-table',
  templateUrl: './ng-data-table.component.html',
  styleUrls: ['./ng-data-table.component.css'],
  moduleId: module.id
})

export class NgDataTableComponent implements OnInit, AfterViewInit {

  setId: any;
  tableData: any;

  @Input()
  data: any;
  counter = 0;
  @Input() id: any;
  @Input() newRow: any;
  // @Input() refreshData: any;
  // @Input() dataTableAction: DataTableAction;
  @Output()
  filterValues: EventEmitter<any> = new EventEmitter();

  public hero: string;
  tableWidget: any = [];
  tableId: any = 0;
  items = [['item1', 'item2', 'item3']];
  public temp_var: Object = true;
  public tempData: any = [];

  refreshData(event) {
  }

  constructor(
    public toastr: ToastsManager,
    private formBuilder: FormBuilder) {
    this.tableData = gridData;
  }

  ngOnInit() {
    this.setId = this.id !== undefined ? this.id : 'gridtable';
    // this.tableData = ;
    // this.newRow = '';
    // console.log(this.newRow)
    this.displayDataTable();
    // this.displayDataTableNew();
  }

  ngAfterViewInit() {
    // console.log('checking')
  }

  handleAdd(rowObj: any) {
    // this.dataTableAction.handleAddRow(rowObj);
  }

  /*
  // not used, will remove later
  private displayDataTableNew(): void {
    const defs = [], hKey = [];
    const option = this.tableData.options;
    const headers = this.tableData.headers;

    headers.forEach(function (data, index) {
      const def = {};
      const opt = option;
      def['targets'] = index;
      def['orderable'] = data.isFilterRequired;
      def['searchable'] = true;
      def['className'] = !data.isFilterRequired ? 'dt-not-search' : 'dt-body-left';
      if (data.isCheckbox) {
        def['render'] = function (dat, type, full, meta) {
          // return '<span>'+$('<div/>').text(dat).html()+'</span><input type="checkbox" id="'+data.data+'" name="id[]" value="'
          //    + $('<div/>').text(dat).html() + '"><i class="fa fa-square-o" aria-hidden="true"></i>';
          //  }
          return '<input type="hidden" id="' + data.data + '" value="' + dat + '"/><span class="hidden">' + dat +
          '</span><label class="control control--checkbox"><input type="checkbox" id="' + data.data + '" name="id[]" value="'
            + dat + '"/> <div class="control__indicator"></div></label>';
        };
      }
      if (index === 0 && !data.isCheckbox) {
        def['render'] = function (dat, type, full, meta) {
          return '<input type="hidden" value="' + dat + '"/>' + dat;
        };
      }
      ;
      if (opt.isEditOption && data.editButton) {
        def['render'] = function (dat, type, full, meta) {
          return '<span></span>' + dat + '<i class="fa fa-pencil" aria-hidden="true"></i>';
        };
      }
      if (data.onchange) {
        def['render'] = function (dat, type, full, meta) {
          const checking = $('<div/>').text(dat).html() === 'true';
          const changeChk = checking ? 'checked' : '';
          const actClass = checking ? 'a-tive' : 'in-active';
          return '<label class="switch"><input type="checkbox" ' + changeChk + ' value="' + full[data.ref] +
          '"><sp class="slider round ' + actClass + '"><span class="yes-no-wrap"><span class="yes-wrap">yes' +
          '</span><span class="no-wrap">no</span></span></sp></label>';
        };
      }
      hKey.push(data.data);
      defs.push(def);
    }, this);

    $(document).ready(function () {
      $('#ng-data-table').DataTable({
        'columns': headers,
        'columnDefs': defs,
        dom: 'lfrti',
        searching: false,
        select: false,
        paging: false
      });
    });

  }
  */

  private displayDataTable(): void {
    // $('.dataTableWrapper').append('<table id="'+this.setId+'" class="table order-column admin-user gridtable"></table>');
    const table: any = $('#ng-data-table');
    const comThis = this;
    const defs = [], hKey = [];
    const option = this.data.options;
    const headers = this.data.headers;
    const result = this.data.result;

    this.tableWidget.push(this.setId);

    headers.forEach((data, index) => {
      const def = {};
      const opt = option;
      def['targets'] = index;
      def['orderable'] = data.isFilterRequired;
      def['searchable'] = true;
      def['className'] = !data.isFilterRequired ? 'dt-not-search' : 'dt-body-left';
      if (data.isCheckbox) {
        def['render'] = (dat, type, full, meta) => {
          // return '<span>'+$('<div/>').text(dat).html()+'</span><input type="checkbox" id="'+data.data+'" name="id[]" value="'
          //    + $('<div/>').text(dat).html() + '"><i class="fa fa-square-o" aria-hidden="true"></i>';
          //  }
          return '<input type="hidden" id="' + data.data + '" value="' + dat + '"/><span class="hidden">' + dat +
            '</span><label class="control control--checkbox"><input type="checkbox" id="' + data.data + '" name="id[]" value="'
            + dat + '"/> <div class="control__indicator"></div></label>';
        };
        setTimeout(() => {
          table.find('thead th:eq(0)').addClass('selectAll').append('<span></span><label class="control control--checkbox">' +
            '<input type="checkbox"/> <div class="control__indicator"></div></label>');
        }, 100);
      }
      if (index === 0 && !data.isCheckbox) {
        def['render'] = (dat, type, full, meta) => {
          return '<input type="hidden" value="' + dat + '"/>' + dat;
        };
      }

      if (opt.isEditOption && data.editButton) {
        def['render'] = (dat, type, full, meta) => {
          return '<span></span>' + dat + '<i class="fa fa-pencil" aria-hidden="true"></i>';
        };
      }
      if (data.onchange) {
        def['render'] = (dat, type, full, meta) => {
          const checking = $('<div/>').text(dat).html() === 'true';
          const changeChk = checking ? 'checked' : '';
          const actClass = checking ? 'a-tive' : 'in-active';
          return '<label class="switch"><input type="checkbox" ' + changeChk + ' value="' + full[data.ref] +
            '"><sp class="slider round ' + actClass + '"><span class="yes-no-wrap"><span class="yes-wrap">yes' +
            '</span><span class="no-wrap">no</span></span></sp></label>';
        };
      }
      hKey.push(data.data);
      defs.push(def);
    }, this);

    const buttons = [];
    if (option.isSearchColumn) {
      buttons.push({
        extend: '',
        text: '<i class="fa fa-filter fa-Ifilter" aria-hidden="true"></i>'
      });
    }
    if (option.isColVisibility) {
      buttons.push({
        extend: 'colvis',
        text: '<i class="fa fa-cog fa-Ivisible" aria-hidden="true"></i>',
        postfixButtons: ['colvisRestore'],
      });
    }
    // if (option.isDownload) {
    if (option.isDownloadAsCsv) {
      buttons.push({
        extend: 'csv',
        text: '<i class="fa fa-download fa-Idown" aria-hidden="true"></i>',
        exportOptions: {
          columns: headers[0].isCheckbox || headers[0].data === 'id' ? ':not(:first-child)' : '',
        }
      });
    }

    // Dom values options
    let domm = 'Brtipl';
    if (option.isSearchGlobal) {
      domm = 'f' + domm;
    }
    if (!option.isShowEntries) {
      domm = domm.replace('l', '');
    }

    const pageLength = option.isPageLength === undefined ? 10 : option.isPageLength;
    this.tableWidget[this.tableId] = table.DataTable({
      columns: headers,
      columnDefs: defs,
      dom: domm,
      paging: option.isPagination === undefined ? result.length > pageLength ? true : false : option.isPagination,
      ordering: option.isOrdering === undefined ? true : option.isOrdering,
      info: option.isTableInfo === undefined ? true : option.isTableInfo,
      autoWidth: false,
      // select:  option.isRowSelection===undefined ? true:option.isRowSelection,
      order: [],
      buttons: buttons,
      pageLength: pageLength,
      language: {
        paginate: {
          next: '<i class="fa fa-angle-right" aria-hidden="true"></i>',
          previous: '<i class="fa fa-angle-left" aria-hidden="true"></i>'
        }
      }
      // initComplete: function () {
      //     this.api().columns([3]).every( function () {
      //         const column = this;
      //         console.log(column);
      //         // if(column[0]===3){
      //         const select = $('<select><option value=''>Select</option></select>')
      //             .appendTo( $(column.footer()).empty() )
      //             .on( 'change', function () {
      //                 const val = $.fn.dataTable.util.escapeRegex(
      //                     $(this).val()
      //                 );
      //
      //                 column
      //                     .search( val ? '^'+val+'$' : '', true, false )
      //                     .draw();
      //             } );
      //
      //         column.data().unique().sort().each( function ( d, j ) {
      //             select.append( '<option value="'+d+'">'+d+'</option>' )
      //         } );
      //       // }
      //     } );
      // }
    });

    // Insert the Row value from Data
    this.dataDraw();

    let addRowButton = '';
    addRowButton += '<div class="temp-btn">';
    addRowButton += '<button type="button" value="cancel" class="btn-default btn-cancel" >CANCEL</button>';
    addRowButton += '<button type="submit" value="Reset" class="btn-default btn-save">SAVE</button>';
    addRowButton += '</div>';

    // Adding New Row
    if (option.isAddRow) {
      $('#addRow').on('click', () => {
        $('#addRow').prop('disabled', true);
        const tabAdd = table.find('tbody tr:eq(0)').clone();
        // const tabAdd = table.find('thead tr:eq(0)').clone();
        table.find('tbody').prepend(tabAdd);
        table.find('tbody tr').eq(0).addClass('newRow');

        const maparrr = _.map(headers, 'data');
        tabAdd.find('td').each((i, n) => {
          let hi = i;
          hi = tabAdd.find('td').length === headers.length ? hi : hi + 1;
          const maxTxt = headers[hi].maxLength !== undefined ? headers[hi].maxLength : '524288';
          const minTxt = headers[hi].minLength !== undefined ? headers[hi].minLength : '0';
          if (headers[i]['isCheckbox']) {
            $(this).html('');
          } else if (headers[i]['fieldType'] === 'select') {
            const opt = [];
            opt.push('<option value="">--select--</option>');
            headers[i]['fieldValues'].forEach((v, l) => {
              opt.push('<option value="' + v.value + '">' + v.text + '</option>');
            });
            $(this).html('<div class="form-group"><select id="' + maparrr[i] + '" class="form-fields">' + opt + '</select></div>');
          } else {
            const typ = headers[hi].fieldType === undefined ? 'text' : headers[hi].fieldType;
            let upc = headers[hi].fieldUppercase === undefined ? '' : headers[hi].fieldUppercase;
            $(this).html('<div class="form-group"><input type="' + typ + '" maxlength="' + maxTxt +
              '" minlength="' + minTxt + '" id="' + maparrr[i] + '" class="form-fields"/></div>');
            upc = upc ? $(this).find('input').addClass('text-uppercase') : '';
          }
          if (i === ($(this).parent().children().length - 1)) {
            $(this).append(addRowButton).find('.btn-save').removeClass('btn-save').addClass('btn-save-newrow');
            $(this).find('.btn-cancel').removeClass('btn-cancel').addClass('btn-cancel-newrow');
          }
        });

      });
    }

    $('#loadagain').on('change', () => {
      comThis.dataDraw();
    });

    $('#submitnext').on('click', () => {

      const arr_names = [];
      let arrayPartner = {};
      let j = 0;
      $.each(table.find('tbody tr'), () => {

        let parytnerfield = '';
        let Metric;
        let F7Schema = '';
        let RawKey;
        let LookupKey = '';
        $(this).find('td').each((i, n) => {

          let title = $(this).text();
          if (i === 0) {
            title = $(this).text();
            parytnerfield = title;
            // console.log(i,'======',parytnerfield)
          } else {
            if (i === 1) {
              const checkedst = $(this).find('input').prop('checked') ? 'true' : 'false';
              Metric = checkedst;
            } else if (i === 2) {
              title = $(this).find('select').val();
              F7Schema = title;
            } else if (i === 3) {
              const checkedst = $(this).find('input').prop('checked') ? 'true' : 'false';
              RawKey = checkedst;
            } else if (i === 4) {
              title = $(this).find('select').val();
              LookupKey = title;
            }
          }

          arrayPartner = {
            'Partner Field': parytnerfield,
            isMetric: Metric,
            'F7 Schema': F7Schema,
            isRawKey: RawKey,
            'Lookup Key': LookupKey
          };
        });

        arr_names[j] = arrayPartner;
        j++;

      });
      arrayPartner['partner'] = arr_names;
    });

    function ActiveCoumn() {
      // Create column search element
      // console.log('activeColumn');
      const tableSearch = table.find('thead tr:eq(0)').html();
      table.find('thead').after('<tfoot><tr>' + tableSearch + '</tr></tfoot>');
      table.find('tfoot th').each(i => {
        const title = $(this).text();
        if (headers[i]['isCheckbox']) {
          $(this).html('');
        } else {
          $(this).html('<input type="text" placeholder="Search ' + title + '" />');
        }
      });

      // Apply the search
      comThis.tableWidget[comThis.tableId - 1].columns().every(() => {
        const that = this;
        table.find('tfoot input').on('keyup change', () => {
          if (that.search() !== this.value) {
            // comThis.tableWidget.search( this.value ).draw();
            // const val = typeof this.value === 'string' ? this.value.toLowerCase() : this.value;
            comThis.tableWidget[comThis.tableId - 1].column($(this).parent().index()).search(this.value, false, false, true).draw();
          }
        });
      });
    }

    // Column search display
    $('.dt-buttons').on('click', '.fa-Ifilter', () => {
      // table.find('tfoot').slideToggle();
      if (comThis.data.result.length <= 0) {
        comThis.toastr.warning('No Data');
        return false;
      }
      if (!table.find('tfoot').hasClass('active')) {
        ActiveCoumn();
        table.find('tfoot').addClass('active');
      } else {
        // table.find('tfoot').removeClass('active');
        table.find('tfoot').remove();
        comThis.tableWidget[comThis.tableId].search('').draw();
      }
    });

    $('.buttons-collection.buttons-colvis').on('click', '.fa-Ivisible', () => {
      table.find('tfoot').remove();
    });

    // On change Functionality
    table.on('change', '.switch input', e => {
      if ($(this).prop('checked')) {
        $(this).next('.slider').removeClass('in-active').addClass('a-tive');
      } else {
        $(this).next('.slider').removeClass('a-tive').addClass('in-active');
      }
      comThis.activeInactive(e);
    });

    // table header sorting Action
    table.on('mousedown.edit', 'th', e => {
      $('#addRow').prop('disabled', false);
    });

    // Edit Functions
    const tre = [];
    table.on('mousedown.edit', 'i.fa.fa-pencil', e => {
      $('#addRow').prop('disabled', true);
      $('.newRow').remove();
      $(this).parents('.dataTableWrapper').removeClass('active');
      $('.data-right-panel').removeClass('active');
      const $row = $(this).closest('tr').off('mousedown');
      $($row).addClass('editRow');
      $($row).find('td').eq(0).find('input').prop('checked', false);
      tre.push($(this).parents('tr').index());
      if (tre.length > 1) {
        const revert = $(this).parents('tbody').find('tr').eq(tre[0]);
        $(revert).removeClass('editRow');
        const $tds = revert.find('td').not(':first');
        $.each($tds, (i, el) => {
          const txt = $(this).find('input,select')['0'].attributes['data-index'].nodeValue;
          $(this).html(txt);
          if (headers[i + 1].editButton) {
            $(this).html(txt).append('<i class=\'fa fa-pencil\' aria-hidden=\'true\'></i>');
          }
        });
        tre.shift();
      }
      const $tds2 = headers[0].isCheckbox ? $row.find('td').not(':first') : $row.find('td');
      $.each($tds2, (i, el) => {
        const txt = $(this).text();
        let hi = i;
        hi = $tds2.length === headers.length ? hi : hi + 1;
        const maxTxt = headers[hi].maxLength !== undefined ? headers[hi].maxLength : '524288';
        const minTxt = headers[hi].minLength !== undefined ? headers[hi].minLength : '0';
        if (headers[hi].fieldType === 'select') {
          const opt = [];
          opt.push('<option value="">--select--</option>');
          headers[hi]['fieldValues'].forEach((v, l) => {
            const selected = txt === v.text ? 'selected' : '';
            opt.push('<option value="' + v.value + '" ' + selected + ' >' + v.text + '</option>');
          });
          $(this).html('').append('<div class="form-group"><select id="' + hKey[i + 1] +
            '" data-index="' + txt + '" value="' + txt + '" class="form-fields ng-invalid">' + opt +
            '</select><div  class="valid-msg" > Required Field </div></div>');
        } else {
          const typ = headers[hi].fieldType === undefined ? 'text' : headers[hi].fieldType;
          let upc = headers[hi].fieldUppercase === undefined ? '' : headers[hi].fieldUppercase;
          $(this).html('').append('<div class="form-group"><input type="' + typ + '" maxlength="' + maxTxt +
            '" minlength="' + minTxt + '"  id="' + hKey[i + 1] + '" data-index="' + txt + '" value="' + txt +
            '" class="form-fields ng-invalid"><div  class="valid-msg" > Required Field </div></div>');
          upc = upc ? $(this).find('input').addClass('text-uppercase') : '';
        }
        if (i === ($tds2.length - 1)) {
          $(this).append(addRowButton);
        }
      });

    });

    // Cancel on Edit Action
    table.on('mousedown.cancel', 'button.btn-default.btn-cancel', e => {
      $('#addRow').prop('disabled', false);
      $(this).removeClass().addClass('fa fa-pencil');
      const $row = $(this).closest('tr');
      $($row).removeClass('editRow');
      const $tds = $row.find('td').not(':first');
      $.each($tds, (i, el) => {
        const txt = $(this).find('input,select')['0'].attributes['data-index'].nodeValue;
        $(this).html(txt);
        if (headers[i + 1].editButton) {
          $(this).html(txt).append('<i class=\'fa fa-pencil\' aria-hidden=\'true\'></i>');
        }
      });
      tre.shift();
    });

    // Save the Edit Row
    table.on('mousedown.save', 'button.btn-default.btn-save', e => {
      const $row = $(this).closest('tr');
      const $tds = $row.find('td');
      const ps = {};
      _.forEach(headers, (v, i) => {
        let txt = '', oldtxt = '';
        $.each($tds, (j, el) => {
          txt = $(this).find('input,select').val();
          oldtxt = $(this).find('input,select').attr('data-index');
          if ($(this).find('input,select').attr('id') === v.data) {
            ps[v.data] = txt;
          }
        });
      });
      if (_.size(ps) > 1) {
        $('#addRow').prop('disabled', false);
        const k = [];
        $.each($tds, (i, el) => {
          const inp = $(this).find('input,select').val();
          if (inp === '') {
            $(this).find('input').addClass('ng-touched ng-invalid').removeClass('ng-valid ng-dirty');
            k.push(false);
          } else {
            $(this).find('input').removeClass('ng-invalid').addClass('ng-valid ng-dirty');
            k.push(true);
          }
        });
        if (!_.includes(k, false)) {
          comThis.editRow(ps);
          $($row).removeClass('editRow');
        }
      } else {
        comThis.toastr.error('ERROR!', 'Nothing to changed');
      }
    });

    // Save the New Row
    table.on('mousedown.save', 'button.btn-default.btn-save-newrow', e => {
      const $row = $(this).closest('tr');
      const $tds = $row.find('td');
      const ps = {};
      _.forEach(headers, (v, i) => {
        let txt = '', oldtxt = '';
        $.each($tds, (j, el) => {
          txt = $(this).find('input,select').val();
          oldtxt = $(this).find('input,select').attr('data-index');
          if ($(this).find('input,select').attr('id') === v.data) {
            ps[v.data] = txt;
          }
        });
      });
      if (_.size(ps) > 1) {
        $('#addRow').prop('disabled', false);
        const k = [];
        const $tds2 = headers[0].isCheckbox ? $row.find('td').not(':first') : $row.find('td');
        $.each($tds2, (i, el) => {
          const inp = $(this).find('input,select').val();
          if (inp === '' || inp === undefined) {
            $(this).find('input,select').addClass('form-fields ng-pristine ng-invalid ng-touched').removeClass('ng-valid ng-dirty');
            k.push(false);
          } else {
            $(this).find('input,select').removeClass('ng-invalid').addClass('ng-valid ng-dirty');
            k.push(true);
          }
        });
        if (!_.includes(k, false)) {
          comThis.addRow(ps);
        }
      } else {
        comThis.toastr.error('ERROR!', 'Nothing to changed');
      }
    });

    // Select Single Row to be Deleted
    let arrayPush = [];
    table.on('change', 'tr td:first-of-type input', () => {
      $('#removeBtn').removeClass('disabled');
      if (!$(this).prop('checked')) {
        const itemToRemove = $(this).val();
        arrayPush = _.remove(arrayPush, v => v.id !== itemToRemove);
        table.find('tr th:first-of-type input').prop('checked', false);
      } else {
        arrayPush.push(_.filter(comThis.data.result, ['id', $(this).val()])[0]);
      }
      comThis.removeData(arrayPush);
    });

    // Select ALL
    table.on('change', 'tr th:first-of-type input', () => {
      $('#removeBtn').removeClass('disabled');
      if (!$(this).prop('checked')) {
        $.each(table.find('tbody tr'), () => {
          $(this).find('td:eq(0) input').prop('checked', false);
          const itemToRemove = $(this).find('td:eq(0) input').val();
          arrayPush = _.remove(arrayPush, v => v.id !== itemToRemove);
        });
      } else {
        $.each(table.find('tbody tr'), () => {
          $(this).find('td:eq(0) input').prop('checked', true);
          const val = $(this).find('td:eq(0) input').val();
          arrayPush.push(_.filter(comThis.data.result, ['id', val])[0]);
        });
      }
      comThis.removeData(arrayPush);
    });

    // Remove New Row
    table.on('click', '.btn-cancel-newrow', () => {
      $('#addRow').prop('disabled', false);
      $(this).parents('.newRow').remove();
    });

    // Selecting Row Details
    if (option.isRowSelection) {
      table.find('tbody').on('click', headers[0].isCheckbox ? 'td:not(:first)' : 'td', () => {
        if ($(this).parent('tr').hasClass('selected') || $(this).parent('tr').hasClass('editRow') ||
          $(this).parent('tr').hasClass('newRow')) {
          $(this).parent('tr').removeClass('selected');
          $(this).parents('.dataTableWrapper').removeClass('active');
          $('.data-right-panel').removeClass('active');
          // comThis.selectRowData([]);
        } else {
          table.find('tr.selected').removeClass('selected');
          $(this).parent('tr').addClass('selected');
          $(this).parents('.dataTableWrapper').addClass('active');
          $('.data-right-panel').addClass('active');
          const rowId = $(this).parent('tr').find('td').eq(0).find('input').val();
          const filterRowData = _.filter(comThis.data.result, v => v.id === rowId);
          comThis.selectRowData(filterRowData);
        }
      });
    }

    this.tableId = this.tableId + 1;
  }

  activeInactive(ev) {
    const inputChange = { id: ev.target.value, status: ev.target.checked, functionRef: 'onchange' };
    this.filterValues.emit(inputChange);
  }

  dataDraw() {
    if (this.data) {
      // console.log(this.data,'real')
      const comThis = this;
      for (let i = 0; i < comThis.tableWidget.length; i++) {
        this.tableWidget[i].clear();
        this.data.result.forEach((data, index) => {
          comThis.tableWidget[i].row.add(data);
        }, this);
        this.tableWidget[i].draw();
      }
    }
  }

  editRow(v) {
    const inputChange = { edit: v, functionRef: 'editRow' };
    this.filterValues.emit(inputChange);
  }

  removeData(ar) {
    const inputChange = { remove: ar, functionRef: 'removeRow' };
    this.filterValues.emit(inputChange);
  }

  addRow(v) {
    const inputChange = { add: v, functionRef: 'addRow' };
    this.filterValues.emit(inputChange);
  }

  selectRowData(v) {
    const inputChange = { select: v, functionRef: 'selectRow' };
    this.filterValues.emit(inputChange);
  }

}
