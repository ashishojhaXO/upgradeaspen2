import {
    Component,
    Input,
    Output,
    EventEmitter,
    TemplateRef,
    ElementRef,
    HostListener,
    HostBinding,
    ViewChild,
    ChangeDetectorRef,
    Renderer2, ViewChildren
} from '@angular/core';

import { TagModel } from '../../core/accessor';
import { TagRipple } from '../tag';

// angular universal hacks
/* tslint:disable-next-line */
//const KeyboardEvent = (global as any).KeyboardEvent;
//const MouseEvent = (global as any).MouseEvent;

// mocking navigator
const navigator = typeof window !== 'undefined' ? window.navigator : {
    userAgent: 'Chrome',
    vendor: 'Google Inc'
};

const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

@Component({
    selector: 'tag',
    templateUrl: './tag.template.html',
    styleUrls: [ './tag-component.style.scss' ]
})
export class TagComponent {
    /**
     * @name model {TagModel}
     */
    @Input() public model: TagModel | TagModel;

    /**
     * @name removable {boolean}
     */
    @Input() public removable: boolean;

    /**
     * @name editable {boolean}
     */
    @Input() public editable: boolean;

    /**
     * @name template {TemplateRef<any>}
     */
    @Input() public template: TemplateRef<any>;

    /**
     * @name displayBy {string}
     */
    @Input() public displayBy: string;

    /**
     * @name identifyBy {string}
     */
    @Input() public identifyBy: string;

    /**
     * @name index {number}
     */
    @Input() public index: number;

    /**
     * @name hasRipple
     */
    @Input() public hasRipple: boolean;

    /**
     * @name disabled
     */
    @Input() public disabled = false;

    /**
     * @name onSelect
     * @type {EventEmitter<TagModel>}
     */
    @Output() public onSelect: EventEmitter<TagModel> = new EventEmitter<TagModel>();

    /**
     * @name onRemove
     * @type {EventEmitter<TagModel>}
     */
    @Output() public onRemove: EventEmitter<TagModel> = new EventEmitter<TagModel>();

    /**
     * @name onBlur
     * @type {EventEmitter<TagModel>}
     */
    @Output() public onBlur: EventEmitter<TagModel> = new EventEmitter<TagModel>();

    /**
     * @name onKeyDown
     * @type {EventEmitter<any>}
     */
    @Output() public onKeyDown: EventEmitter<any> = new EventEmitter<any>();

    /**
     * @name onTagEdited
     * @type {EventEmitter<any>}
     */
    @Output() public onTagEdited: EventEmitter<TagModel> = new EventEmitter<TagModel>();

    /**
     * @name readonly {boolean}
     */
    public get readonly(): boolean {
        return typeof this.model !== 'string' && this.model.readonly === true;
    };

    /**
     * @name editing
     * @type {boolean}
     */
    public editing = false;

    /**
     * @name moving
     * @type {boolean}
     */
    @HostBinding('class.moving') public moving: boolean;

    /**
     * @name rippleState
     * @type {string}
     */
    public rippleState = 'none';

    @ViewChild('input') inputText;

    /**
     * @name ripple {TagRipple}
     */
    @ViewChild(TagRipple) public ripple: TagRipple;

    constructor(public element: ElementRef,
                public renderer: Renderer2,
                private cdRef: ChangeDetectorRef) {}

    ngAfterViewInit() {
        // console.log('ngAfterViewInit');
         if(this.inputText){
             this.inputText.nativeElement.focus();
             //console.log(this.element);
         }

    }

    /**
     * @name select
     */
    public select($event?: MouseEvent): void {
        if (this.readonly || this.disabled) {
            return;
        }

        if ($event) {
            $event.stopPropagation();
        }

        this.focus();

        this.onSelect.emit(this.model);
    }

    /**
     * @name remove
     */
    public remove($event: MouseEvent): void {
        //console.log('remove');
        $event.stopPropagation();
        this.onRemove.emit(this);
    }

    /**
     * @name focus
     */
    public focus(): void {
        //console.log('focus');
        console.log(this.element);
        // if(this.inputText.first){
        //     this.inputText.first.nativeElement.focus();
        // }else{
            this.element.nativeElement.focus();
        // }

    }

    public move(): void {
        console.log('move');
        this.moving = true;
    }

    /**
     * @name keydown
     * @param event
     */
    @HostListener('keydown', ['$event'])
    public keydown(event: KeyboardEvent): void {

        if (this.model.hasOwnProperty('category') && this.model['category'] === 'InputFields') {

            if (event.keyCode === 37 || event.keyCode === 39) {
                this.inputText.first.selectionStart = this.inputText.first.selectionStart - 1;
                this.inputText.first.selectionEnd = this.inputText.first.selectionEnd - 1;
                event.preventDefault();
                return;
            }
        }


        if (this.editing) {
            event.keyCode === 13 ? this.disableEditMode(event) : undefined;
            return;
        }

        // if(this.model.hasOwnProperty('header') && this.model['header'] !== 'input'){
        //    this.onKeyDown.emit({event, model: this.model});
        // }8
        // if(event.keyCode === 8){
        //     console.log('backspace pressed');
        //     // this.inputText.first.selectionStart = this.inputText.first.selectionStart - 1;
        //     // this.inputText.first.selectionEnd = this.inputText.first.selectionEnd - 1;
        //     const value = this.getDisplayValue(this.model);
        //     console.log(value);
        //     this.inputText.first.nativeElement.innerText = value+'TT';
        // }

        if (!this.editing) {
            this.onKeyDown.emit({event, model: this.model});
        }
    }

    /**
     * @name blink
     */
    public blink(): void {
        const classList = this.element.nativeElement.classList;
        classList.add('blink');

        setTimeout(() => classList.remove('blink'), 50);
    }

    /**
     * @name toggleEditMode
     */
    public toggleEditMode(): void {
        //console.log('toggleEditMode');
//        console.log(this.model['header'] );

            if (this.editable) {
                this.editing ? undefined : this.activateEditMode();
            }

    }

    /**
     * @name onBlurred
     * @param event
     */
    public onBlurred(event: any): void {
        //console.log('onBlurred:' );
        //console.log( event);
        // Checks if it is editable first before handeling the onBlurred event in order to prevent
        // a bug in IE where tags are still editable with onlyFromAutocomplete set to true
		if (!this.editable) {
			return;
		}

        const value: string = event.target.innerText;
        const result = typeof this.model === 'string' ? value :
            {[this.identifyBy]: value, [this.displayBy]: value};

        this.disableEditMode();

        this.onBlur.emit(result);
    }

    public onBlurredEdit(event: any): void {
        //console.log('onBlurred:' + event);
        //console.log( this.model);
        // Checks if it is editable first before handeling the onBlurred event in order to prevent
        // a bug in IE where tags are still editable with onlyFromAutocomplete set to true
        this.editable = true;
        if (!this.editable) {
            return;
        }

        const value: string = event.target.innerText;
        const result = typeof this.model === 'string' ? value :
            {[this.identifyBy]: value, [this.displayBy]: value};

        this.disableEditMode();

        this.onBlur.emit(result);
    }

    /**
     * @name getDisplayValue
     * @param item
     * @returns {string}
     */
    public getDisplayValue(item: TagModel): string {
        return typeof item === 'string' ? item : item[this.displayBy];
    }

    public isRender(item: TagModel): boolean {
      return  item.hasOwnProperty('value');
    }

    /**
     * @desc returns whether the ripple is visible or not
     * only works in Chrome
     * @name isRippleVisible
     * @returns {boolean}
     */
    public get isRippleVisible(): boolean {
        return !this.readonly &&
            !this.editing &&
            isChrome &&
            this.hasRipple;
    }

    /**
     * @name getContentEditableText
     * @returns {string}
     */
    private getContentEditableText(): string {
        const input = this.getContentEditable();

        return input ? input.innerText.trim() : '';
    }

    /**
     * @name setContentEditableText
     * @param model
     */
    private setContentEditableText(model: TagModel) {
        const input = this.getContentEditable();
        const value = this.getDisplayValue(model);

        input.innerText = value;
    }

    /**
     * @name
     */
    private activateEditMode(): void {
        const classList = this.element.nativeElement.classList;
        classList.add('tag--editing');

        this.editing = true;
    }

    /**
     * @name disableEditMode
     * @param $event
     */
    private disableEditMode($event?: KeyboardEvent): void {
        console.log('disableEditMode');
        const classList = this.element.nativeElement.classList;
        const input = this.getContentEditableText();

        this.editing = false;
        classList.remove('tag--editing');

        if (!input) {
            this.setContentEditableText(this.model);
            return;
        }

        this.storeNewValue(input);
        this.cdRef.detectChanges();

        if ($event) {
            $event.preventDefault();
        }
    }

    private handleKeyBoardEvent($event?: KeyboardEvent): void {
        console.log($event);

        if($event.keyCode == 13){
            $event.preventDefault();
        }
    }

    /**
     * @name storeNewValue
     * @param input
     */
    private storeNewValue(input: string): void {
        console.log('storeNewValue:' + input);
        const exists = (model: TagModel) => {
            return typeof model === 'string' ?
                model === input :
                model[this.displayBy] === input;
        };

        // if the value changed, replace the value in the model
        if (exists(this.model) === false) {
            const model = typeof this.model === 'string' ? input :
                {[this.identifyBy]: input, [this.displayBy]: input};

            // emit output
            this.model = model;
            this.onTagEdited.emit(model);
        }
    }

    /**
     * @name getContentEditable
     */
    private getContentEditable(): HTMLInputElement {
        return this.element.nativeElement.querySelector('[contenteditable]');
    }

    /**
     * @name isDeleteIconVisible
     * @returns {boolean}
     */
    private isDeleteIconVisible(): boolean {
        return false;
    //     return !this.readonly &&
    //             !this.disabled &&
    //             this.removable &&
    //             !this.editing;
    }
}
