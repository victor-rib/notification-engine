import { AfterViewInit, Component, OnInit } from '@angular/core';
import { SharedService } from './services/shared.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: []
})

export class AppComponent  implements OnInit {
  isLoading : boolean = false;
  alertMessage : string;

  ngOnInit(){
    SharedService.getIsLoadingStatus().subscribe((isLoading) => this.isLoading = isLoading);
    SharedService.getAlertMessage().subscribe((message) => { this.alertMessage = message});
  }
}
