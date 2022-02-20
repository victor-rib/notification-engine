import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'editmodal',
  templateUrl: './edit-modal.html',
  styleUrls: ['./edit-modal.scss']
})

export class EditModal  {
  @Input() data;
  @Output() output = new EventEmitter<object>();

  newRecord = {};
  isLoading = false;


  constructor(  
     private bsModalRef: BsModalRef   
  ) { }

  ngOnInit(){ 
  }

  cancelClick = (): void => {
    this.closeModal();
  };

  saveClick = (): void => {
      console.log(this.data);
      this.output.emit(this.data);
      this.closeModal();
  };

  changeKey(key, newvalue) {
     this.data[key] = newvalue;
  }

  private closeModal = () => {
    this.bsModalRef.hide();
  };
}
