import { Component, OnInit, ElementRef, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { AuthService, OrganizationService } from '../../services';
import { MESSAGE } from '../../constants/message';
import * as _ from 'lodash';
import 'rxjs/add/operator/filter';
import { BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
  selector: 'app-select-organization',
  templateUrl: './select-organization.component.html',
  styleUrls: ['./select-organization.component.scss']
})

export class SelectOrganizationComponent implements OnInit {
  @ViewChild('autoShownModal') autoShownModal: ModalDirective;
  modalRef: BsModalRef;
  organizations = [];
  organizationList = [];
  selectedOrg = {};
  selectedOrganization = [];
  showOrgSelection: boolean;
  onDefaultOrgSelector: boolean;
  isCheckboxDisabled: boolean;
  appSpinner: any = true;
  localData: any;
  localDataUser: any;
  countries: any;
  selectedCountry = [];
  getDoCheckCountry: any = [];
  isCountryDisabled: any = true;

  dropDownSettings = {
    singleSelection: true,
    idField: 'code',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 5,
    allowSearchFilter: false,
    closeDropDownOnSelection: true
  };

  constructor(
    private organizationService: OrganizationService,
    private authService: AuthService,
    public router: Router,
    public toastr: ToastsManager,
    private element: ElementRef,
    private modalService: BsModalService
  ) { }

  ngOnInit() {
    console.clear();
    this.getCountries();
    this.getOrganization();
    this.localData = this.authService.getIdentityInfo('user');
    this.localDataUser = JSON.parse(this.localData);

  }

  public onShowOrgSelectionChanged($event) {
    this.showOrgSelection = $event.target.checked;
  }

  public onDefaultOrgChanged($event) {
    this.onDefaultOrgSelector = $event.target.checked;
  }

  onItemSelect(item: any) {
    if (item.code === 'AddOrg') {
      this.isCheckboxDisabled = true;
    } else {
      this.isCheckboxDisabled = false;
    }
    this.onDefaultOrgSelector = false;
    this.isCountryDisabled = this.isCheckboxDisabled;
    this.setClientLocal(item);
    this.selectedCountry = [{name: 'Select Country', code: '--'}];
    const checkOrgList = _.filter(this.organizationList, (v: any) => v['code'] === item.code);
    this.countries = _.filter(
      this.getDoCheckCountry, v => _.indexOf(_.map(checkOrgList, 'countryCode'), v.code.toLowerCase()) !== -1
    );
  }

  onItemDeSelect(item: any) {
      this.isCountryDisabled = true;
  }
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  /**
   * Get All Organization
   * @returns {Subscription}
   */
  getOrganization() {
    this.appSpinner = true;
    this.organizationService.getAllOrganization().subscribe(
      response => {
        if (response) {

          if (response.length > 0) {
            const organizationsList = [];

            // Iterate Organization Response
            _.forEach(response, organization => {
              organizationsList.push({
                code: organization.context.client.code,
                name: organization.name,
                countryCode: organization.context.country.code,
                id: organization._id,
                context: organization.context
              });
            });
            this.organizationList = organizationsList;
            this.organizations = _.unionBy(organizationsList, 'code');
            this.organizations = _.sortBy(this.organizations, 'name');
            if (this.localDataUser['clientType'] === 'f7') {
              this.organizations.splice(0, 0, { code: 'AddOrg', name: 'Add Organization', countryCode: '' });
            }

          } else {
            this.organizations = [{ code: 'AddOrg', name: 'Add Organization', countryCode: '' }];
          }
          // Prepend Add organization Option
          const user = JSON.parse(localStorage.getItem('user'));
          this.getUserPreference(user);
        }
      }, err => {
        if (err.status === 401) {
          this.authService.refreshAccessToken().subscribe(
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
   * Get All Country list
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
            ob['code'] = !_.isNull(v) ? v.value : '';
            ob['name'] = !_.isNull(v) ? v.description : '';
            ct.push(ob);
          });
          this.countries = _.sortBy(ct, ['name']);
          this.getDoCheckCountry = this.countries;
        }
      }, err => {
        if (err.status === 401) {
          this.authService.refreshAccessToken().subscribe(
            res => {
              this.getCountries();
            });
        } else {
          this.toastr.error('ERROR!', err);
        }
      }
    );

  }

  /**
   * Update User Preference based organization
   * @returns {Subscription}
   */
  updateUserPreference(organization) {
    const use = JSON.parse(localStorage.getItem('user'));
    use.preference = {};
    if (!use.preference['IsDefaultOrgSelector']) {
      use.preference['IsDefaultOrgSelector'] = this.onDefaultOrgSelector;
      use.preference['OrganizationCode'] = organization.code;
      use.preference['countryCode'] = organization.countryCode;
    }
    use.preference['ShowOrgSelectionScreen'] = this.showOrgSelection;
    use.preference['_id'] = organization.id;
    localStorage.setItem('user', JSON.stringify(use));
    this.createUserPreference(organization);
  }

 /**
  * Create User Preference based organization
  * @returns {Subscription}
  */
  createUserPreference(organization) {
    const usr = JSON.parse(this.authService.getIdentityInfo('user'));
    const userID = usr.id;
    const prefCode = {};
    prefCode['OrganizationCode'] = organization.code;
    prefCode['countryCode'] = organization.countryCode;
    prefCode['ShowOrgSelectionScreen'] = _.isUndefined(this.showOrgSelection) ? false : this.showOrgSelection;
    prefCode['IsDefaultOrgSelector'] = _.isUndefined(this.onDefaultOrgSelector) ? false : this.onDefaultOrgSelector;
    usr['preference'] = prefCode;
    const prf = { preference: _.size(prefCode) > 0 ? prefCode : {} };
    this.authService.preferencesUpdate(userID, prf).subscribe(
      response => {
        if (response) { }
      }, err => {
        this.toastr.error('ERROR!', err);
        this.appSpinner = false;
      });
  }

  getUserPreference(user) {
    if (!_.isEmpty(user.preference)) {
      const res = user.preference;
      this.showOrgSelection = _.isNull(user.preference) ? false : res.ShowOrgSelectionScreen;
      this.onDefaultOrgSelector = _.isNull(user.preference) ? false : res.IsDefaultOrgSelector;
      const org = {};
      if (this.showOrgSelection) {
        this.autoShownModal.hide();
        org['code'] = res.OrganizationCode;
        this.setClientLocal(org);
        if (this.localDataUser['clientType'] !== 'f7') {
          this.router.navigate(['./app/organization']);
        } else {
          this.router.navigate(['./app/organizationList']);
        }

      } else if (this.onDefaultOrgSelector) {
        this.isCountryDisabled = false;
        org['code'] = res.OrganizationCode;
        this.setClientLocal(org);
        const index = this.organizations.findIndex((object, i) => {
          return object.code === res.OrganizationCode;
        });
        const userOrg = this.organizations[index];
        if (!_.isUndefined(userOrg)) {
          this.selectedOrganization = [{ code: userOrg.code, name: userOrg.name }];
          setTimeout( () => {
          this.selectedCountry = _.filter(this.getDoCheckCountry, (v: any) => v['code'].toLowerCase() === res.countryCode.toLowerCase());
          this.onCountrySelect(this.selectedCountry[0]);
          }, 300);
        } else {
          this.selectedOrganization = [];
          this.onDefaultOrgSelector = false;
          this.selectedCountry = [{name: 'Select Country', code: '--'}];
        }

      } else {

      }
      this.appSpinner = false;
    } else {
      this.appSpinner = false;
    }

  }

  setClientLocal(item: any) {
    item = _.isUndefined(item) ? item : item['code'];
    const selectedOrg = _.filter(this.organizations, (v, i) => v.code === item)[0];
    if (!_.isUndefined(selectedOrg) && selectedOrg['code'] !== 'AddOrg') {
      selectedOrg.context['id'] = selectedOrg.id;
      this.selectedOrg = selectedOrg.context;
      this.authService.setIdentityInfo('org-context', JSON.stringify(this.selectedOrg));
    } else {
      const ss = {
        version: {
          major: 1,
          minor: 0,
          _id: ''
        },
        client: {
          name: '',
          code: '',
          _id: ''
        },
        country: {
          code: '',
          _id: ''
        },
        _id: '',
        providers: [],
        partner: [],
        id: ''
      };
      this.authService.setIdentityInfo('org-context',  JSON.stringify(ss));
    }
  }

  onCountrySelect(item: any) {
    const orgValues = JSON.parse(this.authService.getIdentityInfo('org-context'));
     orgValues['country']['code'] = item.code.toLowerCase();
     this.authService.setIdentityInfo('org-context', JSON.stringify(orgValues));
  }
  submit() {
    const selectedOrg = this.element.nativeElement.querySelector('.selected-item');
    if (selectedOrg != null) {
      this.autoShownModal.hide();
    } else {
      this.toastr.error('ERROR!', MESSAGE.SELECT_ORGANIZATION);
      return;
    }

    if (this.selectedOrganization[0].code === 'AddOrg') {
      this.autoShownModal.hide();
      this.router.navigate(['./app/organizationList']);
      return;
    }

    const selectedVal = JSON.parse(JSON.stringify(this.selectedOrg)).client;

    const organization = _.filter(this.organizations, (v, i) => v.code === selectedVal.code)[0];
    this.updateUserPreference(organization);
    if (this.localDataUser['clientType'] !== 'f7') {
      this.router.navigate(['./app/organization']);
    } else {
      this.router.navigate(['./app/organizationList']);
    }
  }

  resetModel() {
    this.autoShownModal.hide();
    if (!_.isUndefined(this.localDataUser['preference'])) {
      if (this.localDataUser['preference']['IsDefaultOrgSelector']) {
        const orgSelectionCancel = _.filter(this.organizations, (v, i) => v.code === this.localDataUser['preference']['OrganizationCode']);
        this.setClientLocal(orgSelectionCancel[0]);
      }
    } else {
      this.setClientLocal(this.organizations[1]);
    }
    if (this.localDataUser['clientType'] !== 'f7') {
      this.router.navigate(['./app/organization']);
    } else {
      this.router.navigate(['./app/organizationList']);
    }
  }

}
