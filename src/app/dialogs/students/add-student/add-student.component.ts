// alert examples to look at
// https://jasonwatmore.com/post/2020/07/16/angular-10-alert-notifications-example

import { AfterViewInit, Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Observer, Subscription, fromEvent, merge, of } from 'rxjs';
import { map, mapTo, startWith, takeUntil, takeWhile } from 'rxjs/operators';
import { NextKin, Applications, SponsorDetails, Student, StudentType, Study, TempStudent } from 'src/app/interfaces/student';
import { ApplicationService } from 'src/app/services/application.service';
import { BankService } from 'src/app/services/bank.service';
import { NextkinService } from 'src/app/services/nextkin.service';
import { StudentService } from 'src/app/services/student.service';
import { StudyService } from 'src/app/services/study.service';
import { UtilityService } from 'src/app/services/utility.service';
import { DateAdapter, MatDateFormats, MAT_DATE_FORMATS, NativeDateAdapter, ThemePalette } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from 'src/app/utilities/format-datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { KpClientService } from 'src/app/services/kp-client.service';
import { UserService } from 'src/app/services/user.service';
import { PaystackService } from 'src/app/services/paystack.service';
import { StudyPipe } from 'src/app/pipes/study.pipe';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { EmailService } from 'src/app/services/email.service';
import {DepartmentalService} from "../../../services/departmental.service";
// import 'rxjs/add/observable/fromEvent'


@Component({
  selector: 'app-add-student',
  templateUrl: './add-student.component.html',
  styleUrls: ['./add-student.component.css'],
  providers: [StudyPipe, EmailService,
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ]
})
export class AddStudentComponent implements AfterViewInit {
  subscriptionCreationStatus: Subscription;
  action = '';
  local_data: any;
  selectedFoundationNo = '';
  selectedStudent: Partial <Student> = {};
  selectedTempStudent: Partial <TempStudent> = {};
  selectedApplication: Partial <Applications> = {};
  selectedSponsorDetail: Partial <SponsorDetails> = {};
  selectedNextOfKin: Partial <NextKin> = {};
  selectedStudy: Partial <Study> = {};
  bankList: any[] = [];
  nextOfKinList: NextKin[] = [];
  studyList: Study[] = [];
  studentSaved = [false, false];
  emailCreated = [false, false];
  groupJoined = [false, false];
  timeExhauseted = false;
  isUpdates22 = false;
  isAnUpdates22 = false;
  isUpdates = false;
  isAnUpdates = false;
  progressMarker = false;
  alphabet = 'abcdefghijklmnopqrstuvwxyz';



  relationshipList = ['Father', 'Mother', 'Brother', 'Sister',
    'Son', 'Daughter', 'Husband', 'Wife',
    'Uncle', 'Aunt', 'Brother-In-Law', 'Sister-In-Law',
    'Father-In-Law', 'Mother-In-Law', 'Son-In-Law', 'Daughter-In-Law',
    'Cousin', 'Neice',
    'Nephew'];

  relationshipList2 = ['SELF', 'CORPORATE SPONSOR', 'FATHER',
    'MOTHER', 'BROTHER', 'SISTER',
    'SON', 'DAUGHTER', 'HUSBAND', 'WIFE',
    'UNCLE', 'AUNT', 'BROTHER-IN-LAW', 'SISTER-IN-LAW',
    'FATHER-IN-LAW', 'MOTHER-IN-LAW', 'SON-IN-LAW', 'DAUGHTER-IN-LAW',
    'COUSIN', 'NEICE',
    'NEPHEW'];
  Genders = [ 'M', 'F' ];
  Titles = ['MR', 'MRS', 'MS', 'DR', 'ALH', 'PAST',
    'REV', 'ELDER' ];
  ReligionList = ['CHRISTIANITY', 'ISLAM', 'TRADITIONAL'];
  MaritalStats = ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED' ];
  Levels = [100, 200, 300, 400, 500 ];
  buttonStatus = ['ADD', 'UPDATE', 'RESET', 'CANCEL'];
  displayedColumns2 = ['title', 'fullName',  'relationship', 'phone', 'email', 'action'];
  displayedColumns = ['studentType', 'jambNo', 'applicationNo' , 'programme', 'beginDate',
    'finishDate', 'certificateDate', 'status', 'action'];
  statusOfStudy = ['Applicant', 'Ongoing', 'Completed', 'Abandoned', 'Deferred'];
  StatesList: any[] = [];
  NationalityList: any[] = [];
  departmentList: any[] = [];
  editingDoneMarker = false;
  studentTypeList: StudentType[] = [];
  tempStudentTypeList: number[] = [];
  dataSource2 = new MatTableDataSource<NextKin>();
  dataSource = new MatTableDataSource<Study>();
  sessionList: string[] = [];
  appList: Applications[] = [];
  appList2: Applications[] = [];
  alreadyStudyingList: Study[] = [];
  stateCtrl = new FormControl();
  filteredStates: Observable<Applications[]>;
  globalIndex = 0;
  syncDone = false;
  syncClicked = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 50;
  syncedB4 = false;
  errorCount = 0;
  // onlineStatus$: Observable<boolean>;
  checkinterent: any = true;
  onlineEvent: Observable<Event>;
  offlineEvent: Observable<Event>;
  subscriptions: Subscription[] = [];

  connectionStatusMessage: string;
  connectionStatus: string;

  searchingMarker = false;
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;
  @ViewChild(MatPaginator)
  paginator2!: MatPaginator;
  @ViewChild(MatSort)
  sort2!: MatSort;
  // @ViewChild(MatPaginator) paginator3: MatPaginator;
  // @ViewChild(MatSort) sort3: MatSort;
  constructor(
    private studyPipe: StudyPipe,

    private studentService: StudentService,
    private bankService: BankService,
    private departmentService: DepartmentalService,
    private utilityService: UtilityService,
    public nextofKinService: NextkinService,
    private applicationService: ApplicationService,
    private studyService: StudyService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<AddStudentComponent>,
    private korotePayService: KpClientService,
    private userService: UserService,
    private payStackService: PaystackService,
    private emailService: EmailService,

    // @Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: string) {
    this.applicationService.applicationList.subscribe(
      data => {
        if (data) {
          this.appList2 = data;
          this.getUsedJAMB();


        }
        // console.log("APPLICATION:::", data);
      }
    );
    this.selectedStudy.jambNo = (this.selectedStudy.jambNo ? this.selectedStudy.jambNo : '' );
    this.filteredStates = this.stateCtrl.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.jambNo),
        map(state => (state ? this._filterStates(state) : this.appList.slice()))
      );

    // this.getUsedJAMB();

    // this.emailService.checkStatus();

  }

  ngAfterViewInit() {
    this.loadNextOfKin();

  }
  ngOnDestroy(){
    if (this.emailService.subscriptionCheckStatus) {this.emailService.subscriptionCheckStatus.unsubscribe();
                                                    if (this.emailService.id) {
        clearInterval(this.emailService.id);
      }

    }
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    // this.subscriptionCreateEmail.unsubscribe();
    // this.subscriptionJoinGroup.unsubscribe();
  }
  // ngOnDestroy(){
  //   this.subscriptionCreationStatus.unsubscribe
  // }

  filterListForUsed(avaiableStudy: Study[], fullList: Applications[]): any[] {
    const answer: Applications[] = [];
    for (let i = 0 ; i < fullList.length ; i++)
    {
      const aCheck = this.studyPipe.transform(avaiableStudy, fullList[i]);
      if (!aCheck || aCheck.length === 0)
      {
        answer.push(fullList[i]);
      }

    }
    return answer;
  }

  showCreationStatus(save: boolean, email: boolean, group: boolean): boolean {
    let answer = false;
    if (email && !this.emailCreated) {answer = true; }
    if (group && !this.groupJoined) {answer = true; }
    return answer;
  }
  checkSuccessofEmailOp(setOfArray: any[]): boolean {
    let answer = false;
    try {
      const stud = this.selectedStudent as Student;
      answer = setOfArray[0].includes(stud.studentNo) ? true : false;
    }
    catch (e) {}
    return answer;
  }




// therichpost$() {
//   return merge<boolean>(
//     fromEvent(window, 'offline').pipe(map(() => false)),
//     fromEvent(window, 'online').pipe(map(() => true)),
//     new Observable((sub: Observer<boolean>) => {
//       sub.next(navigator.onLine);
//       sub.complete();
//     }));
// }

  ngOnInit(): void {
    this.checkinterent = navigator.onLine ?  true : false;
    // this.therichpost$().subscribe(isOnline => this.checkinterent = isOnline);
    // this.onlineStatus$ = merge(
    //   of(navigator.onLine),
    //   fromEvent(window, 'online').pipe(mapTo(true)),
    //   fromEvent(window, 'offline').pipe(mapTo(false))
    //  );

    this.onlineEvent = fromEvent(window, 'online');
    this.offlineEvent = fromEvent(window, 'offline');

    this.subscriptions.push(this.onlineEvent.subscribe(e => {
      this.connectionStatusMessage = 'Back to online';
      this.checkinterent = true;
      console.log('Online...');
    }));

    this.subscriptions.push(this.offlineEvent.subscribe(e => {
      this.connectionStatusMessage = 'Connection lost! You are not connected to internet';
      this.checkinterent = false;
      console.log('Offline...');
    }));


    this.subscriptionCreationStatus = this.emailService.responseEmail
      // .pipe(takeUntil(value => value.emailDone && value.groupDone )
      .subscribe((data) => {
        if (data && data.emailSentStatus[0]){
          // this.emailCreated[1] = true;
          this.emailCreated[1] = this.checkSuccessofEmailOp(data.emailSentStatus);
          this.groupJoined[0] = true;

        }
        if (data && data.emailGroupStatus[0]){
          this.groupJoined[1] = this.checkSuccessofEmailOp(data.emailGroupStatus);
        }

      });

    this.loadNextOfKin();
    this.studentService.getStudentType().subscribe(
      (data) => {
        if (data){

          this.studentTypeList = data;

        }
      }
    );

    this.dialogRef.beforeClosed().subscribe(
      () => {
        this.studentService.deleteTempStudent(this.selectedTempStudent as TempStudent);
        this.closeDialog();

      }
    );
    this.applicationService.getNigeriaStates().subscribe((states)=> {
        this.StatesList = states;
    });

    // this.NationalityList = this.applicationService.getNationalities();
    this.applicationService.getNationalities().subscribe(
      (data) => {
        if (data && data.length > 0 )
        {this.NationalityList = data; }

      }
    );
    // this.bankList = this.bankService.getAllBanks();
    this.bankService.getAllBanks().subscribe(
      (data) => {
        if (data && data.length > 0 )
        {this.bankList = data; }

      }
    );
     this.utilityService.generateSessionList().subscribe(
        (sessions) => {
            if (sessions && sessions.length > 0 ){
                this.sessionList = sessions;
            }});
    //this.departmentList = this.applicationService.getProgrammes();
    this.departmentService.getProgrammes().subscribe(
      (data) => {
        if (data && data.length > 0 )
        {this.departmentList = data; }

      }
    );
    this.checkIfStudyExists();
    // this.nextofKinService.loadStudentNextOfKin2();


    this.setStudentInfo();
  }

  pinDepartment(): void {
    this.selectedStudent.programme =
      this.selectedStudy.programme ? this.selectedStudy.programme : this.selectedStudent.programme ;
  }

  closeDialog(){
    this.dialogRef.close({data: this.local_data});
    console.log('CLOSE DIALOG TRIGGERED');

  }

  public AutomateProcess(): void {
    // filter the applicant

    // create student

    // set the study

    // set the next of kin
  }

  doSave(): void {
    // if this is an auto case
    // this.onlineStatus = navigator.onLine ?  true : false;
    this.doAutoAddStudent();
  }

  doAutoAddStudent(): void {
    this.progressMarker = true;

    // console.log('THE DOB', this.selectedStaff.dOB);
    // console.log('THE DOB', new Date(this.selectedStaff.dOB));
    this.selectedStudent.staffIn = this.userService.getUser();
    this.selectedStudy.staffIn = this.userService.getUser();


    // console.log("SEE STUDENT:::", this.selectedStudent);
    // console.log("SEE STUDY:::", this.selectedStudy);
    this.studentSaved[0] = true;
    this.studentService.setStudent(this.selectedStudent as Student, this.selectedStudy as Study, this.nextOfKinList,
      this.selectedSponsorDetail as SponsorDetails)
      .subscribe((data: number) => {
        if (data) {
          this.studentService.newStudentMarker.next(2);
          this.studentSaved[1] = true;
          this.emailCreated[0] = true;
          // create student email
          this.emailService.sendNewStudentData(new Array (this.selectedStudent as Student)); // forward to create

          this.editingDoneMarker = true;
          const message = 'SUCCESS: STUDENT RECORD CREATED!';
          this.progressMarker = false;
          this.openSnackBar(message, 'close');

        }
      });
  }

  async doAutoAddStudent2() {
    this.progressMarker = true;

    // console.log('THE DOB', this.selectedStaff.dOB);
    // console.log('THE DOB', new Date(this.selectedStaff.dOB));
    this.selectedStudent.staffIn = this.userService.getUser();
    this.selectedStudy.staffIn = this.userService.getUser();


    console.log('SEE STUDENT:::', this.selectedStudent);
    console.log('SEE STUDY:::', this.selectedStudy);
    this.studentSaved[0] = true;
    // this.studentService.setStudent(this.selectedStudent as Student, this.selectedStudy as Study, this.nextOfKinList,
    //   this.selectedSponsorDetail as SponsorDetails)
    // .subscribe(async (data: number) => {
    const data = await this.studentService.setStudent2(this.selectedStudent as Student, this.selectedStudy as Study, this.nextOfKinList,
      this.selectedSponsorDetail as SponsorDetails);
    if (data) {
      this.studentSaved[1] = true;
      this.emailCreated[0] = true;
      // create student email
      await this.emailService.sendNewStudentData(new Array (this.selectedStudent as Student)); // forward to create

      this.editingDoneMarker = true;
      const message = 'SUCCESS: STUDENT RECORD CREATED!';
      this.progressMarker = false;
      this.openSnackBar(message, 'close');
    }
    // });
  }



  setStudentInfo(): void {
    this.selectedStudy.jambNo = '';
  }

  setStudyInfoPrompt(): void {
    this.selectedStudent.studentNo = '';
    this.searchingMarker = true;
    this.setStudyInfo();
    this.searchingMarker = false;

  }
  setStudyInfo(): void {
    console.log('SET STUDY INFO TRIGGERED');
    if (this.selectedApplication)
    {
      console.log('IN IF');

      this.selectedStudy.applicationNo =
        this.selectedApplication.applicationNo ? this.selectedApplication.applicationNo : '';

      this.selectedStudy.programme =
        this.selectedApplication.department1 ? this.selectedApplication.department1.toString().toUpperCase() : '';

      this.selectedStudy.studentType = 0;

      this.selectedStudy.status = 'Applicant';
      this.selectedStudy.beginSession = this.selectedApplication.beginSession;
      this.selectedStudy.finishSession = '';
      this.selectedStudy.jambNo = this.selectedApplication.jambNo;


      // student info loading
      this.selectedStudent.dOB = this.selectedApplication.dOB;
      this.selectedStudent.phone = this.selectedApplication.phone;
      this.selectedStudent.maritalStatus = this.selectedApplication.maritalStatus?.toString().toUpperCase();
      this.selectedStudent.email = this.selectedApplication.email;
      this.selectedStudent.nin = this.selectedApplication.nin;
      this.selectedStudent.phone = this.selectedApplication.phone;
      this.selectedStudent.level = 100;
      this.selectedStudent.studentType = this.selectedStudy.studentType;
      this.selectedStudent.programme = this.selectedStudy.programme;
      this.selectedStudent.title =
        this.selectedApplication.gender ? (this.selectedApplication.gender === 'M' ? 'MR' : 'MS') : '';
      this.selectedStudent.firstName = this.selectedApplication.firstName?.toString().toUpperCase();
      this.selectedStudent.lastName = this.selectedApplication.lastName?.toString().toUpperCase();
      this.selectedStudent.middleName = this.selectedApplication.middleName?.toString().toUpperCase();
      this.selectedStudent.gender = this.selectedApplication.gender;
      this.selectedStudent.religion = this.selectedApplication.religion?.toString().toUpperCase() ;
      this.selectedStudent.state = this.selectedApplication.state?.toString().trim().toUpperCase() ;
      this.selectedStudent.nationality = this.selectedApplication.nationality?.toString().trim().toUpperCase() ;
      this.selectedStudent.address = this.selectedApplication.address?.toString().toUpperCase() ;
      this.selectedStudent.activeStatus = true;
      this.korotePayService.getNextSessionResumptionDate()
        .subscribe((data) => {
          if (data) {
            this.selectedStudy.beginDate = data;

          }

        });




      console.log('STUDY', this.selectedStudy);
      console.log('APPLICATION', this.selectedApplication);
      if (!this.selectedStudent.studentNo || this.selectedStudent.studentNo === undefined || this.selectedStudent.studentNo === '' )
      { this.aNewStudentRef(); }

      // get studentNo
      // set temp Student Node




    }
  }

  setStudyInfoManual(): void {
    if (!this.selectedStudent.studentNo || this.selectedStudent.studentNo === undefined || this.selectedStudent.studentNo === '' )
    { this.aNewStudentRefManual(); }
  }

  public viewIndex(anIndex: number): void {
    console.log('THE INDEX::', anIndex);
  }

  getAPITUList(): void {
    this.errorCount = 0;
    this.syncClicked = true;
    this.mode = 'indeterminate';
    this.color = 'primary';
    this.syncedB4 = true;
    this.applicationService
      .loadStudentApplication(1).subscribe(data =>
    {
      if (data ) {
        this.syncDone = true;
        this.syncClicked = false;
        this.mode = 'determinate';
        this.value = 100;
        this.color = 'primary';

      }
      else {
        console.log('APPLIATIONS API GRAB ERROR');
        this.errorCount++;
        if (this.errorCount < 2) {
          this.applicationService
            .loadStudentApplication(0).subscribe(data =>
          {
            if (data ) {this.color = 'primary'; }
            else {
              console.log('ERROR WITH LOCAL GRABBNG APPLICATIONS');
              this.color = 'accent';
            }
            this.mode = 'determinate';
            this.value = 100;
            this.syncDone = true;
            this.syncClicked = false;

          }); }



      }
    });
    // ? '' : this.applicationService
    // .loadStudentApplication(0);

  }

  // generate new student number
  aNewStudentRefManual(): void {
    setTimeout( () => {
      this.studentService.getStudentNumber().subscribe((val) => {
        if (val) {
          this.selectedStudent.studentNo = this.utilityService.prepareNewID2(val, 9);
          this.selectedTempStudent.studentNo = this.selectedStudent.studentNo;
          this.studentService.setTempStudent(this.selectedTempStudent as TempStudent)
            .subscribe((val: any) => {
              if (val)
              {

                this.local_data = this.selectedStudent.studentNo ;
                console.log('AUTO ADD NEXT OF KIN');
                // this.autoAddNextOfKin();
                // this.autoAddStudy();
                console.log('STUDENT DATA:::', this.selectedStudent);

              }
            });

        }

      });


    }, 200);



  }


  // generate new student number
  aNewStudentRef(): void {
    setTimeout( () => {
      this.studentService.getStudentNumber().subscribe((val) => {
        if (val) {
          this.selectedStudent.studentNo = this.utilityService.prepareNewID2(val, 9);
          this.selectedTempStudent.studentNo = this.selectedStudent.studentNo;
          this.studentService.setTempStudent(this.selectedTempStudent as TempStudent)
            .subscribe((val: any) => {
              if (val)
              {

                this.local_data = this.selectedStudent.studentNo ;
                console.log('AUTO ADD NEXT OF KIN');
                this.autoAddNextOfKin();
                this.autoAddStudy();

              }
            });

        }

      });


    }, 200);



  }

  displayFn(applicant: Applications): string {
    console.log('THE INDEX::', applicant);
    // this.selectedApplication = applicant;
    console.log('THE APP::', this.selectedApplication);

    return applicant && applicant.jambNo ? applicant.jambNo : '';
  }

  private _filterStates(value: string): Applications[] {
    const filterValue = value.toLowerCase();

    return this.appList.filter(state =>
    {
      return state.jambNo.toString().toLowerCase().includes(filterValue)
        || state.lastName.toLowerCase().includes(filterValue)
        || state.firstName.toLowerCase().includes(filterValue)
        || state.department1.toLowerCase().includes(filterValue)
        || state.middleName.toLowerCase().includes(filterValue);

    });
  }

  checkIfStudyExists(): void {
    if (this.dataSource.data.length < 1) {
      this.isUpdates22 = true;

    }
  }

  getCorporateStatus(): boolean {
    return (this.selectedSponsorDetail.relationship as string === 'Corporate Sponsor' ? false : true);
  }

  checkMarried(): boolean {
    if (this.selectedStudent.maritalStatus !== 'SINGLE' && this.selectedStudent.gender === 'F') { return true; }
    else {return false; }
  }
  readyUpdates22(): void {
    // check to see if the number of next of kin is up to two
    if (this.checkNumberOfNOK() > 1) {
      this.openSnackBar('Only 2 Next of Kin allowed! Please remove one Next of Kin', 'close' );
    }

    else{
      this.isUpdates22 = true;
      this.clearNextOfKin();

    }


  }

  readyUpdates(): void {
    // check to see if the number of next of kin is up to two

    this.selectedApplication = {};
    this.isUpdates = true;
    this.clearStudy();




  }
  toggleUpdate22(): void {
    this.isAnUpdates22 = !this.isAnUpdates22;
    this.isUpdates22 = !this.isUpdates22;
  }

  toggleUpdate(): void {
    this.isAnUpdates = !this.isAnUpdates;
    this.isUpdates = !this.isUpdates;
  }

  openSnackBar(message: string, action: string | undefined): void {
    this.snackBar.open(message, action , {duration: 5000, });
  }

  checkNumberOfNOK(): number {
    const answer = this.dataSource2.data.length;
    // console.log("THE NUMBER OF NOK:::", answer);
    return answer;

  }

  editNextOfKin(i: number, aQualif: NextKin): void {
    // this.readyUpdates22();
    this.isAnUpdates22 = true;
    this.isUpdates22 = true;
    this.globalIndex = i;
    console.log('A ROW::::', aQualif);
    this.selectedNextOfKin = aQualif;
    // this.clearNextOfKin();
    // this.selectedNextOfKin.email = aQualif.email;
    // this.selectedNextOfKin.fullName = aQualif.fullName;
    // this.selectedNextOfKin.address = aQualif.address;

    // this.selectedNextOfKin.occupation = aQualif.occupation;
    // this.selectedNextOfKin.phone = aQualif.phone;
    // this.selectedNextOfKin.relationship = aQualif.relationship;
    // this.selectedNextOfKin.title = aQualif.title ;
    // this.selectedNextOfKin.creationStamp = aQualif.creationStamp;

    console.log('A ROW SELECTNEXTKIN::::', this.selectedNextOfKin);


  }

  editStudy(i: number, aQualif: Study): void {
    // this.readyUpdates22();
    this.isAnUpdates = true;
    this.isUpdates = true;
    // this.globalIndex = i;
    console.log('A ROW STUDY::::', aQualif);


    this.selectedStudy.beginDate = aQualif.beginDate;
    this.selectedStudy.finishDate = aQualif.finishDate;
    this.selectedStudy.studentType = aQualif.studentType;
    this.selectedStudy.programme = aQualif.programme;
    this.selectedStudy.applicationNo = aQualif.applicationNo;
    this.selectedStudy.status = aQualif.status;
    this.selectedStudy.jambNo = aQualif.jambNo;
    this.selectedStudy.finishDate = aQualif.finishDate;
    this.selectedStudy.certificateDate = aQualif.certificateDate;
    this.selectedStudy.creationStamp = aQualif.creationStamp;
    this.selectedStudy.staffIn = aQualif.staffIn;
    this.selectedStudy.IsDeleted = aQualif.IsDeleted;




    console.log('A ROW SELECTSTUDY::::', this.selectedStudy);


  }

  editNextOfKin1(i: number, aQualif: NextKin): void {


    // this.readyUpdates22();
    this.isAnUpdates22 = true;
    this.isUpdates22 = true;

    // this.clearNextOfKin();
    this.selectedNextOfKin.email = aQualif.email ? aQualif.email : '';
    this.selectedNextOfKin.fullName = aQualif.fullName ? aQualif.fullName : '';
    this.selectedNextOfKin.address = aQualif.address ? aQualif.address : '';

    this.selectedNextOfKin.occupation = aQualif.occupation ? aQualif.occupation : '';
    this.selectedNextOfKin.phone = aQualif.phone ? aQualif.phone : '';
    this.selectedNextOfKin.relationship = aQualif.relationship ? aQualif.relationship : '';
    this.selectedNextOfKin.title = aQualif.title ? aQualif.title : '';
    this.selectedNextOfKin.creationStamp = aQualif.creationStamp;

  }

  removeStudy(i: number, aQualif: Study): void {
    // this.nextofKinService.deleteStudentNextOfKin(this.selectedStudent.studentNo as string, aQualif, 1);
    this.studyList = [];
    this.dataSource.data = this.studyList;
    this.loadStudy();


  }

  removeNextOfKin(i: number, aQualif: NextKin): void {
    this.nextOfKinList.splice(i, 1);

    this.dataSource2.data = this.nextOfKinList;
    this.loadNextOfKin();
  }

  addNextOfKin(): void {
    if (this.checkNumberOfNOK() > 1) {
      this.openSnackBar('Only 2 Next of Kin allowed! Please remove one Next of Kin', 'close' );
    }

    else{

      this.nextOfKinList.push(this.selectedNextOfKin as NextKin);
      this.loadNextOfKin();
    }
  }

  autoAddStudy(): void {


    this.studyList = [];
    this.studyList.push(this.selectedStudy as Study);
    this.loadStudy();


  }

  generateIUFStudyNo(): string {
    let results = '';
    const dig3 = Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString();
    const dig2 = Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString();
    const dig1 = Math.floor(Math.random() * 10);
    const randomCharacter1 = this.alphabet[Math.floor(Math.random() * this.alphabet.length)];
    const randomCharacter2 = this.alphabet[Math.floor(Math.random() * this.alphabet.length)];
    const randomCharacter3 = this.alphabet[Math.floor(Math.random() * this.alphabet.length)];
    // format 2 digits- 2 letters-3 digits-1 letter total of 8
    results = dig2 + randomCharacter1.toUpperCase() + randomCharacter2.toUpperCase() +
      dig3 + randomCharacter3.toUpperCase();
    return results;
  }

  isFoundation(): boolean {
    let answer = false;
    if (this.selectedStudy.studentType === 6 ) {
      answer = true; }
    return answer;

  }
  checkForFoundation(): boolean {
    let answer = false;
    const isUnique: boolean[] = [false];
    let numberOfTime = 0;
    if (this.isFoundation() && (!this.isUpdates || this.selectedFoundationNo === '')) {
      this.selectedFoundationNo = this.generateIUFStudyNo();
      // check to see if this number is unique
      while (!isUnique[0] && numberOfTime < 5) {
        numberOfTime++;
        this.studyService.checkUniqueIDNo(this.selectedFoundationNo).subscribe(
          (isFound: number) =>
          {

            if (!isFound) {
              isUnique[0] = true;
              console.log('foundation no::');

            }else{this.selectedFoundationNo = this.generateIUFStudyNo(); }
          });
      } // end while loop
      console.log('foundation no::', this.selectedFoundationNo, numberOfTime);
      answer = true; }
    return answer;
  }

  addStudy(): void {
    if (this.studyList.length > 0) {
      // inform that old has to be deleted
      this.openSnackBar('Only 1 Applicant Study allowed! Please remove existing study', 'close' );

    }
    else {

      this.selectedStudy.jambNo = this.selectedStudy.studentType === 6  ? this.selectedFoundationNo : this.selectedApplication as string;
      this.studyList.push(this.selectedStudy as Study);
      this.loadStudy();
      this.selectedStudent.level = 100;
      this.selectedStudent.studentType = this.selectedStudy.studentType;
      this.selectedStudent.programme = this.selectedStudy.programme;

      this.selectedStudent.activeStatus = true;
      this.korotePayService.getNextSessionResumptionDate()
        .subscribe((data) => {
          if (data) {
            this.selectedStudy.beginDate = data;

          }

        });

      if (!this.selectedStudent.studentNo || this.selectedStudent.studentNo === '') {
        this.aNewStudentRefManual();
      }

    }

  }

  autoAddNextOfKin(): void {
    this.nextOfKinList = [];
    this.nextOfKinList.push(this.selectedApplication.guardians1 as NextKin);
    this.nextOfKinList.push(this.selectedApplication.guardians2 as NextKin);
    this.loadNextOfKin();
  }

  updateNextOfKin(): void {
    // let tempList = [];
    // console.log("NEXT OF KIN UPDATED:::", this.selectedNextOfKin);
    // tempList = this.nextOfKinList;
    this.nextOfKinList[this.globalIndex] = this.selectedNextOfKin as NextKin;
    // console.log("NEXT OF KIN nextOfKinList:::", this.nextOfKinList);
    // console.log("NEXT OF KIN tempList:::", tempList);
    // this.nextOfKinList = tempList;


    this.loadNextOfKin();
    // this.clearNextOfKin();
    this.toggleUpdate22();

    // this.nextofKinService.updateStudentNextOfKin(this.selectedStudent.studentNo as string,
    //   this.selectedNextOfKin as NextKin, 1).subscribe(
    //   (data) => {
    //     if (data !== undefined && data !== null) {
    //       this.loadNextOfKin();
    //       this.toggleUpdate22();
    //       // this.clearQualification();
    //     }
    //   }
    // );
  }
  updateStudy(): void {
    this.studyList[0] = this.selectedStudy as Study;
    this.loadStudy();
    this.toggleUpdate();
  }

  clearNextOfKin(): void {
    this.selectedNextOfKin.title = undefined;
    this.selectedNextOfKin.fullName = undefined;
    this.selectedNextOfKin.phone = undefined;
    this.selectedNextOfKin.address = undefined;
    this.selectedNextOfKin.occupation = undefined;
    this.selectedNextOfKin.relationship = undefined;
    this.selectedNextOfKin.email = undefined;

  }

  clearStudy(): void {
    this.selectedStudy.studentType = undefined;
    this.selectedStudy.programme = undefined;
    this.selectedStudy.beginDate = undefined;
    this.selectedStudy.jambNo = undefined;
    this.selectedStudy.status = undefined;
    this.selectedStudy.finishSession = undefined;
    this.selectedStudy.finishDate = undefined;

  }



  loadNextOfKin(): void {
    this.dataSource2.data = this.nextOfKinList;
    // this.dataSource2.connect();
    this.dataSource2.sort = this.sort2;
    this.dataSource2.paginator = this.paginator2;

  }

  loadStudy(): void {
    this.dataSource.data = this.studyList;
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

  }

  clearFilter(): void {this.selectedApplication = {}; }

  checkLoadedApplication(): boolean {
    if (this.selectedApplication === undefined    ) {return false; }
    else {return true; }
  }

  filterUsedJAMBNoApplication(originalApp: Applications[], usedJAMB: string[]): Applications[] {
    return originalApp.filter(app => !(usedJAMB.includes(app.jambNo)));

  }

  getUsedJAMB(): void {
    const answer: string[] = [];
    this.studyService.getStudyJAMBNo().subscribe((data: Study[]) => {
      if (data) {
        data.forEach(e => {
          e.jambNo ? answer.push(e.jambNo) : '';
        });
      }
      this.appList = this.filterUsedJAMBNoApplication(this.appList2, answer);


    });
  }


}

export interface EmailStatusInfo
{ emailSentStatus: number[]; emailGroupStatus: number[];
  emailDone: boolean; groupDone: boolean;
}
