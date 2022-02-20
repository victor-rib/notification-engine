import { environment } from '../../environments/environment';
import {HttpClient} from "@angular/common/http";
import { Notification } from '../entities/Notifications.js';
import { Injectable } from '@angular/core';
import { Subscription } from '../entities/Subscription';
import { UserToAlert } from '../entities/UserToAlert';
import { Users } from '../entities/Users';
import { Channel } from '../entities/Channel';
import { Frequency } from '../entities/Frequency';
import { AlertType } from '../entities/AlertType';
import { DeviceGroup } from '../entities/DeviceGroups';
import { AlertTypeToGroup } from '../entities/AlertTypeToGroup';

@Injectable()
export class APIService {

  private entityEndpoint = environment.apiurl+"/entity/";
  private userSettingsEndpoint = environment.apiurl+"/usersettings/";
  private notificationEndpoint = environment.apiurl+"/notifications/";
  private apiKeyHeader =  environment.apiKeyHeader;
  private customHeader = {headers : {'x-api-key': this.apiKeyHeader } };

  constructor(private http:HttpClient) {}

  async triggerAlerts() {
    return this.http.post(this.notificationEndpoint, {}, this.customHeader ).toPromise();
  }
  
  async checkUserPermission(email): Promise<any>{
    return this.http.get(this.userSettingsEndpoint+"?useremail="+email+"&usersettingstype=3", this.customHeader ).toPromise();
  }

  async getNotificationsByUser(userid) : Promise<Notification[]> {
    return this.http.get<Notification[]>(this.notificationEndpoint+"?userid="+userid, this.customHeader ).toPromise();
  }

  async deleteNotificationByDeviceIdAndType(deviceid, alerttypename) {
    console.log(deviceid, alerttypename);
    
    return this.http.delete(this.notificationEndpoint+"?deviceid="+deviceid+"&alerttype="+alerttypename, this.customHeader ).toPromise();
  }

  
  async getSubscriptionsByUser(userid) : Promise<Subscription[]> {    
    return this.http.get<Subscription[]>(this.userSettingsEndpoint+"?userid="+userid+"&usersettingstype=1", this.customHeader ).toPromise();
  }

  async deleteSubscriptionById(id) {
    console.log(id);
    return this.http.delete(this.userSettingsEndpoint+"?usersettingstype=1&usersettingstypeid="+id, this.customHeader ).toPromise();
  }

  
  async deleteUserById(id) {
    console.log(id);
    return this.http.delete(this.entityEndpoint+"?entitytype=1&entityid="+id, this.customHeader ).toPromise();
  }

  async deleteAlertTypeById(id) {
    console.log(id);
  
    return this.http.delete(this.entityEndpoint+"?entitytype=2&entityid="+id, this.customHeader ).toPromise();
  }

  
  async deleteDeviceGroupById(id) {
    console.log(id);
    return this.http.delete(this.entityEndpoint+"?entitytype=3&entityid="+id, this.customHeader ).toPromise();
  }
  
  async createSubscription(body) {
    return this.http.post(this.userSettingsEndpoint+"?usersettingstype=1", body, this.customHeader ).toPromise();
  }
  
  async createUser(body) {
    return this.http.post(this.entityEndpoint+"?entitytype=1", body, this.customHeader ).toPromise();
  }
  
  async createAlertType(body) {
    return this.http.post(this.entityEndpoint+"?entitytype=2", body, this.customHeader ).toPromise();
  }

  async createDeviceGroup(body) {
    return this.http.post(this.entityEndpoint+"?entitytype=3", body, this.customHeader ).toPromise();
  }
  
  
  async deleteGroupToTypeById(body) {
    return this.http.post(this.entityEndpoint+"?entitytype=6", body, this.customHeader ).toPromise();
  }

  async getUserToAlertByUser(userid) : Promise<UserToAlert[]> {
    return this.http.get<UserToAlert[]>(this.userSettingsEndpoint+"?userid="+userid+"&usersettingstype=2", this.customHeader ).toPromise();
  }

  async deleteUserToAlertById(id) {
    return this.http.delete(this.userSettingsEndpoint+"?usersettingstype=2&usersettingstypeid="+id, this.customHeader ).toPromise();
  }

  async createUserToAlert(body) {
    return this.http.post(this.userSettingsEndpoint+"?usersettingstype=2", body, this.customHeader ).toPromise();
  }
  
  async createGroupToType(body) {
    return this.http.post(this.entityEndpoint+"?entitytype=6", body, this.customHeader ).toPromise();
  }

  async updateAlertTypes(body) {
    return this.http.put(this.entityEndpoint+"?entitytype=2", body, this.customHeader ).toPromise();
  }

  async updateDeviceGroups(body) {
    return this.http.put(this.entityEndpoint+"?entitytype=3", body, this.customHeader ).toPromise();
  }

  async updateGroupToType(body) {
    return this.http.put(this.entityEndpoint+"?entitytype=6", body, this.customHeader ).toPromise();
  }

  async updateUser(body) {
    return this.http.put(this.entityEndpoint+"?entitytype=1", body, this.customHeader ).toPromise();
  }

  async getUsers(): Promise<Users[]>  {
    return this.http.get<Users[]>(this.entityEndpoint+"?entitytype=1", this.customHeader ).toPromise();
  }

  async getChannels(): Promise<Channel[]>  {
    return this.http.get<Channel[]>(this.entityEndpoint+"?entitytype=4", this.customHeader ).toPromise();
  }

  async getFrequency(): Promise<Frequency[]>  {
    return this.http.get<Frequency[]>(this.entityEndpoint+"?entitytype=5", this.customHeader ).toPromise();
  }

  
  async getAlertTypeToGroup(): Promise<AlertTypeToGroup[]>  {
    return this.http.get<AlertTypeToGroup[]>(this.entityEndpoint+"?entitytype=6", this.customHeader ).toPromise();
  }

  async getAlertType(): Promise<AlertType[]>  {
    return this.http.get<AlertType[]>(this.entityEndpoint+"?entitytype=2", this.customHeader ).toPromise();
  }

  async getDeviceGroup(): Promise<DeviceGroup[]>  {
       return this.http.get<DeviceGroup[]>(this.entityEndpoint+"?entitytype=3", this.customHeader ).toPromise();
  }
}