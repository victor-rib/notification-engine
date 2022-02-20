// npm i @angular-devkit/build-angular@~0.901.6 --force

import { AfterViewInit, Component, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import * as Messages from '../../constants/Messages';
import { Router } from '@angular/router';
import {AmplifyService} from 'aws-amplify-angular';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'authentication-page',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})

export class AuthenticationComponent  {

  signedIn = false;
  redirectUrl = '/notifications';

  constructor(private amplifyService:AmplifyService, private router: Router, private zone: NgZone    )
  {
    SharedService.sendIsLoadingStatus(false);
    this.amplifyService.authStateChange$.subscribe(auth => {
      console.log(auth);
      switch (auth.state) {
        case 'signedIn':
          this.signedIn=true;
          if(this.redirectUrl.indexOf('notifications') >= 0){
            this.zone.run(() => {this.router.navigate(['/notifications']);});
          }
          else{
            window.location.replace(this.redirectUrl);
          }
        case 'signedOut':
          this.signedIn=false;
          this.redirectUrl = window.location.href
          break;
        default:
          this.signedIn=false;
      }
    });
  }
}
