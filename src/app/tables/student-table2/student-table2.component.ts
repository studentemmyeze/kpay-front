import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, Subscription, of } from 'rxjs';
import { AddStudentComponent } from 'src/app/dialogs/students/add-student/add-student.component';
import { EditStudentComponent } from 'src/app/dialogs/students/edit-student/edit-student.component';
import { SearchPara,  Student, StudentType, StudentGuardian } from 'src/app/interfaces/student';
import { StudentService } from 'src/app/services/student.service';
import { RawUtil, UtilityService } from 'src/app/services/utility.service';
import { ApplicationService } from 'src/app/services/application.service';
import { DOCUMENT } from '@angular/common';
import { StorageKey3 } from 'src/app/interfaces/storage-key';
import { resourceLimits } from 'worker_threads';
import { TU_LOGO_IMAGE } from 'src/app/utilities/sharedFile';
import jspdf from 'jspdf'
import jsPDF from 'jspdf'

import html2canvas from 'html2canvas'
import autoTable from 'jspdf-autotable'// import JSPDF from 'jspdf';
import { EmailService } from 'src/app/services/email.service';
import { StudyService } from 'src/app/services/study.service';
import { environment } from 'src/environments/environment';
import { Utils } from 'src/utils';
import { StorageService } from 'src/app/services/storage.service';
import { catchError, delay, map, startWith, switchMap } from 'rxjs/operators';
import {merge, Observable} from 'rxjs';
import {DepartmentalService} from "../../services/departmental.service";
declare var Dropbox: any
// import * as Dropbox from 'dropbox';
const { DROPBOX_STATUS } = StorageKey3;


type searchObject = {
  name: string;
  value: string; // the value of the data
  status: boolean; //
};



@Component({
  selector: 'app-student-table2',
  templateUrl: './student-table2.component.html',
  styleUrls: ['./student-table2.component.css'],
  providers:[StudentService]
})
export class StudentTable2Component implements OnInit {
  CLIENT_ID: string = 'pd8hvwf9oc0zpfg';
  FILE_NAME: string = "/studentList.txt";
  // newBook: BookEntity;
  authUrl: string;
  // dropboxToken: string;
  recog = 0
  dropboxToken: string = environment.dropboxToken;
  isAuthenticated: boolean
  static studentListForExport: any[];
  static isLoading: boolean;
  isLoadingResults:boolean = true;
  allSelected=false;
  studentSubscription: Subscription;
  displayedColumns = ['studentNo', 'title', 'lastName', 'firstName',  'middleName', 'gender' , 'programme','phone', 'sType','level','dOB', 'address', 'state', 'religion', 'status','email','nin']; // , 'dOB',
  original = this.displayedColumns;
  Levels = [100, 200, 300, 400, 500 ];
  StatusList = ['true', 'false'];
  studyStatusList: string[] = [];
  facultyList: string[] = [];
  // StatusList = [true, false];
  columnsToDisplay: string[] = this.displayedColumns.slice(0, 8);
  selectedColumn = [];
  studentTypeList: StudentType[] = [];
  studentList: Student[] = [];
  searchList: searchObject[] = []
  departmentList: string[] = [];
  studentAvailable = 0;


  // original = this.displayedColumns;
  genderList = [ 'M', 'F' ];
  copyOfDataForSearch: Student[] = []
  selectedPara: Partial <SearchPara> = {};

  toppings = new FormControl();
  dataSource!: MatTableDataSource<Student>;

  aFilterValue = "";
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;
  logoImage = TU_LOGO_IMAGE;
  searchP = '';



  constructor(
    public dialog: MatDialog,
    @Inject(DOCUMENT) private document: Document,
    private studentService: StudentService,
    private applicationService: ApplicationService,
    private departmentalService: DepartmentalService,
    private studyService: StudyService,
    private utilityService: UtilityService,
    private snackBar: MatSnackBar,
    private emailService: EmailService,
    private storage: StorageService

  ) {


    this.columnsToDisplay.push('actions');
    // this.departmentList = this.applicationService.getProgrammes();
    // this.facultyList = this.applicationService.getFaculties();
      this.applicationService.getProgrammes().subscribe(
          (data) => {
              this.departmentList = data;
              // console.log("APPLICATION:::", data);
          }
      );
      // this.facultyList =  this.applicationService.getFaculties();
      this.applicationService.getFaculties().subscribe(
          data => {
              this.facultyList = data;
              // console.log("APPLICATION:::", data);
          }
      );
    this.resetSearchObject();
    this.isLoadingResults = true;
    // console.log('About to run LOADDATA',this.isLoadingResults)
    this.loadData();
    this.utilityService.marker.subscribe((studentAvailable) => {
      if (studentAvailable === 2) {
        console.log("New student added  auto-SAVE TO DROPBOX!!!")
        // this.studentAvailable = 2;
        // this.saveToDropbox();
      }
    })

    this.isAuthenticated = false;
    StudentTable2Component.studentListForExport = [];
    StudentTable2Component.isLoading = false;
    //   console.log('dropbox token constructor0::', environment.dropboxToken, this.utilityService.send2Regmarker, this.studentAvailable);

    //   const tempToken = this.storage.read3(DROPBOX_STATUS) || '';

    //   if (tempToken === '2') {
    //     environment.send2Reg = true;
    //     this.utilityService.send2Regmarker = 2;
    //   }

    // this.dropboxToken = Utils.getAccessTokenFromUrl();
    //     environment.dropboxToken =  this.dropboxToken
    //     console.log('dropbox token constructor::', this.dropboxToken, environment.send2Reg, this.studentAvailable);
    //     this.isAuthenticated = this.dropboxToken !== undefined;
    //     if ((this.isAuthenticated) && (environment.send2Reg || this.studentAvailable === 2)) {
    //       environment.dropboxToken = this.dropboxToken;
    //       setTimeout(() => {
    //         console.log('they are back settimeout')
    //         this.saveToDropbox();

    //       }, 5000);
    //     }


  }

  clearFilter(): void {
    this.aFilterValue = '';
    this.applyFilter();

  }



  loadData() {
    // this.getStudent4Table().pipe(
    //   startWith([]),
    //   switchMap((ddata) => {
    //     this.isLoadingResults = true;
    //     console.log('switchmap::',ddata)
    //     return ddata
    //   }),map(data => {
    //           this.isLoadingResults = false;

    //           if (data === null) {
    //              return [];
    //            }
    //            console.log({data})

    //            return data;
    //          }),

    // ).subscribe(
    //   data =>{
    // console.log({data})
    // this.dataSource= new MatTableDataSource(data);
    //   this.dataSource.sort = this.sort;
    //   this.dataSource.paginator = this.paginator;
    //   this.copyOfDataForSearch = data;
    //   }
    // )

    // merge(this.sort.sortChange, this.paginator.page)
    //     .pipe(startWith({}),
    //     switchMap(() => {
    //       this.isLoadingResults = true;
    //       return this.getStudent4Table().pipe(catchError(() => new BehaviorSubject ([])));
    //     }),
    //     map(data => {
    //       this.isLoadingResults = false;

    //       if (data === null) {
    //         return [];
    //       }
    //       console.log({data})

    //       return data;
    //     }),
    //   ).subscribe(data =>{
    //     console.log({data})
    //     this.dataSource= new MatTableDataSource(data);
    //       this.dataSource.sort = this.sort;
    //       this.dataSource.paginator = this.paginator;
    //       this.copyOfDataForSearch = data;
    //   })



    // this.studentSubscription = this.studentService.getStudentsList()
    // .subscribe((data) => {
    //   this.isLoadingResults = true;
    //   if (data !== undefined && data !== null) {
    //     // console.log("this is the qualification data", data);
    //     this.isLoadingResults = false;
    //     this.dataSource= new MatTableDataSource(data);
    //     this.dataSource.sort = this.sort;
    //     this.dataSource.paginator = this.paginator;
    //     this.copyOfDataForSearch = data;
    // }

    // });
    this.studentService.getStudentsList().pipe(delay(200),
      startWith([]),
      switchMap((ddata) => {
        return of(ddata);
      }),
      map(data => {
        // console.log('datamap::',data)
        if (data === null) {
          this.isLoadingResults = true;
          return [];
        }else {
          return data;
        }

      }),
    )
      .subscribe(data => {
        this.isLoadingResults = true;
        //  console.log('datasub::',data)
        if (data !== undefined && data !== null) {
          this.dataSource = new MatTableDataSource(data);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.copyOfDataForSearch = data;
          if (data.length ===  0) {this.isLoadingResults = true;}
          else{
            this.isLoadingResults = false;}
        }
      }, error => this.isLoadingResults = true);

    this.studentService.getStudentType().subscribe(
      (data) => {
        if (data){
          this.studentTypeList = data;
        }
      }
    );

    this.studyService.getStudyStatus().subscribe(data => {
      this.studyStatusList = data;
    })



  }

// getStudent4Table():  BehaviorSubject<Student[]> {
//   return this.studentService.getStudentsList();
//   // return this.studentSubscription
// }
  loadFilterData2(option?: number): void {
    this.turnChipOff();
    const tempData: Student[] = [];
    const dataToUse = option ? this.copyOfDataForSearch : this.dataSource.filteredData;



    dataToUse.forEach((data: Student) => {

      // if (data.lastName === 'EDET') {
      //   const stringValue = "true";
      //   const boolValue = (this.searchList[5].value == "true");
      //console.log({boolValue}, data.activeStatus);
      //console.table({data})
      // }
      let statusOfCheckList: boolean[] = [];
      if (this.searchList[0].value && this.searchList[0].value !== '')
      {
        if (this.searchList[0].value.toUpperCase() === data.lastName?.toUpperCase())
        {statusOfCheckList.push(true)}
        else {statusOfCheckList.push(false)}
      }

      if (this.searchList[1].value)
      {
        if (this.searchList[1].value.toUpperCase() === data.firstName?.toUpperCase())
        {statusOfCheckList.push(true)}
        else {statusOfCheckList.push(false)}
      }

      if (this.searchList[2].value)
      {
        if (this.searchList[2].value.toUpperCase() === data.gender?.toUpperCase())
        {statusOfCheckList.push(true)}
        else {statusOfCheckList.push(false)}
      }


      if (this.searchList[3].value)
      {
        if (parseInt(this.searchList[3].value) === data?.level)
        {statusOfCheckList.push(true)}
        else {statusOfCheckList.push(false)}
      }


      if (this.searchList[4].value && this.searchList[4].value !== '')
      {
        if (this.searchList[4].value.toUpperCase() === data.programme?.toUpperCase())
        {statusOfCheckList.push(true)}
        else {statusOfCheckList.push(false)}
      }


      if (this.searchList[5].value)
      {
        const stringValue = "true";
        const boolValue = (this.searchList[5].value == "true");

        if (boolValue === data.activeStatus)
        {statusOfCheckList.push(true)}
        else {statusOfCheckList.push(false)}
      }

      let answer = true;
      statusOfCheckList.forEach((e: boolean) => {
        answer = !e ? false :  answer;

      })
      if (answer) {tempData.push(data)}



    });

    this.dataSource= new MatTableDataSource(tempData);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

  }

  loadFilterData(option?: number): void {
    this.turnChipOff();
    // const tempData: Student[] = [];
    // const dataToUse = option ? this.copyOfDataForSearch : this.dataSource.filteredData;

    // let statusOfCheckList: boolean[] = [];

    if (this.searchList[0].value && this.searchList[0].value !== '')
    { this.selectedPara.lName = this.searchList[0].value; }
    if (this.searchList[1].value && this.searchList[1].value !== '')
    { this.selectedPara.fName = this.searchList[1].value; }
    if (this.searchList[2].value && this.searchList[2].value !== '')
    { this.selectedPara.gender = this.searchList[2].value; }
    if (this.searchList[3].value)
    { this.selectedPara.level = parseInt(this.searchList[3].value); }
    if (this.searchList[4].value && this.searchList[4].value !== '')
    { this.selectedPara.programme = this.searchList[4].value; }
    if (this.searchList[5].value)
    {
      const boolValue = (this.searchList[5].value == "true");
      this.selectedPara.status = boolValue
    }
    if (this.searchList[6].value && this.searchList[6].value !== '')
    { this.selectedPara.faculty = this.searchList[6].value; }
    if (this.searchList[7].value && this.searchList[7].value !== '')
    { this.selectedPara.studyStatus = this.searchList[7].value; }
    // console.log('searchpara:::', this.selectedPara)
    this.studentService.getStudentsList(this.selectedPara as SearchPara)
      .subscribe((data) => {
        if (data !== undefined && data !== null) {
          // console.log("this is the qualification data", data);
          this.dataSource= new MatTableDataSource(data);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.dataSource.filter = this.aFilterValue.trim().toLowerCase();

          if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
          }

        }});





  }

  clearAllFilter(): void {
    this.resetSearchObject();
    this.loadData();
  }

  resetSearchObject(): void {
    this.searchList = [];
    const propertiesList = [ 'lastName', 'firstName',  'gender' ,  'level', 'programme',  'status','faculty', 'studyStatus']

    for (let i = 0; i < 8 ; i++) {
      let searchObject2: searchObject = {
        name: propertiesList[i],
        value: '',
        status: false
      };

      this.searchList.push(searchObject2);
    }
    this.selectedPara = {}
  }
  turnChipOff(currentChipNo?: number): void {
    for (let i = 0; i < 8; i++) {
      if (currentChipNo && i !== currentChipNo) {this.searchList[i].status = false;}
      else {
        this.searchList[i].status = false;
      }
    }
  }

  clickChip(nameOfChip: number): void {
    // console.log("NAME OF CHIP:", this.searchList[parseInt(nameOfChip)].name);
    this.turnChipOff(nameOfChip);
    this.searchList[nameOfChip].status = !this.searchList[nameOfChip].status
  }

  removable(location: number): boolean {
    let answer = false;
    if (this.searchList[location].status === false && this.searchList[location].value !== '')
    { answer = true;}
    return answer;
  }

  remove(location: number): void {
    this.searchList[location].value = '';
    this.searchList[location].status = false;
    if (location === 0)
    { this.selectedPara.lName = undefined; }
    else if (location === 1)
    { this.selectedPara.fName = undefined; }
    else if (location === 2)
    { this.selectedPara.gender = undefined; }
    else if (location === 3)
    { this.selectedPara.level = undefined; }
    else if (location === 4)
    { this.selectedPara.programme = undefined; }
    else if (location === 5)
    { this.selectedPara.status = undefined }
    else if (location === 6)
    { this.selectedPara.faculty = undefined }
    else if (location === 7)
    { this.selectedPara.studyStatus = undefined }

    this.aFilterValue !== '' ? this.loadFilterData() : this.loadFilterData(1);

    // this.loadFilterData();


  }

  selectAll(status: boolean): void {
    if (status) {
      this.columnsToDisplay = this.original;

    }
    else {this.columnsToDisplay = []; }

  }
  print(): void {
    this.columnsToDisplay.push('actions');

    // console.log("SELECTED COLUMN::", this.columnsToDisplay);
  }

  exportToPdf2(): void {
    this.searchP = '';
    this.searchList.forEach(item => {
      if (item.value !== '') {this.searchP += (item.name + ': ' + item.value + ',')}
    });
    this.searchP += this.aFilterValue ? `Searchboxfilter: ${this.aFilterValue }`: '';

    this.utilityService
      .exportToPdf(this.dataSource.filteredData, 'TU_StudentInfo', this.columnsToDisplay, this.searchP,'STUDENT INFORMATION')
  }


  exportTable(){
    const answer=  RawUtil.exportToExcel(this.dataSource.filteredData,'TU_StudentInfo', this.columnsToDisplay)
    //console.log({answer})
    StudentTable2Component.studentListForExport = answer;
  }

  get IsLoading():boolean {
    return StudentTable2Component.isLoading;
  }

  processGuardianInfo(gdData:any[], otherData: Student[]): any[] {
    const sumList: any = [];
    otherData.forEach((e: Student) => {
      const guardData = gdData.find((ee) => {return ee[0] === e.studentNo} )
      if (guardData){ sumList.push({student: e, guardian: guardData[1], sponsor:guardData[2]})}
    })
    return sumList;
  }

  getPDFWithGuardianInfo(): void {}

  getExcelWithGuardianInfo(): void {
    let sumOfD = []
    const tempColumnToDisplay: string[] = []
    let sumOfD2: StudentGuardian[] = []
    this.columnsToDisplay.forEach( e => {
      tempColumnToDisplay.push(e)
    })
    // const tempColumnToDisplay = this.columnsToDisplay
    this.studentService.getSponsorList().subscribe(data=> {
      const filteredData = this.dataSource.filteredData
      sumOfD = this.processGuardianInfo(data, filteredData)
      sumOfD.forEach((e) =>{
        sumOfD2.push({
          studentNo: e.student.studentNo,
          title: e.student.title,
          firstName: e.student.firstName,
          middleName: e.student.middleName,
          lastName: e.student.lastName,
          dOB: e.student.dOB,
          gender: e.student.gender,
          level: e.student.level,
          nin: e.student.nin,

          activeStatus: e.student.activeStatus,
          studentType: e.student.studentType,
          email: e.student.email,
          phone: e.student.phone,
          address: e.student.address,
          programme: e.student.programme,
          isDeleted: e.student.isDeleted,
          staffIn:e.student.staffIn,
          religion:e.student.religion,

          //     endDate?: Date;
          creationStamp: e.student.creationStamp,
          maritalStatus: e.student.maritalStatus,
          maidenName: e.student.maidenName,
          state: e.student.state,
          nationality: e.student.nationality,
          guardian1_name: (e?.guardian[0]?.name !== null && e?.guardian[0]?.name !== undefined)? e.guardian[0].name : '',
          guardian1_address: (e?.guardian[0]?.address  !== undefined && e?.guardian[0]?.address !== null) ? e.guardian[0].address : '',
          guardian1_email: (e?.guardian[0]?.email !== undefined && e?.guardian[0]?.email !== null)? e.guardian[0].email : '',
          guardian1_phone: (e?.guardian[0]?.phone !== undefined && e?.guardian[0]?.phone !== null)  ? e.guardian[0].phone : '',
          guardian1_relationship: (e?.guardian[0]?.relationship !== undefined && e?.guardian[0]?.relationship !== null) ? e.guardian[0].relationship : '',

          guardian2_name: (e?.guardian[1]?.name !== undefined && e?.guardian[1]?.name !== null) ? e.guardian[1].name : '',
          guardian2_address: (e?.guardian[1]?.address !== undefined && e?.guardian[1]?.address !== null) ? e.guardian[1].address : '',
          guardian2_email: (e?.guardian[1]?.email !== undefined && e?.guardian[1]?.email !== null) ? e.guardian[1].email : '',
          guardian2_phone: (e?.guardian[1]?.phone !== undefined && e?.guardian[1]?.phone !== null) ? e.guardian[1].phone : '',
          guardian2_relationship: (e?.guardian[1]?.relationship !== undefined && e?.guardian[1]?.relationship !== null) ? e.guardian[1].relationship : '',

          sponsor_name: (e?.sponsor?.name !== undefined && e?.sponsor?.name !== null) ? e.sponsor.name : '',
          sponsor_address: (e?.sponsor?.address !== undefined && e?.sponsor?.address !== null) ? e.sponsor.address : '',
          sponsor_phone: (e?.sponsor?.phone !== undefined && e?.sponsor?.phone !== null) ? e.sponsor.phone : '',
          sponsor_email: (e?.sponsor?.email !== undefined && e?.sponsor?.email !== null) ? e.sponsor.email : '',
          sponsor_relationship: (e?.sponsor?.relationship !== undefined && e?.sponsor?.relationship !== null) ? e.sponsor.relationship : ''
        })




      })
      console.log('here is data::', sumOfD2)
      const others = [
        'guardian1_name',
        'guardian1_address',
        'guardian1_email',
        'guardian1_phone',
        'guardian1_relationship',

        'guardian2_name',
        'guardian2_address',
        'guardian2_email',
        'guardian2_phone',
        'guardian2_relationship',

        'sponsor_name',
        'sponsor_address',
        'sponsor_email',
        'sponsor_phone',
        'sponsor_relationship'
      ]
      others.forEach (e => {
        tempColumnToDisplay.push(e)
      })
      // console.log('here is sumofd2::', sumOfD2)

      const answer=  RawUtil.exportToExcel(sumOfD2,'TU_Student_withSponsorInfo', tempColumnToDisplay)


    })

  }


  public saveToDropbox(option = 0) {
    if (option === 1) {
      environment.send2Reg = true;
      this.utilityService.send2Regmarker = 2;
      this.storage.save3(StorageKey3.DROPBOX_STATUS, "2");
    }
    this.isAuthenticated = false;

    this.isAuthenticated = environment.dropboxToken !== undefined && environment.dropboxToken !== '';
    var dbx = new Dropbox({ clientId: this.CLIENT_ID });
    if (!this.isAuthenticated) {

      this.authUrl = dbx.getAuthenticationUrl(environment.dropboxUrl);
      // console.log('first dbx::', dbx)
      environment.authSuccess = true;
      this.document.location.href = this.authUrl;
      // this.dropboxToken = Utils.getAccessTokenFromUrl();
      // environment.dropboxToken = this.dropboxToken;
      // console.log('after first_dbx-save2dropbox')
      // setTimeout(() => {
      console.log('!isauthenticatd-settimeout')
      //   this.saveToDropbox2();

      // }, 6000);



    }

    else {
      setTimeout(() => {
        console.log('settimeout')
        this.saveToDropbox2();

      }, 1000);
    }


  }

  saveToDropbox2() {
    // console.log('inside_save_to_dropbox2',this.dropboxToken, environment.dropboxToken )
    let sumOfD = []
    this.studentService.getSponsorList().subscribe(data=> {
      if (data.length > 0) {
        // console.log('here is data::', data)
        sumOfD = this.processGuardianInfo(data,this.dataSource.data)
        // console.log('here is data::', sumOfD)
        let sumOfDJSON = JSON.stringify(sumOfD)
        // let idUser = environment.dropboxAccountID
        // console.log('idUser::', idUser)
        var dbx = new Dropbox({ accessToken: environment.dropboxToken});
        console.log('here is dropbox::', dbx)
        // console.log('accountID::', environment.dropboxAccountID)
        // dbx.filesUpload({contents:JSON.stringify(StudentTable2Component.studentListForExport), path: this.FILE_NAME, mode: {".tag": 'overwrite'}, autorename: false, mute: true }).then(function(response: any) {

        setTimeout(() => {

          dbx.filesUpload({contents:sumOfDJSON, path: this.FILE_NAME, mode: {".tag": 'overwrite'}, autorename: false, mute: true })
            .then((response: any) => {
              // console.log('here is dropbox::', dbx)
              if (this.studentAvailable === 2) {
                this.studentAvailable = 1
                this.utilityService.marker.next(1);
              }
              if (environment.send2Reg === true || this.utilityService.send2Regmarker === 2) {
                environment.send2Reg = false;
                this.utilityService.send2Regmarker = 1
                this.storage.remove3(DROPBOX_STATUS)
              }
              console.log('Saved to Dropbox successful')})
            .catch(function(error: any) {
              // If it errors because of a dropbox problem, reload the page so the user can re-connect to dropbox
              alert("Failed to save to dropbox");
              console.log(JSON.stringify(error));
              environment.dropboxToken = '';
              window.location.href = '/';
            });

        }, 3000)
      }



    })

  }
  deleteStudent(i: number, aQualif: Student): void {
    this.studentService.deleteStudent(aQualif);
    const temp = this.dataSource.data;

    this.dataSource.data = this.utilityService.sliceTable
    (i, this.paginator, temp);
  }

  setupStudentEmail(): void {
    const testStudent: Partial<Student> ={
      studentNo: 'testing12324556789',

      phone: '09025370146',
      maritalStatus: 'SINGLE',
      email: 'preciousadunse15@gmail.com',

      level: 100,
      studentType: 0,
      programme: 'BIOCHEMISTRY',
      title: 'MS',
      firstName: 'GLORY1224556789',
      lastName: 'ADUNSE1225',
      middleName: 'ANUOLUWAPO',
      gender: 'F',
      religion: 'CHRISTIANITY',
      state: 'EKITI',
      nationality: 'NIGERIAN',
      address: '8, 4TH AVENUE, IREWOLEDE ESTATE, MOWONLA IKORODU',
      activeStatus: true,

    }
    this.emailService.sendNewStudentData(new Array(testStudent as Student))
    // setTimeout(() => {
    //   this.emailService.sendNewStudentDataForGroup(new Array(testStudent as Student))
    // }, 5000)
  }



  addNew() {
    //this.emailService.getHeroes();
    const dialogRef = this.dialog.open(AddStudentComponent, {
      // width: '750px', height: '500px',
      data: { local_data: ''}
    });

    // const sub = dialogRef.componentInstance.onAdd.subscribe((data) => {
    //   alert(data);
    // });
    // dialogRef.updatePosition({ top: '40px', left: '50px' });

    dialogRef.afterClosed().subscribe((result) => {
      this.loadData();
      if (result) {
        console.log("THE RESULTS::::", result);
        if (result !== undefined && result.data !== undefined) {
          this.utilityService.marker.next(2)
          // this.studentService.newStudentMarker.next(2)
        }
      }
      else {
        console.log("THE NOT RESULTS::::", 'NOT');
        console.log("THE NOT RESULTS::::", result);


      }
    });
  }




  startEdit(row: Student ) {

    const dialogRef = this.dialog.open(EditStudentComponent, {

      data: {row
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('result', result);
      if (result) {}});
    // When using an edit things are little different, firstly we find record inside DataService by id
  }






  ngOnInit() {
    this.studentList = [];
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }

  applyFilter() {
    // const filterValue = (event.target as HTMLInputElement).value;
    this.loadFilterData(1);
    this.dataSource.filter = this.aFilterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}



function observableOf(arg0: never[]) {
  throw new Error('Function not implemented.');
}

