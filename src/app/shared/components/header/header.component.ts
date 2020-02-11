import { Component, OnInit, Directive, DoCheck, ViewChild, ChangeDetectorRef, HostListener } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Common } from '../../util/common';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import * as cs from '../../../../localService/cs.json';
import { AuthService, OrganizationService } from '../../../../services';
import * as _ from 'lodash';
import * as OktaSignIn from '@okta/okta-signin-widget/dist/js/okta-sign-in-no-jquery';
import {PopUpModalComponent} from '../pop-up-modal/pop-up-modal.component';
import {FormControl, FormGroup, FormArray, Validators} from '@angular/forms';
import {Http, Headers, RequestOptions} from '@angular/http';
import { AppNavComponent } from '../app-nav/app-nav.component';
// import { OktaAuthService } from '@okta/okta-angular';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [AuthService, OrganizationService]
})
@Directive({
  selector: '[appRouterLinkActive]',
  exportAs: 'routerLinkActive'
})
export class HeaderComponentDirective implements DoCheck, OnInit {

  @ViewChild('popoverButton') private;
  @ViewChild('ResetPassword') modalReset: PopUpModalComponent;
  @ViewChild('navItems') navItems: AppNavComponent;

  loggedInUser: string;
  loggedInOrg: string;
  mainmenu: any;
  urlMatching: string;
  activeParent: boolean;
  subMenu: object;
  selected: any;
  activeUrl: string;
  routeActive: any = false;
  getDoCheckCountry: any = [];
  getRefreshDoCheck: any = false;

  dropDownOrgSettings = {};
  dropDownCountrySettings = {};
  organizations = [];
  countries = [];
  selectedCountry = [];
  selectedOrganization = [];
  organizationList = [];
  localData: any;
  globalURLActive: any = ['/', '/parameter-list', '/organizationList', '/featureList', '/globaladminusers'];
  popoverOpen = false;
  clearPreselectedMenuItem: boolean;
  widget: any;
  error: any;
  api_fs: any;
  externalAuth: any;

  isMenuOpened: boolean;
  resetForm: FormGroup;
  resetModel: any;

  constructor(
    // private okta: OktaAuthService,
    private translate: TranslateService,
    public router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private common: Common,
    private auth: AuthService,
    private toastr: ToastsManager,
    private organizationService: OrganizationService,
    private changeDetectorRef: ChangeDetectorRef,
    private http: Http) {

    this.resetForm = new FormGroup({
      old: new FormControl('', Validators.required),
      new: new FormControl('', Validators.required),
      confirm: new FormControl('', Validators.required)
    });

    this.resetModel = {
      old: '',
      new: '',
      confirm: ''
    };
  }

  ngOnInit() {
    this.api_fs = JSON.parse(localStorage.getItem('apis_fs'));
    this.externalAuth = JSON.parse(localStorage.getItem('externalAuth'));

    // this.widget = new OktaSignIn({
    //   baseUrl: this.externalAuth.api
    // });

    this.localData = this.auth.getIdentityInfo('org-context');
    this.loggedInUser = this.auth.getIdentityInfo('loggedInUserName');
    this.loggedInOrg = localStorage.getItem('loggedInOrg');
    this.popoverOpen = false;
    if (!_.isNull(this.loggedInUser) || !_.isUndefined(this.loggedInUser)) {
      // this.getCountries();
      this.getPreferenceMenu();
      this.urlMatching = this.router.url.replace('/', '');

      this.dropDownOrgSettings = {
        singleSelection: true,
        idField: 'Code',
        textField: 'Name',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        itemsShowLimit: 5,
        allowSearchFilter: false,
        closeDropDownOnSelection: true
      };

      this.dropDownCountrySettings = {
        singleSelection: true,
        idField: 'Code',
        textField: 'Code',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        itemsShowLimit: 5,
        allowSearchFilter: false,
        closeDropDownOnSelection: true
      };

    } else {
      this.onLoggedOut('logout');
    }
  }

  ngDoCheck() {
    if (_.includes(this.globalURLActive, this.router.url)) {
      this.routeActive = true;
    } else {
      this.routeActive = false;
    }
    if (!_.isNull(this.localData)) {
      const selectedOrg = JSON.parse(this.localData);
      if (_.size(this.selectedOrganization) > 0) {
        if (!this.getRefreshDoCheck && !_.isNull(selectedOrg['orgChange'])) {
          // this.getOrganization();
          this.getRefreshDoCheck = true;
        }
      }
    }

  }

  myFunction() {
    document.getElementById('myProfileNavbar').classList.toggle('show');
  }

  dropDownToggle() {
    document.getElementById('dropDownToggleList').classList.toggle('show');
  }

  onLoggedOut(v) {
    console.log("onLogOut")
    // if (v === 'logout') {
    //   this.widget.signOut(() => {
    //     this.changeDetectorRef.detectChanges();
    //     window.location.href = '/login';
    //   });
    // }
  }

  changeLang(language: string) {
    this.translate.use(language);
  }

  getPreferenceMenu() {
    this.auth.getPreferenceMenu().subscribe(
      response => {

        const groupArr = [];
        const groups = localStorage.getItem('loggedInUserGroup') || '';

        console.log('groups >>')
        console.log(groups);

        // if (groups) {
        //   const grp = JSON.parse(groups);
        //   grp.forEach(function (item) {
        //     if (item.profile && item.profile.name) {
        //       groupArr.push(item.profile.name);
        //     }
        //   });
        // }

        if (groups) {
          const grp = JSON.parse(groups);
          grp.forEach(function (item) {
            groupArr.push(item);
          });
        }

        let isRoot = false;
        let isAdmin = false;
        let removeMenuItems = true;
        if (groupArr.length) {
          groupArr.forEach(function (grp) {
            if (grp === 'ADMIN' || grp === 'ROOT') {
              if(grp === 'ADMIN') {
                isAdmin = true;
              }
              if (grp === 'ROOT') {
                isRoot = true;
              }
              removeMenuItems = false;
            }
          });
        }

        this.mainmenu = response['admin'];

        if (removeMenuItems) {
          var reducedMenu = this.mainmenu.filter(function (res) {
            return res.id !== 'payments' && res.id !== 'admin' && res.id !== 'reports';
          });
          this.mainmenu = reducedMenu;
        }

        if (isAdmin && !isRoot) {
          const menu = JSON.parse(JSON.stringify(response['admin']));
          this.mainmenu = menu.map(function (m){
            if (m.name === 'admin') {
              m.submenu = m.submenu.filter(function (ele: any) {
                 return ele.name !== 'orgmanagement';
              });
            }
            return m;
          });
        }

        if (window.location.pathname) {
          const urlParts = window.location.pathname.indexOf('/') != -1 ? window.location.pathname.split('/') : window.location.pathname;
          const corr = this.mainmenu.find( x=> x.url === (urlParts[1] + '/' + urlParts[2]));
          if (corr) {
            this.mainmenu[this.mainmenu.indexOf(corr)].selected = true;
            if (this.mainmenu[this.mainmenu.indexOf(corr)].submenu) {
              this.subMenu = this.mainmenu[this.mainmenu.indexOf(corr)].submenu;
              if (urlParts[3]) {
                const corr1 = this.mainmenu[this.mainmenu.indexOf(corr)].submenu.find(x=> x.id === urlParts[3]);
                if (corr1) {
                  this.mainmenu[this.mainmenu.indexOf(corr)].submenu[this.mainmenu[this.mainmenu.indexOf(corr)].submenu.indexOf(corr1)].selected = true;
                }
              }
            }
          }
        }

        // const activeMenu = _.filter(response['admin'], v => v['selected'] === true)[0];
        // this.subMenu = activeMenu.submenu;
        //
        // console.log('this.subMenu >>')
        // console.log(this.subMenu);
      },
      err => {

        if (err.status === 401) {
        } else {
          this.toastr.error('ERROR!', err);
        }

      }
    );
  }

  isActive(position) {
    return this.selected === position;
  }

  loadOptions(position, object) {
    // remove pre-selected option from the configured JSON
    if (!this.clearPreselectedMenuItem) {
      const preselectedOption = this.mainmenu.find(x => x.selected);
      if (preselectedOption) {
        preselectedOption.selected = false;
        this.clearPreselectedMenuItem = true;
      }
    }
    this.selected = position;
    if (object.url) {
      this.router.navigate([object.url]);
    }
    if (this.mainmenu[position]) {
      this.subMenu = this.mainmenu[position].submenu;
    }
  }

  /**
   * Get All Organization
   * @returns {Subscription}
   */
  getOrganization() {
    this.organizationService.getAllOrganization().subscribe(
      response => {
        if (response) {
          const preRes = [];
          _.forEach(response, (v, i) => {
            const pre = {};
            pre['id'] = v._id;
            pre['Code'] = v.context.client.code;
            pre['Name'] = v.name;
            pre['CountryCode'] = v.context.country.code;
            pre['context'] = v.context;
            preRes.push(pre);
          });
          this.organizationList = preRes;
          this.organizations = _.unionBy(preRes, 'Code');
          this.organizations = _.sortBy(this.organizations, ['Name']);

          const orgLocalData = this.localData;
          const org = _.isUndefined(orgLocalData) ? '' : JSON.parse(orgLocalData);
          const orgUser = JSON.parse(this.auth.getIdentityInfo('user'));
          let orgFilter = [];
          if (!_.isNull(org)) {
            if (!_.isUndefined(org.client) && !_.isNull(org.client)) {
              if (org.client['code'] !== '') {
                orgFilter = _.filter(preRes, (v, i) => v.Code === org.client.code);
              } else if (!_.isUndefined(orgUser['preference'])) {
                if (orgUser['preference']['IsDefaultOrgSelector']) {
                  orgFilter = _.filter(preRes, (v, i) => v.Code === orgUser['preference']['OrganizationCode']);
                }
              } else {
                orgFilter = _.filter(preRes, (v, i) => v.Code === org.client.code);
              }
              if (org.country.code.length === 0 && orgFilter.length > 0) {
                org.country.code = orgFilter[0]['CountryCode'];
              }
            }
          }

          this.selectedOrganization = orgFilter.length > 0 ? [orgFilter[0]] : [];
          if (this.selectedOrganization.length > 0 && this.selectedOrganization[0]['Code'] !== '-') {
            org['client']['name'] = this.selectedOrganization[0]['Name'];
            org['client']['code'] = this.selectedOrganization[0]['Code'];
            if (!_.isUndefined(org['orgChange'])) {
              org['country']['code'] = this.selectedOrganization[0]['CountryCode'];
              this.countries = _.filter(
                this.getDoCheckCountry, v => _.indexOf(_.map(orgFilter, 'CountryCode'), v.Code.toLowerCase()) !== -1
              );
            } else {
              this.countries = _.filter(this.countries, v => _.indexOf(_.map(orgFilter, 'CountryCode'), v.Code.toLowerCase()) !== -1);
            }
            this.auth.setIdentityInfo('org-context', JSON.stringify(org));
            this.countries = _.sortBy(this.countries, ['Code']);
            const countryCode = orgFilter.length > 0 ? orgFilter[0]['CountryCode'].toLowerCase() : '';
            if (org.country.code === '') {
              org.country.code = this.countries[0]['Code'];
            }
            setTimeout(() => {
              if (org.country.code === countryCode) {
                this.selectedCountry = _.filter(this.countries, (v, i) => v.Code.toLowerCase() === countryCode);
              } else {
                this.selectedCountry = _.filter(this.countries, (v, i) => v.Code.toLowerCase() === org.country.code.toLowerCase());
              }
              if (_.size(this.selectedCountry) === 0 || this.selectedCountry.length === 0) {
                this.selectedCountry = this.countries[0];
              }
            }, 300);
          }
          if (!_.isNull(org)) {
            if (!_.isUndefined(org['orgChange'])) {
              this.getRefreshDoCheck = false;
              delete org['orgChange'];
              this.auth.setIdentityInfo('org-context', JSON.stringify(org));
            }
          }
        }
      }, err => {
        if (err.status === 401) {
          this.auth.refreshAccessToken().subscribe(
            res => {
              this.getOrganization();
            });
        } else {
          this.toastr.error('ERROR!', err);
        }
      }
    );

  }

  /**
   * Get All Country
   * @returns {Subscription}
   */
  getCountries() {
    const country = [];
    country.push({ field: 'country', module: 'organization' });
    this.organizationService.getFieldValues(country).subscribe(
      response => {
        if (response && _.size(response) > 0) {
          const ct = [];
          response[0].value.forEach((v, i) => {
            const ob = {};
            ob['Code'] = !_.isNull(v) ? v.value : '';
            ob['Code'] = !_.isNull(v) ? v.value : '';
            ct.push(ob);
          });
          this.countries = _.sortBy(ct, ['Code']);
          this.getDoCheckCountry = this.countries;
        }
      }, err => {
        if (err.status === 401) {
          this.auth.refreshAccessToken().subscribe(
            res => {
              this.getCountries();
            });
        } else {
          this.toastr.error('ERROR!', err);
        }
      }
    );

  }

  onOrgSelect(item: any) {
    item = _.isUndefined(item['Code']) ? item : item['Code'];
    const filterValue = _.filter(this.organizationList, (v, i) => v.Code === item);
    this.countries = _.filter(cs['country'], v => _.indexOf(_.map(filterValue, 'CountryCode'), v.Code.toLowerCase()) !== -1);
    this.countries = _.sortBy(this.countries, ['Code']);
    this.selectedCountry = _.filter(cs['country'], (v, i) => v.Code.toLowerCase() === filterValue[0]['CountryCode']);
    let org = this.localData;
    if (!_.isNull(org)) {
      org = JSON.parse(org);
      org.client.code = filterValue[0].Code;
      org.client.name = filterValue[0].Name;
      org.country.code = filterValue[0].CountryCode;
      org.id = filterValue[0].id;
    } else {
      org = {
        client: {
          name: filterValue[0].Name,
          code: filterValue[0].Code,
          id: ''
        },
        country: {
          code: filterValue[0].CountryCode,
          id: ''
        },
        id: filterValue[0].id
      };
    }
    org['orgChanged'] = true;
    this.auth.setIdentityInfo('org-context', JSON.stringify(org));
    this.onRefresh();
  }

  onCountrySelect(item: any) {
    item = _.isUndefined(item['Code']) ? item : item['Code'];
    const org = JSON.parse(this.localData);
    const filterValue = _.filter(
      this.organizationList, (v, i) => v.context.country.code === item.toLowerCase() && v.Code === org.client.code
    );
    org.country.code = item.toLowerCase();
    org.id = filterValue[0].id;
    org['orgChanged'] = true;
    this.auth.setIdentityInfo('org-context', JSON.stringify(org));
    this.onRefresh();
  }

  onDeselectOrg(e) {

  }

  onDeselectCountry(e) {

  }

  onRefresh() {
  }

  outTheProfile() {
    document.getElementById('myProfileNavbar').classList.remove('show');
  }

  toggleMenu($event: Event) {
    $event.preventDefault();
    $event.stopPropagation();
    this.isMenuOpened = !this.isMenuOpened;
  }

  logOutTokenService() {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      token = AccessToken;
    }
    const headers = new Headers ({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions ({headers: headers});
    const idToken = localStorage.getItem('idToken') || '';
    const url = this.api_fs.api + '/api/users/logout/' + idToken;
    return this.http
      .get(url, options)
      .map(res => {
        return res.json();
      })
      .share();
  }

  deleteUser() {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('idToken');
      localStorage.removeItem('loggedInUserName');
      localStorage.removeItem('loggedInUserID');
  }

  logout() {
    console.log("header logout")
    return this.logOutTokenService().subscribe( (res) => {
      console.log("Log out: suc", res);
      this.deleteUser();
      this.router.navigate(['/login'] );
    }, (rej) => {
      console.log("Log out: rej", rej);
      if(rej.status == 401) {
        this.deleteUser();
        this.router.navigate(['/login'] );
      }

    })
  }

  resetPassword() {
    this.modalReset.show();
  }

  handleCloseModal(modalComponent: PopUpModalComponent) {
    modalComponent.hide();
  }

  OnReset(modalComponent: PopUpModalComponent) {
    this.error = '';
    const dataObj: any = {};
    dataObj.userId = localStorage.getItem('loggedInUserID');
    dataObj.oldPassword = this.resetForm.controls['old'].value;
    dataObj.newPassword = this.resetForm.controls['new'].value;
    if (this.resetForm.controls['new'].value !== this.resetForm.controls['confirm'].value) {
      this.error = 'Passwords does not match';
    } else {
      return this.performPasswordReset(dataObj).subscribe(
        response => {
          modalComponent.hide();
        },
        err => {
          this.error = err.error.errorCauses[0].errorSummary;
        }
      );
    }
  }

  performPasswordReset(dataObj) {
    const AccessToken: any = localStorage.getItem('accessToken');
    let token = '';
    if (AccessToken) {
      // token = AccessToken.accessToken;
      token = AccessToken;
    }
    const headers = new Headers({'Content-Type': 'application/json', 'token' : token, 'callingapp' : 'aspen'});
    const options = new RequestOptions({headers: headers});
    const userID = localStorage.getItem('loggedInUserID') || '';
    const data = JSON.stringify(dataObj);
    const url = this.api_fs.api + '/api/users/' + userID + '/change-password';
    return this.http
      .post(url, data, options)
      .map(res => {
        return res.json();
      }).share();
  }

  @HostListener('document:click', ['$event']) clickedOutside($event){
    if (this.isMenuOpened) {
      this.isMenuOpened = false;
    }
  }

}
