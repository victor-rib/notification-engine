import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import * as Messages from '../constants/Messages';

@Injectable({ providedIn: 'root' })
export class SharedService {
 
  static isLoading = new Subject();
  static alertMessage = new Subject();

  constructor() {}

  public static sendIsLoadingStatus(isLoading: boolean ) {
    SharedService.isLoading.next(isLoading);
  }

  public static getIsLoadingStatus(): Observable<any> {
    return SharedService.isLoading.asObservable();
  }

  public static sendAlertMessage( alertType: string, message: string ) {
    SharedService.alertMessage.next(message);
    const alertComponent = document.getElementById('general-alert-comp');
    if (alertComponent) {
      SharedService.removeAllAlertClasses(alertComponent);
      switch (alertType) {
        case Messages.AlertSuccess: alertComponent.classList.add("success-alert"); break;
        case Messages.AlertWarning: alertComponent.classList.add("warning-alert"); break;
        case Messages.AlertError: alertComponent.classList.add("error-alert"); break;
        default: alertComponent.classList.add("success-alert"); break;
      }
      setTimeout(() => {
        SharedService.removeAllAlertClasses(alertComponent);
        SharedService.alertMessage.next(null);
        alertComponent.classList.add("hidden");
      }, 5000);
    }
  }

  static removeAllAlertClasses(alertComponent) {
    alertComponent.classList.remove("success-alert");
    alertComponent.classList.remove("warning-alert");
    alertComponent.classList.remove("error-alert");
    alertComponent.classList.remove("hidden");
  }

  public static getAlertMessage(): Observable<any> {
    return SharedService.alertMessage.asObservable();
  }
  
}
