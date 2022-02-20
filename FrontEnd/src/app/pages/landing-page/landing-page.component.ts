// npm i @angular-devkit/build-angular@~0.901.6 --force

import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import * as Messages from '../../constants/Messages';
import { ModalRxService } from 'src/app/services/modal.service';
import { ConfirmationModal } from 'src/app/modals/confirmation-modal/confirmation-modal';
import { SharedService } from 'src/app/services/shared.service';
import { APIService } from 'src/app/services/api.service';
import { Notification } from '../../entities/Notifications.js';
import { Router } from '@angular/router';
import { AmplifyService } from 'aws-amplify-angular';
import { Auth } from 'aws-amplify';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})

export class LandingPageComponent implements AfterViewInit {

  headers = ['deviceid','alerttype','group','status','lastupdatedtime'];
  data : Notification[];
  hiddenColumns = ["dispatchlist"];
  alertMessage = null;
  showSidebar = false;
  userid = null;
  isadmin = 0;


  constructor(
    private modalRxService: ModalRxService,
    private api : APIService,
    private router : Router,
    private amplifyService:AmplifyService
  ) { }

  async ngAfterViewInit() {
    console.log('afterviewinit-landingpage');
    SharedService.sendIsLoadingStatus(true);
    await this.checkLoggedUser();
  }

  async checkLoggedUser(){
    const userEmail = this.amplifyService.auth()?.user?.attributes?.email;
    if(userEmail){
      await this.api.checkUserPermission(userEmail).then(
        user => {
          if(user[0].id){
            this.userid = user[0].id;
            this.isadmin = user[0].isadmin
            console.log(this.userid);
            this.getNotifications();
          }
        },
        err => { 
          SharedService.sendAlertMessage(Messages.AlertError, Messages.UserNotFound); 
          SharedService.sendIsLoadingStatus(false);
        }
      )
    }
    else{
      this.router.navigate(['/index.html']);
    }
  }

  logOut(){
    Auth.signOut()
    .then(data => {console.log(data); window.location.replace('/index.html');})
    .catch(err => console.log(err));
  }

  getNotifications() {
    this.api.getNotificationsByUser(this.userid)
      .then(
        (result) => {
          if (result) {
            this.data = result;
            SharedService.sendIsLoadingStatus(false);
          }
        }
      ).catch(
        (exc) => {
          SharedService.sendAlertMessage(Messages.AlertError, Messages.AlertError + exc.message);
        }
      );
  }
  
  navigateToRoute(route){
    console.log(route);
    this.router.navigate(['/'+route]);
  }

  triggerAlerts(){
    SharedService.sendIsLoadingStatus(true);
    this.api.triggerAlerts().then(
      () => {
        SharedService.sendAlertMessage(Messages.AlertSuccess, Messages.ActionSucceeded);
      }
      ).catch(
        (exc) => {
          SharedService.sendAlertMessage(Messages.AlertError, Messages.AlertError + " - " + exc.message);
        }
      ).finally(() => {
        SharedService.sendIsLoadingStatus(false);
      });
  }

  onDeleteRow(data, index) {
    const modalOptions = { initialState: { message: Messages.ExclusionConfirmationMessage } };
    this.modalRxService.showModalWithCallback(ConfirmationModal, modalOptions,
      (proceed) => {
        if (proceed) {
          SharedService.sendIsLoadingStatus(true);
          this.api.deleteNotificationByDeviceIdAndType(this.data[index].deviceid, this.data[index].alerttype).then(
            () => {
              this.data.splice(index, 1);
              SharedService.sendAlertMessage(Messages.AlertSuccess, Messages.DeleteSuccessMessage);
            }
          ).catch(
            (exc) => {
              SharedService.sendAlertMessage(Messages.AlertError, Messages.AlertError + " - " + exc.message);
            }
          ).finally(() => {
            SharedService.sendIsLoadingStatus(false);
          });
        }
        else {
          SharedService.sendAlertMessage(Messages.AlertWarning, Messages.CanceledActionMessage);
        }
      });
  }

  
}
