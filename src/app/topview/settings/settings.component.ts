import { Component, OnInit } from '@angular/core';
import { KpClientService } from 'src/app/services/kp-client.service';
import { StudentService } from 'src/app/services/student.service';
import { UserService } from 'src/app/services/user.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  selectedGuest: string;
  Genders = [ 'M', 'F'  ];
  Titles = ['Mr', 'Mrs', 'Ms', 'Dr', 'Alh', 'Prof', 'Past',
'Rev' ];
  matricStatus = '';
  sessionList: string[] = [];
  selectedSession = '';
  roomSettingState = [0, 0, 0];
  barSettingState = [0, 0];
  kitchenSettingState = [0, 0];

  userSettingState = [0, 0, 0];
  generalSettingState = [];
  currentSession = 'error'
  currentResumptionDate: Date;
  nextResumptionDate: Date;
  matricDate: Date;
  minDate : Date;
  maxDate: Date;
  promoteMarker = true;
  promoteClicked = false;



  addRoomMarker = false;
  addUserMarker = false;
  constructor(
    private userService: UserService,
    private utilityService: UtilityService,
    private kpClient: KpClientService,
    private studentService: StudentService
  ) { }

  ngOnInit(): void {
    this.sessionList = this.utilityService.generateSessionList();
    this.kpClient.getCurrentSession().subscribe((data)=> {
      if (data) {
        this.currentSession = data;
        const tempSessionList = [];
        const index = this.sessionList.indexOf(data);
        if (index) {
          for(let i=index+1; i < this.sessionList.length; i++) {
            tempSessionList.push(this.sessionList[i]);
          }
          this.sessionList = tempSessionList;
        }

        console.log('AT SETTINGS. SESSION CURRENT', this.currentSession);
      }
    });

    this.checkMatricStatus();

    this.kpClient.getNextSessionResumptionDate()
    .subscribe(data => {
      if (data) {
        this.currentResumptionDate = data;
        this.minDate = data;
        // console.log('MIN DATE::', this.minDate)
        var d = new Date();
        var year = d.getFullYear();
        var month = d.getMonth();
        var day = d.getDate();
        this.maxDate = new Date(year + 2, month, day);
      }
    });


      }

  mariculateStudents(): void {
    // let matricD = new Date(this.matricDate)
    this.kpClient.setCurrentSessionMatricStatus(this.matricDate).subscribe(
      data => {
        if (data) {
          this.checkMatricStatus();
        }

      }

    );
  }

  checkMatricStatus(): void {
    this.kpClient.getCurrentSessionMatricStatus().subscribe(
      data => {
        this.matricStatus = data ? 'YES' : 'PENDING';
        if (data) {

          this.matricDate = new Date(data)
          this.kpClient.getMatriculationDate()
          .subscribe(data => {
            if (data) {
              this.matricDate = new Date(data)
            }
          });
        }

      }

    );
  }

  enablePromote(): boolean {
    if (this.selectedSession != '' && this.nextResumptionDate && !this.promoteClicked)
    {return true;}

    else {return false;}

  }

  enableMatric(): boolean {
    if (this.matricDate && this.matricStatus !== 'YES')
    {return true;}

    else {return false;}

  }

  promoteStudents(): void {
    console.log('THE RESUMPTION DATE', this.nextResumptionDate);
    this.kpClient.setCurrentSession(this.selectedSession, this.nextResumptionDate)
    .subscribe(
      (data => {
        if (data) {
          this.currentSession = this.selectedSession;
          this.promoteClicked = true;
          this.studentService.promoteStudent();

        }
      })
    );



    // edit current session- set the currentSession to false;
    // create a new sessionInfo
    // set the matricStatus to 0
    // set currentSession to true
  }
  resetSettingsMarker(): void {
    this.roomSettingState = [0, 0];
  }

  // onAddRoomClick(): void {
  //   this.addRoomMarker = !this.addRoomMarker;
  //   this.roomSettingState = [0, 0, 0];

  //   this.roomSettingState[0] = 1;
  //   console.log('addRoomMarker: ', this.addRoomMarker);
  // }

  onChangeRoomSettingsClick(): void {
    this.roomSettingState = [0, 0, 0];

    this.roomSettingState[2] = 1;


  }
  onChangeRoomTimeSettingsClick(): void {
    // this.addRoomMarker = !this.addRoomMarker;
    this.roomSettingState = [0, 0, 0];

    this.roomSettingState[0] = 1;
    console.log('addRoomMarker: ', this.addRoomMarker);
  }

  onChangeRoomClick(): void {
    this.roomSettingState = [0, 0, 0];

    this.roomSettingState[1] = 1;


  }


  onAddUserClick(): void {
    this.userSettingState = [0, 0, 0];

    this.userSettingState[0] = 1;


  }
  onChangeUserClick(): void {
    this.userSettingState = [0, 0, 0];

    this.userSettingState[1] = 1;

  }

  onChangeUserSettingsClick(): void {
    this.userSettingState = [0, 0, 0];

    this.userSettingState[2] = 1;

  }

  onChangeDishClick(): void {
    this.kitchenSettingState = [0, 0];

    this.kitchenSettingState[0] = 1;

  }

  onChangeDrinkClick(): void {
    this.barSettingState = [0, 0];

    this.barSettingState[0] = 1;

  }

  onChangeDrinkSettingsClick(): void {
    this.barSettingState = [0, 0];

    this.barSettingState[1] = 1;

  }

  onChangeDishSettingsClick(): void {
    this.kitchenSettingState = [0, 0];

    this.kitchenSettingState[1] = 1;

  }





  ngAfterViewInit(): void {

  }



  ngOnDestroy(): void {


  }

  isAllowed(aLink: string): boolean {
    let answerReturned = false;
    const level = this.userService.getLevel();
    const answer = (/MANAGER/i).test(level);
    if (answer) {
      if (aLink === 'bar' && (/BAR/i).test(level)) {answerReturned = true; }
      if (aLink === 'restaurant' && (/restaurant/i).test(level)) {answerReturned = true; }
      if (aLink === 'room' && (/frontdesk/i).test(level)) {answerReturned = true; }



    }

    const answer2 = (/ADMINISTRATOR/i).test(level);
    if (answer2) {
      answerReturned = true;
      if (aLink === 'general') {answerReturned = false; }

    }

    // return answerReturned;
    return true;

  }


}
