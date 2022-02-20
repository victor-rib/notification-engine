import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

@Injectable({ providedIn: 'root' })
export class ModalRxService {
  modalRef: BsModalRef;
  public loadModal = new BehaviorSubject<boolean>(false);

  constructor(private bsModalService: BsModalService, public bsModalRef: BsModalRef) {}

  showBasicModalDialog(template: any, initialState?: ModalOptions, callback?: () => void): void {
    this.modalRef = this.bsModalService.show(template, initialState);
    const sub = this.bsModalService.onHide.subscribe(() => {
      if (callback) {
        callback();
      }
      sub.unsubscribe();
    });
  }

  showModalWithCallback(template: any, initialState?: ModalOptions, callback?: (result) => void, outputProperty = 'output'): void {
    this.modalRef = this.bsModalService.show(template, initialState);
    if (this.modalRef.content[outputProperty] && this.modalRef.content[outputProperty].subscribe && typeof callback === 'function') {
      const sub = this.modalRef.content[outputProperty].subscribe((result) => {
        callback(result);
        sub.unsubscribe();
      });
    }
  }

  
  showModal(show: boolean) {
    this.loadModal.next(show);
  }
  
  close(): void {
    this.modalRef.hide();
  }

}
