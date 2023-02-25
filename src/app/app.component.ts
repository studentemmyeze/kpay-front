import { Component } from '@angular/core';
import { ApplicationService } from './services/application.service';
import { SettingsService } from './services/settings.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'KorotePay';


  constructor(private applicationService: ApplicationService , private settingsService: SettingsService) {
    // this.settingsService.getAPILastDownload()
    // .subscribe((aDate) => {});
    this.applicationService.loadStudentApplication(1);


  }


}
