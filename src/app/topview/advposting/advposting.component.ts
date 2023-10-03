import { Component, OnInit } from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';

import { DateAdapter, MatDateFormats, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from 'src/app/utilities/format-datepicker';
import { PaymentsService } from 'src/app/services/payments.service';
import { UtilityService } from 'src/app/services/utility.service';
import { AdvPostingInfo, Concession, Student, StudentLedgerEntry, StudentProduct } from 'src/app/interfaces/student';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { StudentService } from 'src/app/services/student.service';
import { ApplicationService } from 'src/app/services/application.service';
import { UserService } from 'src/app/services/user.service';
import { DepartmentalService } from 'src/app/services/departmental.service';
import { Faculty } from 'src/app/interfaces/product';


@Component({
  selector: 'app-advposting',
  templateUrl: './advposting.component.html',
  styleUrls: ['./advposting.component.css'],
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ]
})
export class AdvpostingComponent implements OnInit {
  selectedLedgerInfo: Partial <AdvPostingInfo> = {};
  selectedLedgerEntry: Partial <StudentLedgerEntry> = {};
  selectedStudent: Partial <Student> = {};
  totalNumberProcessed = 0
  productList: StudentProduct[] = [];
  paymentModeList = ['Cash', 'Transfer' , 'Bank', 'PayStack', 'Concessions', 'Error Correct'];
  displayedColumns = ['datePosted', 'session', 'semester', 'product', 'qty',
    'dr', 'cr' ,'balance', 'paymentMode', 'bank', 'receiptNo',
    'details', 'studentNo', 'lastName', 'firstName', 'gender', 'level', 'programme', 'actions'];
  paidList = ['>', '<', '=' ];
  Genders = [ 'M', 'F' ];
  color = 'primary';
  value = 100
  Levels = [100, 200, 300, 400, 500 ];
  transacType2 = "0"
  semesterList = [1, 2];
  sessionList: string[] = [];
  concessionList: Concession[] = [];
  studentList: Student[] =[];
  departmentList: any[] = [];
  facultyList: any[] = [];
  bankList: any[] = [];
  searchVariables = ['studentNo']
  dateMarker = false;
  bankMarker = false;
  levelMarker = false;
  detailsMarker = false;
  paidMarker = false;
  concessionMarker = false;
  sessionMarker = false;
  receiptNoMarker = false;
  semesterMarker = false;
  productMarker = false;
  transacTypeMarker = false;
  facultyMarker = false;
  debitMarker = false;
  paymentModeMarker = false;
  genderMarker = false;
  studentMarker = false;
  departmentMarker = false;
  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });
  selectedProduct: Partial <StudentProduct> = {};
  stateCtrl = new FormControl();
  filteredStates: Observable<StudentProduct[]>;
  filteredStates2: Observable<Student[]>;
  stateCtrl2= new FormControl();
  facultyFeeList :string[] = []


  constructor(
    private utilityService: UtilityService,
    private paymentsService: PaymentsService,
    private applicationService: ApplicationService,
    private departmentalService: DepartmentalService,
    private studentService: StudentService,
    private userService: UserService
  ) {
    this.filteredStates = this.stateCtrl.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.product),
        map(state => state ? this._filterStates(state) : this.productList.slice())
      );

    this.filteredStates2 = this.stateCtrl2.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.studentNo),
        map(state => state ? this._filterStates2(state) : this.studentList.slice())
      );
  }

  ngOnInit(): void {
    // this.sessionList = this.utilityService.generateSessionList();
      this.utilityService.generateSessionList().subscribe(
          data => {
              this.sessionList = data;
              // console.log("APPLICATION:::", data);
          }
      );
    // this.departmentList =  this.applicationService.getProgrammes();
      this.departmentalService.getProgrammes().subscribe(
          data => {
              this.departmentList = data;
              // console.log("APPLICATION:::", data);
          }
      );
    // this.facultyList =  this.applicationService.getFaculties();
      this.applicationService.getFaculties().subscribe(
          (data:string[]) => {
              this.facultyList = data;
              console.log("faculty:::", data);
          }
      );
    this.paymentsService.getProductList().subscribe(
      data => {
        this.productList = data;
      }
    );
    this.studentService.getStudentsList().subscribe(
      data => {
        this.studentList = data;
        // console.log("APPLICATION:::", data);
      }
    );
    this.paymentsService.getConcessionList().subscribe(
      data => {
        this.concessionList = data;
      }
    );

    this.departmentalService.getFaculties().subscribe(
      (faculties:Faculty[]) => {
        if (faculties) {
          faculties.forEach(e => {
            this.facultyFeeList.push(e.dCode + "FEES");
          });
        }
      }
    );


  }

  debCred(): string {
    return this.selectedLedgerInfo.transacType == 2 ? "CREDIT" : "DEBIT"
  }
  public checkFeeType() {
    // let answer = false;
    // console.log(this.transacType2 )
    if (this.transacType2 === "2" )
    {
      this.paidMarker = false;
      this.productMarker = true;
      this.selectedLedgerInfo.amount = undefined
    }

    else  {
      this.selectedProduct = {}
      this.paidMarker = true;
      this.productMarker = false;
    }


    console.log([this.paidMarker, this.productMarker, this.transacType2]);
  }

  private _filterStates(value: string): StudentProduct[] {
    const filterValue = value.toLowerCase();

    return this.productList.filter(state =>
    {

      return state.prodCode.toLocaleLowerCase().includes(filterValue)
        || state.description.toLocaleLowerCase().includes(filterValue);
      // state.jambNo.toLowerCase().includes(filterValue)
      // || state.lastName.toLowerCase().includes(filterValue);

    });
  }

  clearAdvancedVariables(): void {
    this.selectedProduct = {};
    this.selectedLedgerInfo = {};
    this.transacType2 = "0";


  }

  advancedPost(): void {
    this.value = 0
    this.totalNumberProcessed = 0;
    // this.value = 0
    // const feeCode = ['COMPASSFEES', 'MASSFEES', 'ENGINEERINGFEES', 'LAWFEES']

    this.paymentsService.getBalanceAdvanced(this.selectedLedgerInfo as AdvPostingInfo)
      .subscribe(data =>{
        if (data) {
          console.log('THis is what is contained::', this.selectedLedgerInfo);
          console.log(data);
          for (let i = 0; i < data.length; i++) {

            this.selectedLedgerEntry = {}
            //@ts-ignore
            this.selectedLedgerEntry.balance = ((data[i][0] ? data[i][0] : 0.0) +
              (this.selectedLedgerInfo.transacType === "1" ? -1 : 1) *
              (this.selectedLedgerInfo.amount ? this.selectedLedgerInfo.amount : (this.selectedProduct.price ? this.selectedProduct.price : 0.0)))
            this.selectedLedgerEntry.product = this.selectedLedgerInfo.product as string;
            this.selectedLedgerEntry.dr = this.selectedLedgerInfo.transacType === "1" ?
              ((this.selectedLedgerInfo.amount) ? this.selectedLedgerInfo.amount :
                (this.selectedProduct.price ? this.selectedProduct.price : 0.0)) : undefined
            this.selectedLedgerEntry.cr = this.selectedLedgerInfo.transacType === "2" ?
              (this.selectedLedgerInfo.amount ? this.selectedLedgerInfo.amount :
                (this.selectedProduct.price ? this.selectedProduct.price : 0.0)) : undefined

            this.selectedLedgerEntry.semester = this.selectedLedgerInfo.semester
            this.selectedLedgerEntry.session = this.selectedLedgerInfo.session
            if (this.transacType2 === "1") { // amount
              if (this.selectedLedgerInfo.transacType === "1"){ // debit
                this.selectedLedgerEntry.details = `AUTO DEBITS: ${this.selectedLedgerInfo.details}`;
              }
              else {
                this.selectedLedgerEntry.details = `AUTO CREDITS: ${this.selectedLedgerInfo.details} PAYMENT`;
              }
            }
            else if (this.transacType2 === "2"){// product
              let similarFound = false;
              this.facultyFeeList.forEach(e=>{
                similarFound =(this.selectedLedgerInfo.product as string).split(e).length > 1 ? true : similarFound
              })
              if (this.selectedLedgerInfo.transacType === "1"){ // debit
                this.selectedLedgerEntry.details = this.facultyFeeList.includes(this.selectedLedgerInfo.product as string) || similarFound ? `AUTO DEBITS: ${this.selectedLedgerInfo.session} TUITION, ACCOMMODATION AND FEEDING FEES` :
                  `AUTO DEBITS: ${this.selectedProduct.description}`
              }
              else {
                this.selectedLedgerEntry.details = this.facultyFeeList.includes(this.selectedLedgerInfo.product as string) || similarFound ? `AUTO CREDITS: ${this.selectedLedgerInfo.session} TUITION, ACCOMMODATION AND FEEDING PAYMENT` :
                  `AUTO CREDITS: ${this.selectedProduct.description} PAYMENT`
              }

            }
            // this.selectedLedgerEntry.details = this.selectedLedgerInfo.transacType === "2" ? `AUTO CREDITS:` :

            this.selectedLedgerEntry.staffIn = this.userService.getUser();
            this.selectedLedgerEntry.qty = 1
            console.log("@ledgeer Entry", this.selectedLedgerEntry)
            this.paymentsService.makePosting(data[i][1], this.selectedLedgerEntry as StudentLedgerEntry)
              .subscribe(postingstatus => {
                if (postingstatus) {
                  this.totalNumberProcessed += 1
                  this.value = Math.floor(this.totalNumberProcessed/data.length) * 100
                  if (this.value === 100) {this.clearAdvancedVariables();}
                }
              })
            // console.log('@selected product::', this.selectedProduct)
          }

        }
      })

    // console.log("totalNumberProcessed::", totalNumberProcessed)

  }
  uncheckAll(): void {
    this.dateMarker = false;
    this.bankMarker = false;
    this.levelMarker = false;
    this.detailsMarker = false;
    this.paidMarker = false;
    this.concessionMarker = false;
    this.sessionMarker = false;
    this.receiptNoMarker = false;
    this.semesterMarker = false;
    this.productMarker = false;
    this.debitMarker = false;
    this.paymentModeMarker = false;
    this.genderMarker = false;
    this.studentMarker = false;
    this.transacTypeMarker = false;
  }

  checkStat(aString: string): void {


    if (aString === 'session' && !this.sessionMarker) {this.selectedLedgerInfo.session = undefined}
    if (aString === 'faculty' && !this.facultyMarker) {this.selectedLedgerInfo.faculty = undefined}
    if (aString === 'programme' && !this.departmentMarker) {this.selectedLedgerInfo.programme = undefined}

    if (aString === 'semester' && !this.semesterMarker) {this.selectedLedgerInfo.semester = undefined}
    if (aString === 'paymentMode' && !this.paymentModeMarker) {
      this.selectedLedgerInfo.paymentMode = undefined
    }

    if (aString === 'transacType' && !this.transacTypeMarker) {
      this.selectedLedgerInfo.transacType = 0;
    }

    if (aString === 'product' && !this.productMarker) {
      this.selectedLedgerInfo.product = undefined;
      this.selectedProduct = {};
    }
    if (aString === 'studentNo' && !this.studentMarker) {
      this.selectedLedgerInfo.studentNo = undefined;
      this.selectedStudent = {};
    }


    if (aString === 'level' && !this.levelMarker) {this.selectedLedgerInfo.level = undefined}




  }
  calcTotal(): void {
    this.selectedLedgerInfo.product = this.selectedProduct.prodCode;
    console.log("PRODUCT SELECTED::", this.selectedLedgerInfo.product);
    // if (this.selectedProduct.price !== undefined && this.selectedLedgerEntry.qty !== undefined)
    //   this.tempTotal = this.selectedProduct.price * this.selectedLedgerEntry.qty;
  }

  displayFn(applicant: StudentProduct): string {
    // console.log("THE INDEX::", applicant);
    // this.selectedApplication = applicant;
    // console.log("THE APP::", this.selectedProduct);

    return applicant && applicant.prodCode ? applicant.prodCode : '';
  }

  displayFn2(applicant: Student): string {
    // console.log("THE INDEX::", applicant);
    // this.selectedApplication = applicant;
    // console.log("THE APP::", this.selectedStudent);

    return applicant && applicant.studentNo ? applicant.studentNo : '';
  }

  private _filterStates2(value: string): Student[] {
    const filterValue = value.toLowerCase();

    return this.studentList.filter(state =>
    {

      return state.studentNo.toLocaleLowerCase().includes(filterValue)
        || state.lastName.toLocaleLowerCase().includes(filterValue)
        || state.firstName.toLocaleLowerCase().includes(filterValue)
        || state.programme.toLowerCase().includes(filterValue);
      // state.jambNo.toLowerCase().includes(filterValue)
      // || state.lastName.toLowerCase().includes(filterValue);

    });
  }

  clearFilter(): void {
    this.selectedStudent = {};

  }

  setStudentNo(): void {
    this.selectedLedgerInfo.studentNo = this.selectedStudent.studentNo;
  }

}


