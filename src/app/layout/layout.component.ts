import { Component, DoCheck, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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

  constructor(public router: Router, private route: ActivatedRoute, private breadcrumbsConfig: McBreadcrumbsConfig) {
    router.events.subscribe((val) => {      
      var atlwdgExists = document.getElementById("atlwdg-trigger");
      if(router.url!="/login"){
        if(atlwdgExists){
          atlwdgExists.style.display = "block";
        }
      }else{
        if(atlwdgExists){
          atlwdgExists.style.display = "none";
        }
      }
      console.log("router.url",router.url) 
  });
  }

  routeActive: any = true;

  ngDoCheck() {
    this.routeActive = this.router.url === '/';
    setTimeout(() => {
      $('.multiselect-dropdown').attr('tabindex', '0');
    }, 500);
  }

  ngOnInit() {

    console.log("LAYYO: ")    
    this._addFeedbackWidget();
  }

  _hasSubMenus(e) {
    this.hasSubMenu = e.hasSubMenu;
  }
_addFeedbackWidget(){  
  const script = document.createElement('script');
  script.src ='https://fusionseven.atlassian.net/s/d41d8cd98f00b204e9800998ecf8427e-T/8ur02a/b/23/a44af77267a987a660377e5c46e0fb64/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector.js?locale=en-US&collectorId=9982618a';
      document.body.appendChild(script);
  }
}
