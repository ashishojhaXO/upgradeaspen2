// JS
// export default class 
var DataTablePluginExt = ( function (jQuery) {
//   console.log("jQuery: ", jQuery);

  // Writing Plug-in Extension here
  jQuery.extend( jQuery.fn.dataTableExt.oSort, {
    "name-string-not-nullund-asc": function ( a, b ) {
      // return ((a < b) ? -1 : ((a > b) ? 1 : 0));
      // return ((a < b && a != null || a != undefined) ? -1 : ((a > b && a != null || a != undefined) ? 1 : 0));
      if(a<b)
        return -1;
      else if(a>b)
        return 1;
      else if (a == null || a == undefined || a == "") {
        return 1;
      }
      else if (b == null || b == undefined || b == ""){
        return -1;
      }
      else
        return 0
    },
 
    "name-string-not-nullund-desc": function ( a, b ) {
      // return ((a < b) ? 1 : ((a > b) ? -1 : 0));
      // return ((a < b && a != null || a != undefined) ? 1 : ((a > b && a != null || a != undefined) ? -1 : 0)  );
      if(a<b)
        return 1;
      else if(a>b)
        return -1;
      else if (a == null || a == undefined || a == "") {
        return 1;
      }
      else if (b == null || b == undefined || b == "") {
        return 1;
      }
      else
        return 0
    }

  });

  //-

  return jQuery;
})(jQuery)

