import { Component, OnInit } from '@angular/core';
import { GenericService } from '../../../services/generic.service';

@Component({
  selector: 'app-payment-methods',
  templateUrl: './payment-methods.component.html',
  styleUrls: ['./payment-methods.component.css']
})
export class PaymentMethodsComponent implements OnInit {

  constructor(

      protected genericService: GenericService
  ) { }

  ngOnInit() {
  }

  protected getPaymentMethodsSuccess(){}

  protected getPaymentMethodsError(){}

  protected getPaymentMethods() {
    let dataObj: object = {};
    return this.genericService.getPaymentMethods(dataObj)
      .subscribe(
        this.getPaymentMethodsSuccess,   
        this.getPaymentMethodsError,   
      )
  }



}
