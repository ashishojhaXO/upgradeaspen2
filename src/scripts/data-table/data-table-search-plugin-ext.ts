// JS
// export default class 
// var DataTableSearchPluginExt = ( function ($) {

//   console.log("=====SEARCH WHATTT========", $, )

//   $(document).ready(function() {

//     console.log("=====SEARCH 222 WHATTT========", $, );

//     $('#example thead th')
//     .each( function () {
//       console.log("DODODO");
//             var title = $("#example thead th").text();
//             // $("#example thead th").html( '<input type="text" placeholder="Search '+title+'" />' );
//             $("#example thead th").append( '<input type="text" placeholder="Search '+title+'" />' );
    
//     } );

//   } );

//   // $(document).ready(function() {
//   //     // Setup - add a text input to each footer cell
//   //     $('#example tfoot th').each( function () {
//   //         var title = $(this).text();
//   //         $(this).html( '<input type="text" placeholder="Search '+title+'" />' );
//   //     } );
  
//   //     // DataTable
//   //     var table = $('#example').DataTable();
  
//   //     // Apply the search
//   //     table.columns().every( function () {
//   //         var that = this;
  
//   //         $( 'input', this.footer() ).on( 'keyup change clear', function () {
//   //             if ( that.search() !== this.value ) {
//   //                 that
//   //                     .search( this.value )
//   //                     .draw();
//   //             }
//   //         } );
//   //     } );

//   // } );

// })($)

export default class DataTableColumnSearchPluginExt {

  constructor($, document, table) {

    // this.attachSearchIcon($)
    // this.attachElemsToColumnHeader($, document);
    this.attachClickInputSearch($)
    // this.attachClickToSearch($)
    this.attachSearchToInput($, table);
  }

  searchIcon($){
    // If default way not available to attach icon in DataTables table headers, 
    // then, we attach here
    let icon = '<i class="fa fa-search" aria-hidden="true"></i>';
    return icon;
  }

  searchInputElem(title) {
    let searchInputElem = '<input type="text" class="col-search-input" placeholder="Search '+title+'" />' 
    return searchInputElem;
  }

  getAllElems($: JQueryStatic, title :string ) {
    return "<div class='random'>" + this.searchIcon($) + "&nbsp;" + this.searchInputElem(title) + "</div>";
  }

  attachClickInputSearch($) {
    $(document)
    .ready( function(){
      $(".col-search").click( function(e) {
        e.stopPropagation();
        let dd = $(this);
        console.log("-----e THIS: ", e, this , " dd: ", dd); 
        dd.siblings("input").toggleClass("display-none");
        // $(this).parent("th")
      })
    })

  }

  attachElemsToColumnHeader($, document) {
    console.log("DOC: ", document)

    $(document)
    .ready( function(){

      $('#example thead th')
      .each( function () {
        console.log("DODODO");
        // var title = $("#example thead th").text();
        var title = $(this).text();
        // $("#example thead th").html( '<input type="text" placeholder="Search '+title+'" />' );
        // $("#example thead th").append( '<input type="text" placeholder="Search '+title+'" />' );
        $(this).append( 
          this.getAllElems($, title)
        );
      
      } );

    })

  }

  // attachClickToSearch($) {

  //   let d = $(".col-search")
  //   d.click( function (e, n) { 
  //     if ( e.target !== this ) {
  //       console.log("IF THIS");
  //       return;
  //     }
  //     let dd = $(this);
  //     console.log("THIS: ", this , " dd: ", dd); 
  //     dd.siblings("input").toggle();

  //   } )

  // }

  attachSearchToInput($, table) {
      // DataTable
      var table = $('#example').DataTable();

      $(document).ready( function() {
  
            console.log("doctabCOL");
        // Apply the search
        table.columns().every( function () {

            var that = this;
            console.log("---tabCOL this:", this);
    
            // $( 'input', this.footer() )
            $( 'input', this.header() )
            // $( '.col-search-input' )
            .on( 'keyup change clear', function () {
              
              console.log("INPPPPP");

                if ( that.search() !== this.value ) {
                    that
                        .search( this.value )
                        .draw();
                }
            } );

        } );


      })

  }

}