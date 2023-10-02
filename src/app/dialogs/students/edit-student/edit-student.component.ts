import { AfterViewInit, Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
// import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarModule,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';


import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { NextKin, Applications, SponsorDetails, Student, StudentType, Study, TempStudent } from 'src/app/interfaces/student';
import { ApplicationService } from 'src/app/services/application.service';
import { BankService } from 'src/app/services/bank.service';
import { NextkinService } from 'src/app/services/nextkin.service';
import { StudentService } from 'src/app/services/student.service';
import { StudyService } from 'src/app/services/study.service';
import { RawUtil, UtilityService } from 'src/app/services/utility.service';
import { DateAdapter, MatDateFormats, MAT_DATE_FORMATS, NativeDateAdapter, ThemePalette } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from 'src/app/utilities/format-datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { KpClientService } from 'src/app/services/kp-client.service';
import { UserService } from 'src/app/services/user.service';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { StudyPipe } from 'src/app/pipes/study.pipe';
import {DepartmentalService} from "../../../services/departmental.service";



@Component({
  selector: 'app-edit-student',
  templateUrl: './edit-student.component.html',
  styleUrls: ['./edit-student.component.css'],
  providers: [StudyPipe,
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ]
})
export class EditStudentComponent implements AfterViewInit {
  action:string = '';
  local_data:any;
  selectedStudent: Partial <Student> = {};
  selectedTempStudent: Partial <TempStudent> = {};
  selectedApplication: Partial <Applications> = {};
  selectedApplication2: Partial <Applications> = {};
  selectedSponsorBank: Partial <SponsorDetails> = {};
  selectedNextOfKin: Partial <NextKin> = {};
  selectedStudy: Partial <Study> = {};
  bankList: any[] = [];
  nextOfKinList: NextKin[] = [];
  studyList: Study[] = [];

  isUpdates22 = false;
  isAnUpdates22 = false;
  isUpdates = false;
  isAnUpdates = false;
  progressMarker = false;
  aStudyUpdate = true;

  relationshipList = ['Father', 'Mother', 'Brother', 'Sister',
    'Son', 'Daughter', 'Husband', 'Wife',
    'Uncle', 'Aunt','Brother-In-Law', 'Sister-In-Law',
    'Father-In-Law', 'Mother-In-Law', 'Son-In-Law', 'Daughter-In-Law',
    'Cousin', 'Neice',
    'Nephew'];

  relationshipList2 = ['SELF', 'CORPORATE SPONSOR', 'FATHER',
    'MOTHER', 'BROTHER', 'SISTER',
    'SON', 'DAUGHTER', 'HUSBAND', 'WIFE',
    'UNCLE', 'AUNT','BROTHER-IN-LAW', 'SISTER-IN-LAW',
    'FATHER-IN-LAW', 'MOTHER-IN-LAW', 'SON-IN-LAW', 'DAUGHTER-IN-LAW',
    'COUSIN', 'NEICE',
    'NEPHEW'];
  Genders = [ 'M', 'F' ];
  Titles = ['MR', 'MRS', 'MS', 'DR', 'PROF', 'ENGR', 'ARCH', 'BARR', 'ALH', 'PAST',
    'REV', 'ELDER'];
  ReligionList = ['CHRISTIANITY', 'ISLAM', 'TRADITIONAL']
  MaritalStats = ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED' ];
  Levels = [100, 200, 300, 400, 500 ];
  buttonStatus = ['ADD', 'UPDATE', 'RESET', 'CANCEL'];
  displayedColumns2 = ['title', 'fullName',  'relationship', 'phone', 'email', 'action'];
  displayedColumns = ['studentType', 'jambNo', 'applicationNo' , 'programme', 'beginDate',
    'finishDate', 'certificateDate', 'status', 'action'];
  statusOfStudy = ['Applicant', 'Ongoing', 'Completed', 'Abandoned', 'Deferred'];

  alphabet = "abcdefghijklmnopqrstuvwxyz";

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
  stateCtrl = new FormControl();
  filteredStates: Observable<Applications[]>;
  globalIndex = 0;
  selectedFoundationNo = "";
  syncDone = false;
  syncClicked = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 50;
  syncedB4 = false;
  errorCount = 0;
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
    public dialogRef: MatDialogRef<EditStudentComponent>,
    private korotePayService: KpClientService,
    private userService: UserService,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.selectedStudy.jambNo = (this.selectedStudy.jambNo ? this.selectedStudy.jambNo : "" );
    this.filteredStates = this.stateCtrl.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.jambNo),
        map(state => state ? this._filterStates(state) : this.appList.slice())
      );

    // console.log("VIEW PASSED DATA:::", data);



  }

  ngAfterViewInit() {
    this.loadNextOfKin();

  }

  ngOnInit(): void {

    this.loadNextOfKin();
    this.studentService.getStudentType().subscribe(
      (data) => {
        if (data){

          // console.log('THIS IS THE SUB::', data);
          this.studentTypeList = data;

        }
      }
    )
    // console.log("VIEW PASSED DATA2:::", this.data);
    // const b = new Date(this.data.row.dOB).toLocaleDateString('en-GB', {timeZone: 'Africa/Lagos'}).split('/');
    // console.log('second try::', b,this.data.row.dOB as Date )
    this.selectedStudent = this.data.row; // load student to be edited
    // date.getTime() + Math.abs(date.getTimezoneOffset()*60000)
    // const tempDate = this.selectedStudent.dOB  ? new Date(this.selectedStudent.dOB ) : null;
    // this.selectedStudent.dOB = tempDate  ? tempDate.getTime() + Math.abs(tempDate.getTimezoneOffset()*60000) : undefined;

    // this.selectedStudent.dOB = this.selectedStudent.dOB  ? this.selectedStudent.dOB : undefined;
    this.selectedStudent.dOB = this.selectedStudent.dOB  ? RawUtil.getEmmyDate(this.selectedStudent.dOB)  : undefined;

    // this.selectedStudent.dOB = this.selectedStudent.dOB  ? new Date(+b[2],+b[1]-1, +b[0])  : undefined;
    // if (this.selectedStudent.dOB ) {console.log('check dates (row, select)::', this.data.row.dOB, this.selectedStudent.dOB)}
    // console.log("VIEW PASSED DATA SELECTEDDATA:::", this.selectedStudent);

    this.dialogRef.beforeClosed().subscribe(
      () => {
        this.studentService.deleteTempStudent(this.selectedTempStudent as TempStudent);
        this.closeDialog();

      }
    );
    // this.StatesList = this.applicationService.getNigeriaStates();
    this.applicationService.getNigeriaStates().subscribe(
      (data) => {
        if (data && data.length > 0 )
        {this.StatesList = data; }

      }
    );
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
    // this.departmentList = this.applicationService.getProgrammes();
    this.departmentService.getProgrammes().subscribe(
      (data) => {
        if (data && data.length > 0 )
        {this.departmentList = data; }

      }
    );
    this.studyService.getStudentStudy((this.selectedStudent as Student).studentNo).subscribe(
      (data => {
        if (data) {
          this.studyList = data;
          this.loadStudy();
        }
      })
    );
    this.nextofKinService.getStudentNextOfKin(this.selectedStudent.studentNo as string)
      .subscribe((data) => {
        if (data)
        {this.nextOfKinList = data;
          // console.log("NEXT OF KIN LIST::", data)
        }
      });

    this.studentService.getSponsor(this.selectedStudent.studentNo as string)
      .subscribe( (data: SponsorDetails) => {
        if (data) {
          this.selectedSponsorBank = data;
        }
      });

    this.checkIfStudyExists();
    this.studyService.checkIfAStudyExists("1111111");
    // this.nextofKinService.loadStudentNextOfKin2();
    this.applicationService.applicationList.subscribe(
      data => {
        this.appList = data;
        console.log("APPLICATION:::", data);
      }
    );

    this.setStudentInfo();
    // this.setStudyInfo();
  }

  filterListForUsed(avaiableStudy: Study[], fullList: Applications[]) : any[] {
    const answer: Applications[] = [];
    for (let i =0 ; i < fullList.length ; i++)
    {
      const aCheck = this.studyPipe.transform(avaiableStudy, fullList[i]);
      if (!aCheck || aCheck.length === 0)
      {
        answer.push(fullList[i])
      }

    }
    return answer;
  }

  pinDepartment(): void {
    this.selectedStudent.programme =
      this.selectedStudy.programme ? this.selectedStudy.programme : this.selectedStudent.programme ;
  }

  generateIUFStudyNo(): string {
    let results = ""
    const dig3 = Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString();
    const dig2 = Math.floor(Math.random() * 10).toString() + Math.floor(Math.random() * 10).toString();
    const dig1 = Math.floor(Math.random() * 10);
    const randomCharacter1 = this.alphabet[Math.floor(Math.random() * this.alphabet.length)]
    const randomCharacter2 = this.alphabet[Math.floor(Math.random() * this.alphabet.length)]
    const randomCharacter3 = this.alphabet[Math.floor(Math.random() * this.alphabet.length)]
    // format 2 digits- 2 letters-3 digits-1 letter total of 8
    results = dig2 + randomCharacter1.toUpperCase() + randomCharacter2.toUpperCase()+
      dig3 + randomCharacter3.toUpperCase();
    return results;
  }



  isFoundation(): boolean {
    let answer = false;
    if (this.selectedStudy.studentType === 6 ) {
      answer = true;}
    return answer;

  }
  checkForFoundation(): boolean {
    let answer = false;
    let isUnique: boolean[] = [false];
    let numberOfTime = 0
    if (this.isFoundation() && (!this.isUpdates || this.selectedFoundationNo === "")) {
      this.selectedFoundationNo = this.generateIUFStudyNo();
      // check to see if this number is unique
      while (!isUnique[0] && numberOfTime < 5) {
        numberOfTime++
        this.studyService.checkUniqueIDNo(this.selectedFoundationNo).subscribe(
          (isFound: number) =>
          {

            if (!isFound) {
              isUnique[0] = true;
              console.log("foundation no::")

            }else{this.selectedFoundationNo = this.generateIUFStudyNo();}
          });
      } // end while loop
      console.log("foundation no::", this.selectedFoundationNo,numberOfTime)
      answer = true}
    return answer
  }

  closeDialog(){
    this.dialogRef.close({data:this.local_data});
    // console.log('CLOSE DIALOG TRIGGERED');

  }


  setStudentInfo(): void {
    this.selectedStudy.jambNo = "";
  }

  setStudyInfoPrompt(): void {
    // this.selectedStudent.studentNo = '';
    this.searchingMarker = true;
    this.setStudyInfo();
    this.searchingMarker = false;

  }
  setStudyInfoNewStudy(): void {
    let existingS = ""
    let newStudS = ""
    // if (this.selectedStudent.dOB && new Date(this.selectedStudent.dOB) === new Date(this.selectedApplication2.dOB)) {}
    const existingStud = this.selectedStudent.dOB ?
      new Date(this.selectedStudent.dOB).toLocaleDateString('en-GB').split('/') :
      null;
    const existingStud2 = this.selectedStudent.dOB ?
      new Date(this.selectedStudent.dOB).toLocaleDateString('en-GB', { timeZone: 'UTC' }).split('/') :
      null;
    const newStud = this.selectedApplication2.dOB ?
      new Date(this.selectedApplication2.dOB).toLocaleDateString('en-GB').split('/') :
      null;
    const newStud2 = this.selectedApplication2.dOB ?
      new Date(this.selectedApplication2.dOB).toLocaleDateString('en-GB', { timeZone: 'UTC' }).split('/') :
      null;
    existingS = existingStud ? `${existingStud[0]}/${existingStud[1]}/${existingStud[2]}` : '';
    newStudS = newStud ? `${newStud[0]}/${newStud[1]}/${newStud[2]}` : '';
    const existingS2 = existingStud2 ? `${existingStud2[0]}/${existingStud2[1]}/${existingStud2[2]}` : '';
    const newStudS2 = newStud2 ? `${newStud2[0]}/${newStud2[1]}/${newStud2[2]}` : '';

    console.log('compare dates (ex,new)::', existingS, newStudS)
    console.log('compare dates2 (ex,new)::', existingS2, newStudS2)

    console.log ('selectedstudent:::',this.selectedStudent.nin , this.selectedStudent.lastName, this.selectedStudent.dOB, existingStud)
    console.log ('selectedApplication2:::',this.selectedApplication2.nin , this.selectedApplication2.lastName, this.selectedApplication2.dOB, newStud)

    console.log('lastName::', this.selectedStudent.lastName?.toUpperCase().trim(), this.selectedApplication2.lastName?.toUpperCase().trim())
    if (existingS === newStudS) {
      console.log("SAME STUDENT1")

      if ((this.selectedStudent.lastName ? this.selectedStudent.lastName.toUpperCase().trim() : null) === (this.selectedApplication2.lastName ? this.selectedApplication2.lastName.toUpperCase().trim(): null))
      {
        console.log("SAME STUDENT2")

      }

    }
    if ((existingS === newStudS) && ((this.selectedStudent.lastName ? this.selectedStudent.lastName.toUpperCase().trim() : null) === (this.selectedApplication2.lastName ? this.selectedApplication2.lastName.toUpperCase().trim(): null)))
    {
      console.log("SAME STUDENT")
      this.selectedStudy.applicationNo =
        this.selectedApplication2.applicationNo ? this.selectedApplication2.applicationNo : '';

      this.selectedStudy.programme =
        this.selectedApplication2.department1 ? this.selectedApplication2.department1.toString().toUpperCase() : '';

      this.selectedStudy.studentType = 0;

      this.selectedStudy.status = 'Applicant';
      this.selectedStudy.beginSession = this.selectedApplication2.beginSession;
      this.selectedStudy.finishSession = '';
      this.selectedStudy.jambNo = this.selectedApplication2.jambNo;
      this.korotePayService.getNextSessionResumptionDate()
        .subscribe((data)=> {
          if(data) {
            this.selectedStudy.beginDate = data;

          }

        });
    }

    else {
      this.openSnackBar('ADD STUDY ERROR: The [Date of Birth] or [Last name] is not the same for this new study!', 'close',
        {horizontalPosition:'center', verticalPosition: 'top'})
    }
    // if ((existingStud && newStud && existingStud === newStud)){
    //   console.log("SAME STUDENT1")
    // }

    // if (this.selectedStudent.lastName?.toUpperCase().trim() === this.selectedApplication2.lastName?.toUpperCase().trim()){
    //   console.log("SAME STUDENT2")
    // }


  }

  setStudyInfo(): void {
    // console.log('SET STUDY INFO TRIGGERED');
    if (this.selectedApplication)
    {
      // console.log('IN IF');
      this.selectedStudent.dOB = this.selectedApplication.dOB;
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

      this.selectedStudent.firstName = this.selectedApplication.firstName?.toString().toUpperCase();
      this.selectedStudent.lastName = this.selectedApplication.lastName?.toString().toUpperCase();
      this.selectedStudent.middleName = this.selectedApplication.middleName?.toString().toUpperCase();
      this.selectedStudent.gender = this.selectedApplication.gender === 'Male' ? 'M' : 'F';
      this.selectedStudent.religion = this.selectedApplication.religion?.toString().toUpperCase() ;
      this.selectedStudent.state = this.selectedApplication.state?.toString().trim().toUpperCase() ;
      this.selectedStudent.nationality = this.selectedApplication.nationality?.toString().trim().toUpperCase() ;
      this.selectedStudent.address = this.selectedApplication.address?.toString().toUpperCase() ;
      this.selectedStudent.activeStatus = false;
      // this.selectedStudy.beginDate = this.korotePayService.getNextSessionResumptionDate();

      this.korotePayService.getNextSessionResumptionDate()
        .subscribe((data)=> {
          if(data) {
            this.selectedStudy.beginDate = data;

          }

        });

      // console.log("STUDY", this.selectedStudy);
      // console.log("APPLICATION", this.selectedApplication);

      // get studentNo
      // set temp Student Node




    }
  }

  public viewIndex(anIndex: number): void {
    // console.log("THE INDEX::", anIndex);
  }

  async doSave(): Promise<void> {
    this.progressMarker = true;
    for (let i=0; i < this.studyList.length ; i++)
    {
      await this.studentService.updateStudy(this.studyList[i], this.selectedStudent.studentNo as string)
    }
    this.studentService.updateStudent(this.selectedStudent as Student, this.selectedSponsorBank as SponsorDetails)
      .subscribe((data) => {
        if (data)
        {
          this.editingDoneMarker = true;
          this.progressMarker = false;
          this.openSnackBar("SUCCESS! Student Updated", 'close' );

        }
      });
  }

  clearFilter(): void {this.selectedApplication = {};}

  checkLoadedApplication(): boolean {
    if (this.selectedApplication === undefined    ) {return false;}
    else {return true;}
  }

  checkLoadedApplication2(): boolean {
    if (this.selectedApplication2 === undefined    ) {return false;}
    else {return true;}
  }

  displayFn(applicant: Applications): string {
    // console.log("THE INDEX::", applicant);
    // this.selectedApplication = applicant;
    // console.log("THE APP::", this.selectedApplication);

    return applicant && applicant.jambNo ? applicant.jambNo : '';
  }

  private _filterStates(value: string): Applications[] {
    const filterValue = value.toLowerCase();

    return this.appList.filter(state =>
    {
      // console.log({state})

      return state.jambNo.toString().toLocaleLowerCase().includes(filterValue) || state.lastName.toLocaleLowerCase().includes(filterValue)
        || state.department1.toLowerCase().includes(filterValue) ;
      // state.jambNo.toLowerCase().includes(filterValue)
      // || state.lastName.toLowerCase().includes(filterValue);

    });
  }

  checkIfStudyExists(): void {
    if (this.dataSource.data.length < 1) {
      this.isUpdates22 = true

    }
  }


  getCorporateStatus(): boolean {
    return (this.selectedSponsorBank.relationship as string === "Corporate Sponsor" ? false : true);
  }

  checkMarried(): boolean {
    if (this.selectedStudent.maritalStatus !== 'SINGLE' && this.selectedStudent.gender === 'F') { return true;}
    else {return false;}
  }
  readyUpdates22(): void {
    // check to see if the number of next of kin is up to two
    if (this.checkNumberOfNOK() > 1) {
      this.openSnackBar("Only 2 Next of Kin allowed! Please remove one Next of Kin", 'close' );
    }

    else{
      this.isUpdates22 = true;
      this.clearNextOfKin();

    }


  }

  // steps to add a new study
  // 1. Check is this is the first study
  // 2. If it is, go on else if there is another study attached-
  // 3. Continue if the old study is Abandoned, Completed else notify to change the current study to Abandoned or COmpleted
  // 4. If previous study is abandoned or completed, enter all information and force user to click pin department
  //

  readyUpdates(): void {
    // check to see if the number of next of kin is up to two

    this.aStudyUpdate = false;
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

  openSnackBar(message: string, action: string | undefined, others = {horizontalPosition: 'center', verticalPosition: 'bottom'}): void {
    this.snackBar.open(message, action , {duration: 5000,
      horizontalPosition: others.horizontalPosition as MatSnackBarHorizontalPosition,
      verticalPosition: others.verticalPosition as MatSnackBarVerticalPosition});
  }

  checkNumberOfNOK(): number {
    const answer = this.dataSource2.data.length;
    return answer;

  }

  editNextOfKin(i: number, aQualif: NextKin): void {
    this.isAnUpdates22 = true;
    this.isUpdates22 = true;
    this.globalIndex = i;
    // console.log("A ROW::::", aQualif)
    this.selectedNextOfKin.email = aQualif.email;
    this.selectedNextOfKin.fullName = aQualif.fullName;
    this.selectedNextOfKin.address = aQualif.address;

    this.selectedNextOfKin.occupation = aQualif.occupation;
    this.selectedNextOfKin.phone = aQualif.phone;
    this.selectedNextOfKin.relationship = aQualif.relationship;
    this.selectedNextOfKin.title = aQualif.title ;
    this.selectedNextOfKin.creationStamp = aQualif.creationStamp;

    // console.log("A ROW SELECTNEXTKIN::::", this.selectedNextOfKin);


  }

  editStudy(i: number, aQualif: Study): void {
    this.selectedStudy = {}
    this.selectedApplication = {}
    this.selectedApplication2 = {}
    // this.readyUpdates22();
    this.isAnUpdates = true;
    this.isUpdates = true;
    this.aStudyUpdate = true;
    this.globalIndex = i;
    console.log("A ROW STUDY::::", aQualif)


    this.selectedStudy.beginDate = new Date(aQualif.beginDate);
    this.selectedStudy.finishDate = aQualif.finishDate ? new Date(aQualif.finishDate!): undefined;
    this.selectedStudy.beginSession = aQualif.beginSession;
    this.selectedStudy.finishSession = aQualif.finishSession;
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




    // console.log("A ROW SELECTSTUDY::::", this.selectedStudy);


  }

  editNextOfKin1(aQualif: NextKin): void {


    // this.readyUpdates22();
    this.isAnUpdates22 = true;
    this.isUpdates22 = true;

    // this.clearNextOfKin();
    this.selectedNextOfKin.email = aQualif.email ? aQualif.email: '';
    this.selectedNextOfKin.fullName = aQualif.fullName ? aQualif.fullName : '';
    this.selectedNextOfKin.address = aQualif.address ? aQualif.address : '';

    this.selectedNextOfKin.occupation = aQualif.occupation ? aQualif.occupation: '';
    this.selectedNextOfKin.phone = aQualif.phone ? aQualif.phone: '';
    this.selectedNextOfKin.relationship = aQualif.relationship ? aQualif.relationship: '';
    this.selectedNextOfKin.title = aQualif.title ? aQualif.title: '';
    this.selectedNextOfKin.creationStamp = aQualif.creationStamp;

  }

  removeStudy(i: number, aQualif: Study): void {
    // this.nextofKinService.deleteStudentNextOfKin(this.selectedStudent.studentNo as string, aQualif, 1);
    this.studyList = [];
    this.dataSource.data = this.studyList;
    this.loadStudy();


  }

  removeNextOfKin(i: number, aQualif: NextKin): void {
    this.nextofKinService.deleteStudentNextOfKin(this.selectedStudent.studentNo as string, aQualif);
    const temp = this.dataSource2.data;

    this.dataSource2.data = this.utilityService.sliceTable
    (i, this.paginator2, temp);
  }

  addNextOfKin(): void {
    if (this.checkNumberOfNOK() > 1) {
      this.openSnackBar("Only 2 Next of Kin allowed! Please remove one Next of Kin", 'close' );
    }

    else{

      this.nextofKinService.setStudentNextOfKin(this.selectedStudent.studentNo as string,
        this.selectedNextOfKin as NextKin).subscribe(
        (data) => {
          if (data !== undefined && data !== null) {
            setTimeout( () => {
              this.loadNextOfKin();
            }, 200);

          }
        }
      );
    }
  }

  autoAddStudy(): void {
    this.studyList.push(this.selectedStudy as Study)
    this.loadStudy();

  }

  // addStudy(): void {
  //   this.studyList.push(this.selectedStudy as Study)
  //   this.loadStudy();
  // }

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
        this.value = 100
        this.color = 'primary'

      }
      else {
        console.log("APPLIATIONS API GRAB ERROR")
        this.errorCount++;
        if (this.errorCount < 2) {
          this.applicationService
            .loadStudentApplication(0).subscribe(data =>
          {
            if (data ) {this.color = 'primary'; }
            else {
              console.log("ERROR WITH LOCAL GRABBNG APPLICATIONS");
              this.color = 'accent';
            }
            this.mode = 'determinate';
            this.value = 100
            this.syncDone = true;
            this.syncClicked = false;

          });}



      }
    });
    // ? '' : this.applicationService
    // .loadStudentApplication(0);

  }

  updateNextOfKin(): void {


    this.nextofKinService.updateStudentNextOfKin(this.selectedStudent.studentNo as string,
      this.selectedNextOfKin as NextKin).subscribe(
      (data) => {
        if (data !== undefined && data !== null && data) {
          this.loadNextOfKin();
          this.toggleUpdate22();
          // this.clearQualification();
        }
      }
    );
  }
  isOngoingJustOne(): boolean {
    let answer = true;
    let count = 0
    this.studyList.forEach((e) => {
      if (e.status === 'Ongoing') {count += 1}
    });
    if (count > 1) {
      answer = false;
      this.openSnackBar("WARNING! There exist a programme that is ongoing", 'close',
        {
          horizontalPosition: 'center',
          verticalPosition: 'top',
        }
      );

    }

    return answer
  }
  updateStudyWithCheck(): void {
    if (this.isOngoingJustOne()) {this.updateStudy();}
  }
  updateStudy(): void {
    if (this.studyList) {
      this.studyList[this.globalIndex] = this.selectedStudy as Study;
      this.loadStudy();

    }

    if (this.selectedStudy.status === "Ongoing") {
      this.selectedStudent.activeStatus = true;
    }
    // else {
    //   this.selectedStudent.activeStatus = false;
    // }

    this.studyService.updateStudentStudy(this.selectedStudent.studentNo!,
      this.selectedStudy as Study).subscribe(
      (data) => {
        if (data) {
          if (this.studyList) {
            this.studyList[this.globalIndex] = this.selectedStudy as Study;
          }
          this.loadStudy();
          this.toggleUpdate();

        }
      }
    );


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
    this.nextofKinService.getStudentNextOfKin(this.selectedStudent.studentNo as string).subscribe((data) => {
      if (data !== undefined && data !== null && data) {
        this.dataSource2.data = data;

        this.dataSource2.sort = this.sort2;
        this.dataSource2.paginator = this.paginator2;
      }

    });
  }

  loadStudy(): void {
    this.dataSource.data = this.studyList;
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

  }


}
