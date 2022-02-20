import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'confirmationmodal',
  templateUrl: './confirmation-modal.html',
  styleUrls: ['./confirmation-modal.scss']
})

export class ConfirmationModal  {
  @Input() message;
  @Output() output = new EventEmitter<boolean>();

  constructor(  
     private bsModalRef: BsModalRef   
  ) { }

  ngOnInit(){ }

  yesClick = (): void => {
        this.output.emit(true);
        this.bsModalRef.hide();
  };

  noClick = (): void => {
        this.output.emit(false);
        this.bsModalRef.hide();
   };
}
