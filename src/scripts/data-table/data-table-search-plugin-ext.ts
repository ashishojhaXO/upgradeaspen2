
export default class DataTableColumnSearchPluginExt {

  constructor($, document, table) {

    // this.attachSearchIcon($)
    this.attachElemsToColumnHeader($, document);
    this.attachClickInputSearch($)
    // this.attachClickToSearch($)
    this.attachSearchToInput($, table);
  }

  searchIcon($){
    // If default way not available to attach icon in DataTables table headers, 
    // then, we attach here
    let icon = '<i class="fa fa-search col-search" (click)="colSearch" aria-hidden="true"></i>';
    // '<i class="fa fa-search" aria-hidden="true"></i>';
    return icon;
  }

  searchInputElem(title) {
    let searchInputElem = '<input type="text" class="input-sm col-search-input display-none display-block" placeholder="Search '+title+'" />' 
    // '<input type="text" class="col-search-input" placeholder="Search '+title+'" />' 
    return searchInputElem;
  }

  getAllElems($: JQueryStatic, title: string ) {
    return "&nbsp;" + this.searchIcon($) + "&nbsp;" + this.searchInputElem(title);
  }

  attachClickInputSearch($) {
    $(document)
    .ready( function(){
      $(".col-search").click( function(e) {
        e.stopPropagation();
        let dd = $(this);
        dd.siblings("input").toggleClass("display-none");
        // $(this).parent("th")
      })
    })

  }

  attachElemsToColumnHeader($, document) {

    let self = this;

    $(document)
    .ready( function(){
      // $('#example thead th')
      // $('table:first thead th')
      $('table:first thead th.sorting, .sorting_asc, .sorting_desc')
      .each( function () {
        // var title = $("#example thead th").text();
        var title = $(this).text();
        // $("#example thead th").html( '<input type="text" placeholder="Search '+title+'" />' );
        // $("#example thead th").append( '<input type="text" placeholder="Search '+title+'" />' );
        $(this).append( 
          self.getAllElems($, title)
        );
      
      } );

    })

  }

  docReady($, table) {
          console.log("docREDD tab: ", $, table)
          // var tab = table;

    // DataTable
    var table = $('#example').DataTable();
    let currentPage = table.page.info().page;

    return function() {
      // Apply the search
      // table
      table
      .columns().every( function () {
        var that = this;
        // $( 'input', this.footer() )
        // $( 'input.input-sm', this.header() )
        $( '.col-search-input', this.header() )
        .on( 'click keyup change clear', function (e) {
          console.log("STTOOO tab: ", 
            table, 
            currentPage, 
            table.page.info().page, 
            this.value
          )
          e.stopPropagation();
          // if ( that.search() !== this.value ) {
          if ( 
            that.search() !== this.value || 
            currentPage != table.page.info().page || 
            this.value.trim() != "" 
          ) {
            console.log("INIF",
              that.search(), 
              table,
              currentPage,
              table.page.info().page,
              this.value
            );

            that
            .search( this.value )
            .page(currentPage)
            .draw(false);
          }
        });

      }
      );

    }
  }

  attachSearchToInput($, table) {
    // DataTable
    // var table = $('#example').DataTable();

    var tab = table;
          console.log("ATTTT: ", table);

    $(document).ready( this.docReady($, table))

  }

}