/**
 * Copyright 2020. Accelitas Inc. All rights reserved.
 *
 * Author: Dinesh Yadav
 * Date: 2020-03-19 10:00:00
 */
import {Component, EventEmitter, Input, OnInit, Output, SimpleChanges} from '@angular/core';
// import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import {Observable} from 'rxjs/Observable';

// import * as S3 from 'aws-sdk/clients/s3';

@Component({
    selector: 'app-file-uploader',
    templateUrl: './app-file-uploader.component.html',
    styleUrls: ['./app-file-uploader.component.scss'],
    moduleId: module.id
})
export class AppFileUploaderComponent implements OnInit {

    // task: AngularFireUploadTask;
    @Input() uploadedFile: any;
    @Output() processFile: EventEmitter<any> = new EventEmitter();
    isHovering: boolean;

    percent$: Observable<number>;
    url$: Observable<string>;

    state$: Observable<string>;
    bytes$: Observable<number[]>;

    constructor() {
    }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['uploadedFile']) {

        }
    }

    startUpload(event: FileList) {
        const file = event.item(0);
        this.uploadedFile = file;
        // this.convertToBase64(file);

    }

    uploadToS3(file) {
        // const bucketName = 'static.fusionseven.net';
        // const folderName = 'images';
        //
        // const contentType = file.type;
        // const bucket = new S3(
        //     {
        //         accessKeyId: '',
        //         secretAccessKey: '',
        //         region: 'us-west-2'
        //     }
        // );
        // const params = {
        //     Bucket: bucketName,
        //     Key: folderName + '/' + new Date().getTime() + '_' + file.name,
        //     Body: file,
        //     ACL: 'public-read',
        //     ContentType: contentType
        // };

        // bucket.upload(params, function (err, data) {
        //   if (err) {
        //     console.log('There was an error uploading your file: ', err);
        //     return false;
        //   }
        //   console.log('Successfully uploaded file.', data);
        //   return true;
        // });

        // for upload progress
        // bucket.upload(params).on('httpUploadProgress', function (evt) {
        //     console.log(evt.loaded + ' of ' + evt.total + ' Bytes');
        // }).send(function (err, data) {
        //     if (err) {
        //         console.log('There was an error uploading your file: ', err);
        //         return false;
        //     }
        //     console.log('Successfully uploaded file.', data);
        //     return true;
        // });
    }

    convertToBase64(file): void {
        const myReader = new FileReader();
        myReader.onloadend = (e) => {
            const fileAsBase64 = myReader.result;
            console.log('fileAsBase64 >>>');
            console.log(fileAsBase64);
        };
        myReader.readAsDataURL(file);
    }

    toggleHover(event: boolean) {
        this.isHovering = event;
    }

    uploadFiles() {

        this.processFile.emit(this.uploadedFile);
       // this.convertToBase64(this.uploadedFile);
    }
}
