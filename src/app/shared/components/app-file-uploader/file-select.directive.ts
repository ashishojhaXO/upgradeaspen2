import {  Directive, HostListener, HostBinding, Output, EventEmitter } from '@angular/core';

@Directive({
    selector: '[fileSelect]'
})
export class FileSelectDirective {

    @Output() selectedFiles =  new EventEmitter<FileList>();

    constructor() { }

    @HostListener('change', ['$event'])
    onChange($event) {
        console.log($event)
        this.selectedFiles.emit($event.target.files);
    }


}
