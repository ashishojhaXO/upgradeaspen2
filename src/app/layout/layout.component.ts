import { Component, DoCheck, OnInit, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { McBreadcrumbsConfig } from 'ngx-breadcrumbs';
declare var $: any;
declare var jquery: any;
import 'datatables.net';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html'
})
export class LayoutComponent implements DoCheck, OnInit {

  activeSidebar: boolean;
  hasSubMenu: boolean;
  metaData =  '';
  routeUrl = '';
  constructor(public router: Router, private route: ActivatedRoute, private breadcrumbsConfig: McBreadcrumbsConfig, private _elementRef : ElementRef) {
    router.events.subscribe((event) => { 
      if (event instanceof NavigationEnd ) {
        this.routeUrl = event.url;
       }       
      this._applyTheme(this.metaData);
      this._applyThemeOnReady(this.metaData);
  });
  const custInfo =  JSON.parse(localStorage.getItem('customerInfo') || '');
    if((custInfo.org.meta_data).length){
     this.metaData = JSON.parse(custInfo.org.meta_data.replace(/'/g, '"'));
    }
    this._applyAyncTheme(this.metaData);
  }

  routeActive: any = true;

  ngDoCheck() {
    this.routeActive = this.router.url === '/';
    setTimeout(() => {
      $('.multiselect-dropdown').attr('tabindex', '0');
    }, 500);
  }

  ngOnInit() {
    this._addFeedbackWidget();
    this._applyTheme(this.metaData);
    //this._applyAyncTheme(this.metaData);
    this._applyThemeOnReady(this.metaData);
  }

  _hasSubMenus(e) {
    this.hasSubMenu = e.hasSubMenu;
  }
_addFeedbackWidget(){  
  const script = document.createElement('script');
  script.src ='https://fusionseven.atlassian.net/s/d41d8cd98f00b204e9800998ecf8427e-T/8ur02a/b/23/a44af77267a987a660377e5c46e0fb64/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector.js?locale=en-US&collectorId=9982618a';
      document.body.appendChild(script);     
  }
  _applyTheme(paramData){   
      //Top Header Menu
      if(paramData && paramData['themeColor']){
        let themeColor = paramData['themeColor'];
        let themeTxtColor = paramData['themeTxtColor'];
          $(".header").css({background: themeColor});     
          $(".org-dropdown > select").css('cssText','border: 1px solid; background-color: transparent; background-image: linear-gradient(38deg, transparent 50%, '+themeColor+' 50%), linear-gradient(135deg, '+themeColor+' 50%, transparent 50%), linear-gradient(to right, '+ themeTxtColor +', '+ themeTxtColor +') !important');  
          $(".nav.navbar-nav.main-menu a").css('cssText','color:'+themeTxtColor+' !important'); 
          $(".welcome-user-text-wrap").css({color: themeTxtColor});     
          $(".nav.navbar-nav.main-menu .active a").css('cssText','color:'+themeTxtColor+' !important; border-color:'+themeTxtColor+' !important');     
      }
      //Sub Header Menu
      if(paramData && paramData['subMenuColor']){
        let subMenuColor = paramData['subMenuColor'];
        let subMenuTxtColor = paramData['subMenuTxtColor'];
          $(".bottom-menu").css({background: subMenuColor});
          $(".bottom-menu a").css('cssText','color:'+subMenuTxtColor+' !important')
          $(".bottom-menu a.active").css('cssText','color: '+subMenuTxtColor+' !important;border-bottom-color:'+subMenuTxtColor+' !important')
      }
      //Button Primary
      if(paramData && paramData['primaryBtnColor']){
        let primaryBtnColor = paramData['primaryBtnColor'];
        let primaryBtnTxtColor = paramData['primaryBtnTxtColor'];
          $(".btn-primary").css('cssText','color:'+primaryBtnTxtColor+'; background-color:'+primaryBtnColor+'; border-color:'+primaryBtnColor);
          $(".sidebar-form-control > button").css('cssText','color:'+primaryBtnTxtColor+'; background-color:'+primaryBtnColor+'; border-color:'+primaryBtnColor);
          if(this.routeUrl!="/login"){  
          $("#atlwdg-trigger").css('cssText','display:block; color:'+primaryBtnTxtColor+' !important; background: '+primaryBtnColor+'; border: 1px solid ' + primaryBtnColor);
          }else{
            $("#atlwdg-trigger").remove();
            $("#atlwdg-trigger").css('cssText','display:none');
          }
          //Dropzone Border(Admin->Uploads)
          $(".dropzone").css('cssText','border-color:'+primaryBtnColor);          
          //Title Color
          $(".page-title").css('cssText','color:'+primaryBtnColor);
          $(".dashboardTitle").css('cssText','color:'+primaryBtnColor);          
          //Modal Header
          $(".modal-header").css('cssText','color:'+primaryBtnTxtColor+'; background:'+primaryBtnColor);
        }
      //Button Secondary 
      if(paramData && paramData['secondaryBtnColor']){
        let secondaryBtnColor = paramData['secondaryBtnColor'];
        let secondaryBtnTxtColor = paramData['secondaryBtnTxtColor'];
        $(".btn-secondary").css('cssText','color:'+secondaryBtnTxtColor+'; background-color:'+secondaryBtnColor+'; border-color:'+secondaryBtnColor);
      }
      //Dashboard
      if(paramData && paramData['filterColor']){
        let filterColor = paramData['filterColor'];
        let filterTxtColor = paramData['filterTxtColor'];
          $(".sidebar-form-control .title,.sidebar-title h3").css('cssText','color:'+filterTxtColor);
          //$(".sidebar-form-control .sidebar-container label.active").css('cssText','background-color:yellow;color:red');
          $(".sidebar").css('cssText','background:'+filterColor+'; border-color:'+filterTxtColor);
          $(".sidebar-toggle").css('cssText','background-color:'+filterColor+'; border-color:'+filterTxtColor);
          $(".sidebar-toggle .fa-caret-left").css('cssText','color:'+filterTxtColor);
          $(".sidebar-sub-title").css('cssText','color:'+filterTxtColor);
          $(".sidebar-title").css('cssText','color:'+filterTxtColor);
      } 
  }
  _applyThemeOnReady(paramData){
    var self = this;
    $(document).ready(function(){
      self._applyTheme(paramData);
    });
  }
  _applyAyncTheme(paramData){       
    var check = setInterval(function(){ 
      if($("#atlwdg-trigger").length > 0){        
        if(paramData && paramData['primaryBtnColor']){
          let primaryBtnColor = paramData['primaryBtnColor'];
          let primaryBtnTxtColor = paramData['primaryBtnTxtColor'];
           $("#atlwdg-trigger").css('cssText','display:block; color:'+primaryBtnTxtColor+' !important; background: '+primaryBtnColor+'; border: 1px solid ' + primaryBtnColor);
         }         
        clearInterval(check);
        }
      } ,200);
   }
}