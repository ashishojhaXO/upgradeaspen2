import { OnInit } from "@angular/core";

export default class DataTableUtilsPluginExt implements OnInit {

  ev: any;
  do: any;
  table: any;

  constructor(ev?, $?, table?) {

    this.ev = ev;
    this.do = $
    this.table = table;
  }



  ngOnInit() {
  }

  run() {
    this.fixedColumnFunc(this.ev, this.do, this.table)
  }

  toggleSticky() {
    let dc = $('div.DTFC_LeftWrapper')
    // If DTFC_Cloned and Shown, then, hide
    if(dc && dc.is(":visible")) {
      dc.hide()
    }
    else if(dc && dc.is(":hidden")){
      dc.show();
    }
  }

  hideSticky() {
    let dc = $('div.DTFC_LeftWrapper')
    // If DTFC_Cloned and Shown, then, hide
    if(dc && dc.is(":visible")) {
      dc.hide()
    }
  }

  showSticky() {
    let dc = $('div.DTFC_LeftWrapper')
    // If div.DTFC_LeftWrapper is present & NotHidden, then show
    if(dc && dc.is(":hidden")){
      dc.show();
    }
    return false;
  }


  fixedColumnFunc(ev, $, table){
    if(table.search() === ""){
      this.showSticky();
    }
    else if(table.search() !== "") {
      this.hideSticky();
    }
    return false;
  }

  onFilterClick() {
    let __this = this;
    let filts = $("div.dataTables_scrollHead table thead").find(".col-search");
    filts.on('click', function(ev) {
      // if this.child $( '.col-search-input') is visible then hide else show
      if($(this).siblings(".col-search-input").is(":hidden")) {
        __this.showSticky();
      } 
      else if($(this).siblings(".col-search-input").is(":visible")) {
        __this.hideSticky();
      } 

    })
  }

  attachClickInputSearch() {
    let __this = this;
    $(document)
    .ready( function(){
      let filts = $("div.dataTables_scrollHead table thead").find(".col-search");
      filts.click( function(e) {
        // if this.child $( '.col-search-input') is visible then hide else show
        if($(this).siblings(".col-search-input").is(":hidden")) {
          __this.showSticky();
        } 
        else if($(this).siblings(".col-search-input").is(":visible")) {
          __this.hideSticky();
        } 
      })
    })
  }


}
