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
import { EditModal } from 'src/app/modals/edit-modal/edit-modal';
import { Users } from 'src/app/entities/Users';
import { AlertType } from 'src/app/entities/AlertType';
import { DeviceGroup } from 'src/app/entities/DeviceGroups';
import { AmplifyService } from 'aws-amplify-angular';
import { Auth } from 'aws-amplify';

@Component({
  selector: 'manage-entity-page',
  templateUrl: './manage-entity.component.html',
  styleUrls: ['./manage-entity.component.scss']
})

export class ManageEntityComponent implements AfterViewInit {

  headers = [];
  headersUsers = ['id', 'username', 'email', 'phone'];
  headersAlertTypes = ['id', 'typename', 'typealias', 'rules', 'description'];
  headersDeviceGroups = ['id', 'groupname', 'locations', 'provider', 'description'];
  headersGroupToType = ['id', 'typename', 'groupname'];
  currentTab = null;
  data: any[];
  alertMessage = null;
  userid = null;
  isadmin = 0;

  constructor(
    private api: APIService,
    private modalRxService: ModalRxService,
    private router: Router,
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
            document.getElementById('user-button').click();
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

  typeSelected(tabName) {
    if (tabName == 'users') {
      this.getUsers();
    }
    else if (tabName == 'alerttypes') {
      this.getAlertType();
    }
    else if (tabName == 'devicegroups') {
      this.getDeviceGroups();
    }
    else if (tabName == 'grouptotype') {
      this.getGroupToType();
    }
  }

  getUsers() {
    this.api.getUsers()
      .then(
        (result) => {
          if (result) {
            this.data = result;
            this.headers = this.headersUsers.slice(0);
            SharedService.sendIsLoadingStatus(false);
          }
        }
      ).catch(
        (exc) => {
          SharedService.sendAlertMessage(Messages.AlertError, Messages.AlertError + exc.message);
        }
      );
  }

  getAlertType() {
    this.api.getAlertType()
      .then(
        (result) => {
          if (result) {
            this.data = result;
            this.headers = this.headersAlertTypes.slice(0);
            SharedService.sendIsLoadingStatus(false);
          }
        }
      ).catch(
        (exc) => {
          SharedService.sendAlertMessage(Messages.AlertError, Messages.AlertError + exc.message);
        }
      );
  }

  getDeviceGroups() {
    this.api.getDeviceGroup()
      .then(
        (result) => {
          if (result) {
            this.data = result;
            this.headers = this.headersDeviceGroups.slice(0);
            SharedService.sendIsLoadingStatus(false);
          }
        }
      ).catch(
        (exc) => {
          SharedService.sendAlertMessage(Messages.AlertError, Messages.AlertError + exc.message);
        }
      );
  }

  getGroupToType() {
    this.api.getAlertTypeToGroup()
      .then(
        (result) => {
          if (result) {
            this.data = result;
            this.headers = this.headersGroupToType.slice(0);
            SharedService.sendIsLoadingStatus(false);
          }
        }
      ).catch(
        (exc) => {
          SharedService.sendAlertMessage(Messages.AlertError, Messages.AlertError + exc.message);
        }
      );
  }

  navigateToRoute(route) {
    console.log(route);
    this.router.navigate(['/' + route]);
  }

  onRowEditInit(data, index) {
    console.log(data, index);
    let row = data;
    const modalOptions = { initialState: { data: data } };
    this.modalRxService.showModalWithCallback(EditModal, modalOptions,
      (record) => {
        SharedService.sendIsLoadingStatus(true);
        switch (this.currentTab) {
          case 'users':
            this.api.updateUser(record).then(
              () => {
                SharedService.sendAlertMessage(Messages.AlertSuccess, Messages.ActionSucceeded);
                this.typeSelected(this.currentTab);
              }).catch(
                (exc) => {
                  SharedService.sendAlertMessage(Messages.AlertError, Messages.AlertError + " - " + exc.message);
                }
              ).finally(() => {
                SharedService.sendIsLoadingStatus(false);
              });
            break;
          case 'alerttypes':
            record.rules = JSON.parse(record.rules);
            this.api.updateAlertTypes(record).then(
              () => {
                SharedService.sendAlertMessage(Messages.AlertSuccess, Messages.ActionSucceeded);
                this.typeSelected(this.currentTab);
              }).catch(
                (exc) => {
                  SharedService.sendAlertMessage(Messages.AlertError, Messages.AlertError + " - " + exc.message);
                }
              ).finally(() => {
                SharedService.sendIsLoadingStatus(false);
              });
            break;
          case 'devicegroups':
            this.api.updateDeviceGroups(record).then(
              () => {
                SharedService.sendAlertMessage(Messages.AlertSuccess, Messages.ActionSucceeded);
                this.typeSelected(this.currentTab);
              }).catch(
                (exc) => {
                  SharedService.sendAlertMessage(Messages.AlertError, Messages.AlertError + " - " + exc.message);
                }
              ).finally(() => {
                SharedService.sendIsLoadingStatus(false);
              });
            break;
        }
      }
    );
  }

  onDeleteRow(data, index) {
    const modalOptions = { initialState: { message: Messages.ExclusionConfirmationMessage } };
    this.modalRxService.showModalWithCallback(ConfirmationModal, modalOptions,
      (proceed) => {
        if (proceed) {
          SharedService.sendIsLoadingStatus(true);
          if (this.currentTab == 'users') {
            this.api.deleteUserById(this.data[index].id).then(
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
          else if (this.currentTab == 'alerttypes') {
            this.api.deleteAlertTypeById(this.data[index].id).then(
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
          else if (this.currentTab == 'devicegroups') {
            this.api.deleteDeviceGroupById(this.data[index].id).then(
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
          else if (this.currentTab == 'grouptotype') {
            this.api.deleteGroupToTypeById(this.data[index].id).then(
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
    if (this.currentTab == 'grouptotype') {
      let modalOptions = {}
      let userList =  await this.api.getUsers();
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
       let alertType =  await this.api.getAlertType();
       let deviceGroup =  await this.api.getDeviceGroup();
        modalOptions= {  initialState: { columns:[
          {"name": 'Alert Type', 'labelname':'typealias', 'dropdownlist': alertType},
          {"name": 'Device Group', 'labelname':'groupname','dropdownlist': deviceGroup}
        ]
        }};
      }
      this.modalRxService.showModalWithCallback(CreationModal, modalOptions,
        (newRecord) => {
          if (newRecord) {
            SharedService.sendIsLoadingStatus(true);
            let body = this.formatNewGroupToTypeObject(newRecord);
            console.log(body);
            this.api.createGroupToType(body).then (
              (result => {
                this.typeSelected( this.currentTab);
                SharedService.sendIsLoadingStatus(false);
                SharedService.sendAlertMessage(Messages.AlertSuccess, Messages.CreationSuccessMessage);
              }),
              (error => {
                SharedService.sendAlertMessage(Messages.AlertError, Messages.AlertError + error.message);
                SharedService.sendIsLoadingStatus(false);
              }),
            );
          }
        });
    }
    else {
      let modalOptions = { initialState: { data: {} } };
      if (this.currentTab == 'users') {
        modalOptions.initialState.data = { id: null, username: null, email: null, phone: null };
      }
      else if (this.currentTab == 'alerttypes') {
        modalOptions.initialState.data = { id: null, typename: null, typealias: null, rules: null, description: null };
      }
      else if (this.currentTab == 'devicegroups') {
        modalOptions.initialState.data = { id: null, groupname: null, location: null, provider: null, description: null };
      }
      this.modalRxService.showModalWithCallback(EditModal, modalOptions,
        (newRecord) => {
          if (newRecord && this.currentTab == 'users') {
            SharedService.sendIsLoadingStatus(true);
            let body = this.formatNewUserObject(newRecord);
            console.log(body);
            this.api.createUser(body).then(
              (result => {
                this.typeSelected(this.currentTab);
                SharedService.sendIsLoadingStatus(false);
                SharedService.sendAlertMessage(Messages.AlertSuccess, Messages.CreationSuccessMessage);
              }),
              (error => {
                SharedService.sendAlertMessage(Messages.AlertError, Messages.AlertError + error.message);
                SharedService.sendIsLoadingStatus(false);
              }),
            );
          }
          else if (newRecord && this.currentTab == 'devicegroups') {
            SharedService.sendIsLoadingStatus(true);
            let body = this.formatNewDeviceGroupObject(newRecord);
            console.log(body);
            this.api.createDeviceGroup(body).then(
              (result => {
                this.typeSelected(this.currentTab);
                SharedService.sendIsLoadingStatus(false);
                SharedService.sendAlertMessage(Messages.AlertSuccess, Messages.CreationSuccessMessage);
              }),
              (error => {
                SharedService.sendAlertMessage(Messages.AlertError, Messages.AlertError + error.message);
                SharedService.sendIsLoadingStatus(false);
              }),
            );
          }
          else if (newRecord && this.currentTab == 'alerttypes') {
            SharedService.sendIsLoadingStatus(true);
            let body = this.formatNewAlertTypeObject(newRecord);
            console.log(body);
            this.api.createAlertType(body).then(
              (result => {
                this.typeSelected(this.currentTab);
                SharedService.sendIsLoadingStatus(false);
                SharedService.sendAlertMessage(Messages.AlertSuccess, Messages.CreationSuccessMessage);
              }),
              (error => {
                SharedService.sendAlertMessage(Messages.AlertError, Messages.AlertError + error.message);
                SharedService.sendIsLoadingStatus(false);
              }),
            );
          }
        });
    }
  }

  formatNewUserObject(newRecord){
    return {
      "username": newRecord?.username,
      "email": newRecord?.email,
      "phone": newRecord?.phone
    };
  }

  formatNewAlertTypeObject(newRecord){
    return {
      "description": newRecord?.description,
      "rules": JSON.parse(newRecord?.rules),
      "typealias": newRecord?.typealias,
      "typename":  newRecord?.typename
    };
  }

  formatNewDeviceGroupObject(newRecord){
    return {
      "description": newRecord?.description,
      "location": newRecord?.location,
      "groupname": newRecord?.groupname,
      "provider":  newRecord?.provider
    };
  }
   
  formatNewGroupToTypeObject(newRecord){
    return {
      "devicegroupid": newRecord?.groupname?.id,
      "alerttypeid": newRecord?.typealias?.id
    };
  }

  formatNewSubscriptionObject(newRecord) {
    return {
      "userid": newRecord?.username?.id,
      "channelid": newRecord?.channelname?.id,
      "frequencyid": newRecord?.frequencyname?.id
    };
  }

  formatNewUserToAlertObject(newRecord) {
    return {
      "userid": newRecord?.username?.id,
      "grouptotypeid": newRecord?.grouptotype?.id,
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

    if (evt) {
      evt.currentTarget.className += " active";
    }
    this.typeSelected(this.currentTab);
  }

}
