import {
    Component,
    ContentChildren,
    EventEmitter,
    forwardRef,
    HostListener,
    Injector,
    Input,
    QueryList,
    TemplateRef,
    Type,
    ViewChild,
    Directive
} from '@angular/core';

// rx
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/first';

//import { Ng2Dropdown, Ng2MenuItem } from '/../../../ng2-dropdown/ng2-dropdown.module';
import { TagModel, TagInputDropdownOptions, OptionsProvider } from '../../core';
import { TagInputComponent } from '../../components';
import {Ng2Dropdown, } from '../../../ng2-dropdown/components/dropdown/ng2-dropdown';
import {Ng2MenuItem} from '../../../ng2-dropdown/components/menu-item/ng2-menu-item';

const defaults: Type<TagInputDropdownOptions> = forwardRef(() => OptionsProvider.defaults.dropdown);

@Component({
    selector: 'tag-input-dropdown',
    templateUrl: './tag-input-dropdown.template.html'
})
export class TagInputDropdown {
    /**
     * @name dropdown
     */
    @ViewChild(Ng2Dropdown) public dropdown: Ng2Dropdown;

    /**
     * @name menuTemplate
     * @desc reference to the template if provided by the user
     * @type {TemplateRef}
     */
    @ContentChildren(TemplateRef) public templates: QueryList<TemplateRef<any>>;

    /**
     * @name offset
     * @type {string}
     */
    @Input() public offset: string = new defaults().offset;

    /**
     * @name focusFirstElement
     * @type {boolean}
     */
    @Input() public focusFirstElement = new defaults().focusFirstElement;

    /**
     * - show autocomplete dropdown if the value of input is empty
     * @name showDropdownIfEmpty
     * @type {boolean}
     */
    @Input() public showDropdownIfEmpty = new defaults().showDropdownIfEmpty;

    /**
     * @description observable passed as input which populates the autocomplete items
     * @name autocompleteObservable
     */
    @Input() public autocompleteObservable: (text: string) => Observable<any>;

    /**
     * - desc minimum text length in order to display the autocomplete dropdown
     * @name minimumTextLength
     */
    @Input() public minimumTextLength = new defaults().minimumTextLength;

    /**
     * - number of items to display in the autocomplete dropdown
     * @name limitItemsTo
     */
    @Input() public limitItemsTo: number = new defaults().limitItemsTo;

    /**
     * @name displayBy
     */
    @Input() public displayBy = new defaults().displayBy;

    /**
     * @name identifyBy
     */
    @Input() public identifyBy = new defaults().identifyBy;

    /**
     * @description a function a developer can use to implement custom matching for the autocomplete
     * @name matchingFn
     */
    @Input() public matchingFn: (value: string, target: TagModel) => boolean = new defaults().matchingFn;

    /**
     * @name appendToBody
     * @type {boolean}
     */
    @Input() public appendToBody = new defaults().appendToBody;

    /**
     * @name keepOpen
     * @description option to leave dropdown open when adding a new item
     * @type {boolean}
     */
    @Input() public keepOpen = new defaults().keepOpen;

    /**
     * list of items that match the current value of the input (for autocomplete)
     * @name items
     * @type {TagModel[]}
     */
    public items: TagModel[] = [];

    /**
     * @name tagInput
     */
    public tagInput: TagInputComponent = this.injector.get(TagInputComponent);

    /**
     * @name _autocompleteItems
     * @type {Array}
     * @private
     */
    private _autocompleteItems: TagModel[] = [];

    /**
     * @name autocompleteItems
     * @param items
     */
    public set autocompleteItems(items: TagModel[]) {
        this._autocompleteItems = items;
    }

    /**
     * @name autocompleteItems
     * @desc array of items that will populate the autocomplete
     * @type {Array<string>}
     */
    @Input() public get autocompleteItems(): TagModel[] {
        const items = this._autocompleteItems;
        console.log(items);
        if (!items) {
            return [];
        }

        return items.map((item: TagModel) => {
            return typeof item === 'string' ? {
                [this.displayBy]: item,
                [this.identifyBy]: item
            } : item;
        });
    }

    @Input() public hideOnFirstClick: boolean;
    private clickCount:number = 0;
    public inputClicks = 0;

    constructor(private readonly injector: Injector) {}

    /**
     * @name ngOnInit
     */
    public ngOnInit(): void {
        this.onItemClicked().subscribe(this.requestAdding);

        // reset itemsMatching array when the dropdown is hidden
        this.onHide().subscribe(this.resetItems);

        const DEBOUNCE_TIME = 200;

        this.tagInput
            .onTextChange
            .debounceTime(DEBOUNCE_TIME)
            .filter((value: string) => {
                if (this.keepOpen === false) {
                    return value.length > 0;
                }

                return true;
            })
            .subscribe(this.show);
    }

    /**
     * @name updatePosition
     */
    public updatePosition(): void {
        const position = this.tagInput.inputForm.getElementPosition();

        this.dropdown.menu.updatePosition(position);
    }

    /**
     * @name isVisible
     * @returns {boolean}
     */
    public get isVisible(): boolean {
        return this.dropdown.menu.state.menuState.isVisible;
    }

    /**
     * @name onHide
     * @returns {EventEmitter<Ng2Dropdown>}
     */
    public onHide(): EventEmitter<Ng2Dropdown> {
        return this.dropdown.onHide;
    }

    /**
     * @name onItemClicked
     * @returns {EventEmitter<string>}
     */
    public onItemClicked(): EventEmitter<string> {
        console.log('onItemClicked');
        return this.dropdown.onItemClicked;
    }

    /**
     * @name selectedItem
     * @returns {Ng2MenuItem}
     */
    public get selectedItem(): Ng2MenuItem {
        //console.log( this.dropdown.menu.state.dropdownState.selectedItem);
        return this.dropdown.menu.state.dropdownState.selectedItem;
    }

    /**
     * @name state
     * @returns {DropdownStateService}
     */
    public get state(): any {
        return this.dropdown.menu.state;
    }

    public showDropDown = (): void => {
        // console.log('Clicked');
        // if (this.inputClicks === 0) {
        //     this.inputClicks = 1;
        // } else {
        //     this.inputClicks = 0;
        //     this.show();
        // }

        this.show();

        // if(this.tagInput.items.length == 0){
        //     this.tagInput.onFocus.emit('test');
        //     this.show();
        // } else {
        //     this.autocompleteItems = [];
        //     this.tagInput.onFocus.emit('test');
        //     this.show();
        //
        // }
    }

    /**
     *
     * @name show
     */
    public show = (): void => {
        const value = this.getFormValue();
        // console.log(this.tagInput.items[this.tagInput.items.length - 1]);
        //console.log(this.tagInput.isInputFocused());
        let lastTag:any;
        if(this.tagInput.items.length >0){
            lastTag = this.tagInput.items[this.tagInput.items.length - 1];
        }

        // if(!lastTag && this.hideOnFirstClick && this.clickCount == 0){
        //     this.clickCount = 1;
        //     this.hide();
        //     return;
        // }

        if (this.autocompleteObservable) {
            return this.getItemsFromObservable(value);
        }

        if (!this.showDropdownIfEmpty && !value) {
            return this.dropdown.hide();
        }

        const position = this.calculatePosition();
        // console.log('B4');
        // console.log(this.autocompleteItems);
        const items = this.getMatchingItems(value);
        // console.log('AF');
        // console.log(items);
        const hasItems = items.length > 0;
        const isHidden = this.isVisible === false;
        const showDropdownIfEmpty = this.showDropdownIfEmpty && hasItems && !value;
        const hasMinimumText = value.trim().length >= this.minimumTextLength;
        const assertions = [];

        const shouldShow = isHidden && ((hasItems && hasMinimumText) || showDropdownIfEmpty);
        const shouldHide = this.isVisible && !hasItems;

        this.setItems(items);

        if (shouldShow) {
            //Do not show when the last selected tag is an InputField
            if (lastTag && lastTag.hasOwnProperty('category')
                && lastTag.category === 'InputFields'
                && !this.tagInput.isInputFocused()) {
                this.hide();
            } else if (lastTag && lastTag.hasOwnProperty('hideSuggestions')
                && lastTag.hideSuggestions) {
                this.hide();
            } else {
                this.dropdown.show(position);
            }

        } else if (shouldHide) {
            this.hide();
        }
    }

    /**
     * @name hide
     */
    public hide(): void {
        this.resetItems();
        this.dropdown.hide();
    }

    /**
     * @name scrollListener
     */
    @HostListener('window:scroll')
    public scrollListener(): void {
        if (!this.isVisible) {
            return;
        }

        this.updatePosition();
    }

    /**
     * @name onWindowBlur
     */
    @HostListener('window:blur')
    public onWindowBlur(): void {
        this.dropdown.hide();
    }

    /**
     * @name getFormValue
     */
    private getFormValue(): string {
        return this.tagInput.formValue.trim();
    }

    /**
     * @name calculatePosition
     */
    private calculatePosition(): ClientRect {
        return this.tagInput.inputForm.getElementPosition();
    }

    /**
     * @name requestAdding
     * @param item {Ng2MenuItem}
     */
    private requestAdding = (item: Ng2MenuItem): void => {
        this.tagInput.onAddingRequested(true, this.createTagModel(item));
    }

    /**
     * @name createTagModel
     * @param item
     * @return {TagModel}
     */
    private createTagModel(item: Ng2MenuItem): TagModel {
        //console.log(item);
        if(!item.preventClose){
        const display = typeof item.value === 'string' ? item.value : item.value[this.displayBy];
        const value = typeof item.value === 'string' ? item.value : item.value[this.identifyBy];

        return {
            ...item.value,
            [this.tagInput.displayBy]: display,
            [this.tagInput.identifyBy]: value
        };
        }
    }

    /**
     *
     * @param value {string}
     * @returns {any}
     */
    private getMatchingItems(value: string): TagModel[] {
        if (!value && !this.showDropdownIfEmpty) {
            return [];
        }

        const dupesAllowed = this.tagInput.allowDupes;

        return this.autocompleteItems.filter((item: TagModel) => {
            const hasValue: boolean = dupesAllowed ? true : this.tagInput.tags.some(tag => {
                const identifyBy = this.tagInput.identifyBy;
                const model = typeof tag.model === 'string' ? tag.model : tag.model[identifyBy];

                return model === item[this.identifyBy];
            });


            return this.matchingFn(value, item) && hasValue === false;
        });



    }

    /**
     * @name setItems
     */
    private setItems(items: TagModel[]): void {
        this.items = items.slice(0, this.limitItemsTo || items.length);
    }

    /**
     * @name resetItems
     */
    private resetItems = (): void => {
        this.items = [];
    }

    /**
     * @name populateItems
     * @param data
     */
    private populateItems(data: any): TagInputDropdown {
        this.autocompleteItems = data.map(item => {
            return typeof item === 'string' ? {
                [this.displayBy]: item,
                [this.identifyBy]: item
            } : item;
        });

        return this;
    }

    /**
     * @name getItemsFromObservable
     * @param text
     */
    private getItemsFromObservable = (text: string): void => {
        this.setLoadingState(true);

        const subscribeFn = (data: any[]) => {
            // hide loading animation
            this.setLoadingState(false)
                // add items
                .populateItems(data);

            this.setItems(this.getMatchingItems(text));

            if (this.items.length) {
                this.dropdown.show(this.calculatePosition());
            } else if (!this.showDropdownIfEmpty && this.isVisible) {
                this.dropdown.hide();
            }
        };

        this.autocompleteObservable(text)
            .first()
            .subscribe(subscribeFn, () => this.setLoadingState(false));
    }

    /**
     * @name setLoadingState
     * @param state
     * @return {TagInputDropdown}
     */
    private setLoadingState(state: boolean): TagInputDropdown {
        this.tagInput.isLoading = state;

        return this;
    }
}

//
// @Directive({
//     selector: '[var]',
//      exportAs: 'var'
// })
// export class Var {
//     @Input() var:any;
// }
