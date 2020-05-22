
export default class DataTableUtilsPluginExt {

  constructor(
    ) {
  }


  static fixedColumnFunc(ev, $, table){
    let dc = $('div.DTFC_LeftWrapper')
    if(table.search() === ""){
      // If div.DTFC_LeftWrapper is present & NotHidden, then show
      if(dc && dc.is(":hidden")){
        dc.show();
      }
      return false;
    }
    else if(table.search() !== "") {
      // If DTFC_Cloned and Shown, then, hide
      if(dc && dc.is(":visible")) {
        dc.hide()
      }
    }
    return false;
  }



}
