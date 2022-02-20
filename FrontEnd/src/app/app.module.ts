import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { FormsModule  } from '@angular/forms'; 
import {TableModule} from 'primeng/table';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CreationModal} from './modals/creation-modal/creation-modal';
import { EditModal } from './modals/edit-modal/edit-modal'
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import {DropdownModule} from 'primeng/dropdown';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {CheckboxModule} from 'primeng/checkbox';


import {FileUploadModule} from 'primeng/fileupload';
import {HttpClientModule} from '@angular/common/http';
import {SidebarModule} from 'primeng/sidebar';
import { APIService } from './services/api.service'
import { ManageEntityComponent } from './pages/manage-entity/manage-entity.component';
import { UserSettingsComponent } from './pages/user-settings/user-settings.component';
import Amplify, { Auth } from 'aws-amplify';
import awsconfig from '../aws-exports';
import { AmplifyUIAngularModule } from '@aws-amplify/ui-angular';
import { AuthenticationComponent } from './pages/authentication-page/authentication.component';
import {AmplifyService} from 'aws-amplify-angular';

Amplify.configure(awsconfig);


@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    AuthenticationComponent,
    ManageEntityComponent,
    UserSettingsComponent,
    CreationModal,
    EditModal
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    TableModule,
    FormsModule,
    NgbModule,
    DropdownModule,
    BrowserAnimationsModule,
    CheckboxModule,
    FileUploadModule,
    HttpClientModule,
    SidebarModule,
    AmplifyUIAngularModule
  ],
  providers: [BsModalRef, BsModalService, APIService,AmplifyService],
  bootstrap: [AppComponent],
  entryComponents: [CreationModal, EditModal]
})
export class AppModule { }
