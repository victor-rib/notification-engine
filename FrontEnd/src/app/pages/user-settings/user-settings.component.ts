// npm i @angular-devkit/build-angular@~0.901.6 --force

import { AfterViewInit, Component } from '@angular/core';
import * as Messages from '../../constants/Messages';
import { SharedService } from 'src/app/services/shared.service';
import { APIService } from 'src/app/services/api.service';
import { ModalRxService } from 'src/app/services/modal.service';
import { ConfirmationModal } from 'src/app/modals/confirmation-modal/confirmation-modal';
import { Router } from '@angular/router';
import { UserSettingsEnum } from 'src/app/constants/UserSettingsEnum';
import { CreationModal } from 'src/app/modals/creation-modal/creation-modal';
import { AmplifyService } from 'aws-amplify-angular';
import { Auth } from 'aws-amplify';

@Component({
  selector: 'user-settings-page',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})

export class UserSettingsComponent implements AfterViewInit {

  headers = [];
  headersSubscription = ['username','frequencyname','channelname'];
  headersUserToAlert = ['username', 'groupname', 'typename'];
  currentTab = null;
  data : any[];
  alertMessage = null;
  userid = null;
  isadmin = 0

  constructor(
    private api : APIService,
    private modalRxService: ModalRxService,
    private router : Router,
    private amplifyService:AmplifyService
  ) { }

  async ngAfterViewInit() {
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
            document.getElementById('subscription-button').click();
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


  typeSelected(tabName){
    if(tabName == 'subscription'){
      this.getSubscriptions();
    }
    else{
      this.getUserToAlertByUser();
    }
  }

  getSubscriptions() {
    this.api.getSubscriptionsByUser(this.userid)
      .then(
        (result) => {
          if (result) {
            this.data = result;
            this.headers = this.headersSubscription.slice(0);
            SharedService.sendIsLoadingStatus(false);
          }
        }
      ).catch(
        (exc) => {
          SharedService.sendAlertMessage(Messages.AlertError, Messages.AlertError + exc.message);
        }
      );
  }
  
  getUserToAlertByUser() {
    this.api.getUserToAlertByUser(this.userid)
      .then(
        (result) => {
          if (result) {
            this.data = result;
            this.headers = this.headersUserToAlert.slice(0);
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

  onDeleteRow(data, index) {
    const modalOptions = { initialState: { message: Messages.ExclusionConfirmationMessage } };
    this.modalRxService.showModalWithCallback(ConfirmationModal, modalOptions,
      (proceed) => {
        if (proceed) {
          SharedService.sendIsLoadingStatus(true);
          if(this.currentTab == 'subscription'){
            this.api.deleteSubscriptionById(this.data[index].subscriptionid).then(
              () => {
                this.data.splice(index, 1);
                SharedService.sendAlertMessage(Messages.AlertSuccess, Messages.DeleteSuccessMessage);
            }).catch(
                (exc) => {
                  SharedService.sendAlertMessage(Messages.AlertError, Messages.AlertError + " - " + exc.message);
                }
            ).finally(() => {
                SharedService.sendIsLoadingStatus(false);
            });
          }
          else{
            this.api.deleteUserToAlertById(this.data[index].usertoalertsid).then(
              () => {
                this.data.splice(index, 1);
                SharedService.sendAlertMessage(Messages.AlertSuccess, Messages.DeleteSuccessMessage);
            }).catch(
                (exc) => {
                  SharedService.sendAlertMessage(Messages.AlertError, Messages.AlertError + " - " + exc.message);
                }
            ).finally(() => {
                SharedService.sendIsLoadingStatus(false);
            });
          }     
        }
        else {
          SharedService.sendAlertMessage(Messages.AlertWarning, Messages.CanceledActionMessage);
        }
      });
  }

  async openCreationModal() {
    let modalOptions = {}
    let userList =  await this.api.getUsers();
    userList = userList ? userList.filter( x => x.id == this.userid) : null;
    if(this.currentTab == 'subscription'){
      let channelList =  await this.api.getChannels();
      let frequencyList =  await this.api.getFrequency();
       modalOptions= {  initialState: { columns:[
         {"name": 'user', 'labelname':'username', 'dropdownlist': userList},
         {"name": 'channel', 'labelname':'channelname','dropdownlist': channelList},  
         {"name": 'frequency', 'labelname':'frequencyname','dropdownlist': frequencyList}]}
       };
    }
    else{
     let alertTypeGroupList =  await this.api.getAlertTypeToGroup();
      modalOptions= {  initialState: { columns:[
        {"name": 'user', 'labelname':'username', 'dropdownlist': userList},
        {"name": 'alert type - group', 'labelname':'grouptotype','dropdownlist': alertTypeGroupList}
      ]
      }};
    }
    this.modalRxService.showModalWithCallback(CreationModal, modalOptions,
      (newRecord) => {
        if (newRecord && this.currentTab == 'subscription') {
          SharedService.sendIsLoadingStatus(true);
          let body = this.formatNewSubscriptionObject(newRecord);
          console.log(body);
          this.api.createSubscription(body).then (
            (result => {
              this.typeSelected( this.currentTab);
              SharedService.sendAlertMessage(Messages.AlertSuccess, Messages.CreationSuccessMessage);
              SharedService.sendIsLoadingStatus(false);
            }),
            (error => {
              SharedService.sendAlertMessage(Messages.AlertError, Messages.AlertError + error.message);
              SharedService.sendIsLoadingStatus(false);
            }),
          );
        }
        else if(newRecord){
          SharedService.sendIsLoadingStatus(true);
          let body = this.formatNewUserToAlertObject(newRecord);
          console.log(body);
          this.api.createUserToAlert(body).then (
            (result => {
              this.typeSelected(this.currentTab);
              SharedService.sendIsLoadingStatus(false);
            }),
            (error => {
              SharedService.sendAlertMessage(Messages.AlertError, Messages.AlertError + error.message);
              SharedService.sendIsLoadingStatus(false);
            }),
          );
        }
      });
  }

  formatNewSubscriptionObject(newRecord){
    return {
      "userid":newRecord?.username?.id,
      "channelid":newRecord?.channelname?.id, 
      "frequencyid":newRecord?.frequencyname?.id
    };
  }

  formatNewUserToAlertObject(newRecord){
    return {
      "userid":newRecord?.username?.id,
      "grouptotypeid":newRecord?.grouptotype?.id, 
    };
  }

  openTab(evt, tabName) {
    SharedService.sendIsLoadingStatus(true);
    this.currentTab = tabName;
    var i, tablinks;
  
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    if(evt){
      evt.currentTarget.className += " active";
    }
    this.typeSelected( this.currentTab);
  }
  
}
