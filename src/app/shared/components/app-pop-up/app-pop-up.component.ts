import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-app-pop-up',
  templateUrl: './app-pop-up.component.html',
  styleUrls: ['./app-pop-up.component.css']
})
export class AppPopUpComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  // PopUpComponent
  // questionPopUp(data: {}, serviceFunc ): {} {
  questionPopUp(data: {} ): {} {

    const startOptions = {
      title: 'Retry Orders',
      text: `Are you sure you wish to retry payments of order ids: ${data["ar_id"]}`,
      type: 'question',
      showCloseButton: true,
      showCancelButton: true,
      cancelButtonText: "Cancel",
      confirmButtonText: "Submit",
      reverseButtons: true,
      // showLoaderOnConfirm: true,
      // preConfirm: (login) => {
      //   console.log("PRECOONFIRM", login);
      //   // return this.postRetryOrderService(data).toPromise();
      //   return serviceFunc().toPromise();
      // },

    };

    return startOptions;
  }

  errorPopUp(options?: {}): {} {
    const startOptions = {
      title: "Operation Failed",
      text: "Operation to retry orders ids failed",
      type: 'error',
      // cancelButtonText: "Ok",
    };

    return startOptions;
  }

  showPopUp(options) {
    return Swal(options)
  }

  // runCompileShowPopUp(data, serviceFunc) {
  runCompileShowPopUp(data) {
    // const options = this.questionPopUp(data, serviceFunc);
    const options = this.questionPopUp(data);
    return this.showPopUp(options);
  }
  // PopUpComponent/

}