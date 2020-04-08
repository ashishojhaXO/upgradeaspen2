// import { Injectable } from '@angular/core';
// import { BaseService } from '.';
// import { Http, Headers, RequestOptions } from '@angular/http';
// import { Router } from '@angular/router';
// import { ToastsManager } from 'ng2-toastr/ng2-toastr';

// // import { dataTableExt } from 'datatables.net';

// interface MyPlugin {
//     settings: MyPluginSettings;
    
//     (behavior: 'enable'): JQuery;
//     (settings?: MyPluginSettings): JQuery;
// }

// interface MyPluginSettings {
//     title?: string;
// }

// interface JQuery {
//     myPlugin: MyPlugin;
// }

// export class DataTablePluginExt {

//   base: any;
//   authService: any;
//   constructor() {


//     this.initAll()
//   }

//   initAll() {

//     $.fn.DataTable


//     console.log( "initAll $: ", $, " $.fn: ", $.fn, 
//       " $.fn.DataTable: ", $.fn.DataTable , 
//       " $.fn.DataTable(): ", $.fn.DataTable() , 
//       " jQuery.fn: ", jQuery.fn ,
//       $.fn,

//       // " $.fn.dataTable: ", $.fn.dataTable 
//     )

//     this.runAll()
//   }

//   nullUndType() {
//     // NullUndefine Type

//   }

//   typesExtended(){

//     // jquery.fn.datatableext.atypes.unshift( function ( sdata )
//     // {

//     // });

//   }

//   functionsExtended(){

//     // jQuery.extend( jQuery.fn.dataTableExt.oSort, {
//     //   "blah": function(a) {
//     //     console.log("Blah matching here")
//     //   }
//     // });

//   }

//   runAll() {
//     this.typesExtended()
//     this.functionsExtended()
//   }


// }






// JS
// export default class 
var DataTablePluginExt = ( function (jQuery) {

  // Writing Plug-in Extension here
  jQuery.extend( jQuery.fn.dataTableExt.oSort, {
    "name-string-not-nullund-asc": function ( a, b ) {
      console.log("-----ASC name-string-not-nullund-asc: ", a, b)
      // return ((a < b) ? -1 : ((a > b) ? 1 : 0));
      // return ((a < b && a != null || a != undefined) ? -1 : ((a > b && a != null || a != undefined) ? 1 : 0));
      if(a<b)
        return -1;
      else if(a>b)
        return 1;
      else if (a == null || a == undefined || a == "") {
        console.log("NULL A, a: ", a, " b: ", b)
        return 1;
      }
      else if (b == null || b == undefined || b == ""){
        console.log("NULL B, a: ", a, " b: ", b)
        return -1;
      }
      else
        return 0
    },
 
    "name-string-not-nullund-desc": function ( a, b ) {
      console.log("-----DESC name-string-not-nullund-desc: ", a, b)
      // return ((a < b) ? 1 : ((a > b) ? -1 : 0));
      // return ((a < b && a != null || a != undefined) ? 1 : ((a > b && a != null || a != undefined) ? -1 : 0)  );
      if(a<b)
        return 1;
      else if(a>b)
        return -1;
      else if (a == null || a == undefined || a == "") {
        console.log("NULL A, a: ", a, " b: ", b)
        return 1;
      }
      else if (b == null || b == undefined || b == "") {
        console.log("NULL B, a: ", a, " b: ", b)
        return 1;
      }
      else
        return 0
    }

  });

  //-


  return jQuery;
})(jQuery)

module.exports = DataTablePluginExt;
