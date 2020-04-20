
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

  attachSearchToInput($, table) {
    // DataTable
    var table = $('#example').DataTable();
          console.log("ATTTT: ", table);

    $(document).ready( function() {
      // Apply the search
      table.columns().every( function () {
        var that = this;
        // $( 'input', this.footer() )
        $( 'input.input-sm', this.header() )
        // $( '.col-search-input' )
        .on( 'click keyup change clear', function (e) {
          console.log("STTOOO")
          e.stopPropagation();
          if ( that.search() !== this.value ) {
            that
            .search( this.value )
            .draw();
          }
        });

      });

    })

  }

}