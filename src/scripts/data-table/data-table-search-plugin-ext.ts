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

    this.attachSearchInputToColumn($, document);
    this.attachSearchToInput($, table);
  }

  attachSearchInputToColumn($, document) {
    console.log("DOC: ", document)

    $(document)
    .ready( function(){

      $('#example thead th')
      .each( function () {
        console.log("DODODO");
        var title = $("#example thead th").text();
        // $("#example thead th").html( '<input type="text" placeholder="Search '+title+'" />' );
        $("#example thead th").append( '<input type="text" placeholder="Search '+title+'" />' );
      
      } );

    })

  }

  attachSearchToInput($, table) {
      // DataTable
      // var table = $('#example').DataTable();
  
      // Apply the search
      table.columns().every( function () {
          var that = this;
  
          $( 'input', this.footer() ).on( 'keyup change clear', function () {
              if ( that.search() !== this.value ) {
                  that
                      .search( this.value )
                      .draw();
              }
          } );
      } );

  }

}