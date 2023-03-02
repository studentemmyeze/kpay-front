import { AfterViewInit, Component, Inject, OnInit, Optional, ViewChild } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { NextKin, Applications, SponsorDetails, Student, StudentType, Study, TempStudent } from 'src/app/interfaces/student';
import { ApplicationService } from 'src/app/services/application.service';
import { BankService } from 'src/app/services/bank.service';
import { NextkinService } from 'src/app/services/nextkin.service';
import { StudentService } from 'src/app/services/student.service';
import { StudyService } from 'src/app/services/study.service';
import { UtilityService } from 'src/app/services/utility.service';
import { DateAdapter, MatDateFormats, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from 'src/app/utilities/format-datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { KpClientService } from 'src/app/services/kp-client.service';
import { UserService } from 'src/app/services/user.service';
import { Neo4jdatePipe } from 'src/app/pipes/neo4jdate.pipe';



@Component({
  selector: 'app-edit-student',
  templateUrl: './edit-student.component.html',
  styleUrls: ['./edit-student.component.css'],
  providers: [Neo4jdatePipe,
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
  displayedColumns = ['studentType', 'jambNo', 'applicationNo' , 'department', 'beginDate',
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
  stateCtrl = new FormControl();
  filteredStates: Observable<Applications[]>;
  globalIndex = 0;

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
    private studentService: StudentService,
    private bankService: BankService,
    private utilityService: UtilityService,
    public nextofKinService: NextkinService,
    private applicationService: ApplicationService,
    private studyService: StudyService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EditStudentComponent>,
    private korotePayService: KpClientService,
    private userService: UserService,
    private neo4jdate:Neo4jdatePipe,
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

    this.selectedStudent = this.data.row; // load student to be edited
    console.log('selected student::', this.data.row)
    this.selectedStudent.dOB = this.selectedStudent.dOB  ? new Date(this.selectedStudent.dOB) : undefined;
    // console.log("VIEW PASSED DATA SELECTEDDATA:::", this.selectedStudent);

    this.dialogRef.beforeClosed().subscribe(
      () => {
        this.studentService.deleteTempStudent(this.selectedTempStudent as TempStudent);
        this.closeDialog();

      }
    );
    this.StatesList = this.applicationService.getNigeriaStates();
    this.NationalityList = this.applicationService.getNationalities();
    this.bankService.getAllBanks().subscribe(
      (data) => {
        this.bankList = data

      }
    );
    // this.bankList = this.bankService.getAllBanks();
    this.sessionList = this.utilityService.generateSessionList();
    this.departmentList = this.applicationService.getProgrammes();
    this.studyService.getStudentStudy((this.selectedStudent as Student).studentNo).subscribe(
      (data => {
        if (data) {
          console.log('study received in table', data)
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
        // console.log("APPLICATION:::", data);
      }
    );

    this.setStudentInfo();
    // this.setStudyInfo();
  }

  pinDepartment(): void {
    this.selectedStudent.department =
    this.selectedStudy.department ? this.selectedStudy.department : this.selectedStudent.department ;
  }

  closeDialog(){
    this.dialogRef.close({data:this.local_data});
    // console.log('CLOSE DIALOG TRIGGERED');

  }


  setStudentInfo(): void {
    this.selectedStudy.jambNo = "";
  }
  setStudyInfo(): void {
    // console.log('SET STUDY INFO TRIGGERED');
    if (this.selectedApplication)
    {
      // console.log('IN IF');

      this.selectedStudy.applicationNo =
      this.selectedApplication.applicationNo ? this.selectedApplication.applicationNo : '';

      this.selectedStudy.department =
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
      this.selectedStudent.department = this.selectedStudy.department;

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

  doSave(): void {
    this.progressMarker = true;

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

        return state.jambNo.toLocaleLowerCase().includes(filterValue)
      || state.lastName.toLocaleLowerCase().includes(filterValue)
      || state.department1.toLowerCase().includes(filterValue);
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

  openSnackBar(message: string, action: string | undefined): void {
    this.snackBar.open(message, action , {duration: 5000, });
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
    // this.readyUpdates22();
    this.isAnUpdates = true;
    this.isUpdates = true;
    this.globalIndex = i;
    // console.log("A ROW STUDY::::", aQualif)


    this.selectedStudy.beginDate = new Date(aQualif.beginDate);
    this.selectedStudy.finishDate = aQualif.finishDate ? new Date(aQualif.finishDate!): undefined;
    this.selectedStudy.beginSession = aQualif.beginSession;
    this.selectedStudy.finishSession = aQualif.finishSession;
    this.selectedStudy.studentType = aQualif.studentType;
    this.selectedStudy.department = aQualif.department;
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
    console.log('In autoadd  study ', this.selectedStudy);
    this.studyList.push(this.selectedStudy as Study);
    this.loadStudy();

  }

  addStudy(): void {

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
  updateStudy(): void {
    if (this.studyList) {
      this.studyList[this.globalIndex] = this.selectedStudy as Study;
      this.loadStudy();

    }

    if (this.selectedStudy.status === "Ongoing") {
      this.selectedStudent.activeStatus = true;
    }
    else {
      this.selectedStudent.activeStatus = false;
    }

    this.studyService.updateStudentStudy(this.selectedStudent.studentNo as string,
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
    this.selectedStudy.department = undefined;
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
        console.log('next of kin::', data)
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
