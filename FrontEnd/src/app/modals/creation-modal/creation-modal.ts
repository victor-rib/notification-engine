import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as Messages from '../../constants/Messages';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'creationmodal',
  templateUrl: './creation-modal.html',
  styleUrls: ['./creation-modal.scss']
})

export class CreationModal  {
  @Input() columns;
  @Output() output = new EventEmitter<object>();

  newRecord = {};
  isLoading = false;

  constructor(  
     private bsModalRef: BsModalRef ,    
  ) { }

  ngOnInit(){ 
  }

  cancelClick = (): void => {
    this.closeModal();
  };

  noEmptyFieldsValidation(){
    let isvalid = true;
    let values = this.columns.map( x=> x.labelname);
    for(var x in values){
      if(!this.newRecord[values[x]]){
        isvalid = false;
      }
    }
    return isvalid;
  }

  saveClick = (): void => {
    const isvalid = this.noEmptyFieldsValidation()
    if(!isvalid){
      SharedService.sendAlertMessage(Messages.AlertError, Messages.EmptyFields);
    }
    else{
      this.output.emit(this.newRecord);
      this.closeModal();
    }
  };

  private closeModal = () => {
   console.log(this.newRecord);
    this.bsModalRef.hide();
  };
}
