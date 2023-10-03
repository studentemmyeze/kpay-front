import { Component, OnInit } from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';

import { DateAdapter, MatDateFormats, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from 'src/app/utilities/format-datepicker';
import { BankService } from 'src/app/services/bank.service';
import { PaymentsService } from 'src/app/services/payments.service';
import { UtilityService } from 'src/app/services/utility.service';
import { Concession, LedgerInfo, Student, StudentLedgerEntry, StudentProduct } from 'src/app/interfaces/student';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { StudentService } from 'src/app/services/student.service';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';


@Component({
  selector: 'app-payment-info',
  templateUrl: './payment-info.component.html',
  styleUrls: ['./payment-info.component.css'],
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ]
})
export class PaymentInfoComponent implements OnInit {
  selectedLedgerInfo: Partial <LedgerInfo> = {};
  selectedStudent: Partial <Student> = {};

  productList: StudentProduct[] = [];
  paymentModeList = ['Cash', 'Transfer' , 'Bank', 'PayStack', 'Concessions', 'Error Correct']
  displayedColumns = ['datePosted', 'session', 'semester', 'product', 'qty',
    'dr', 'cr' ,'balance', 'paymentMode', 'bank' , 'tellerDate','receiptNo',
    'details', 'depositor' ,'studentNo', 'lastName', 'firstName', 'gender', 'level', 'programme','staffIn', 'actions'];
  paidList = ['>', '<', '=' ];
  Genders = [ 'M', 'F' ];

  Levels = [100, 200, 300, 400, 500 ];

  semesterList = [1, 2];
  sessionList: string[] = [];
  concessionList: Concession[] = [];
  studentList: Student[] =[];

  bankList: any[] = [];
  usersList: any[] = [];
  searchVariables = ['studentNo']
  dateMarker = false;
  tellerDateMarker = false;
  bankMarker = false;
  levelMarker = false;
  detailsMarker = false;
  paidMarker = false;
  concessionMarker = false;
  sessionMarker = false;
  receiptNoMarker = false;
  staffInMarker = false;
  semesterMarker = false;
  productMarker = false;
  transacTypeMarker = false;
  studyStatusMarker = false;
  debitMarker = false;
  paymentModeMarker = false;
  genderMarker = false;
  studentMarker = false;
  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });
  range2 = new FormGroup({
    start2: new FormControl(),
    end2: new FormControl(),
  });
  selectedProduct: Partial <StudentProduct> = {};
  selectedStaff: Partial <User> = {};
  stateCtrl = new FormControl();
  stateCtrlStaff = new FormControl();
  filteredStates: Observable<StudentProduct[]>;
  filteredStates2: Observable<Student[]>;
  filteredStates3: Observable<User[]>;
  stateCtrl2= new FormControl();




  constructor(
    private utilityService: UtilityService,
    private userService: UserService,
    private paymentsService: PaymentsService,
    private bankService: BankService,
    private studentService: StudentService
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

    this.filteredStates3 = this.stateCtrlStaff.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.staffID),
        map(state => state ? this._filterStates3(state) : this.usersList.slice())
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
    // this.bankList = this.bankService.getAllBanks();
    this.userService.getUsers().subscribe(
      data => {
        this.usersList = data;
        // console.log("APPLICATION:::", data);
      }
    );

    this.bankService.getAllBanks().subscribe(
      (data) => {
        if (data && data.length > 0 )
        {this.bankList = data; }

      }
    );



  }

  postingsTest(): void {
    if (this.dateMarker && this.range.value)
    {
      const dateList = [];
      dateList.push(this.range.value.start);
      dateList.push(this.range.value.end);
      this.selectedLedgerInfo.datePostedList = dateList;


    }
    // else {const tellerDateList = [];this.range2.reset();}

    if (this.tellerDateMarker && this.range2.value)
    {
      const tellerDateList = [];
      tellerDateList.push(this.range2.value.start2);
      tellerDateList.push(this.range2.value.end2);
      this.selectedLedgerInfo.tellerDateList = tellerDateList;


    }
    // else {const tellerDateList = [];this.range2.reset();}
    // console.log('HERE IS SELECTED_L_INFO:::', this.selectedLedgerInfo as LedgerInfo);

    this.paymentsService.getPostingsInfo(this.selectedLedgerInfo as LedgerInfo);
    this.paymentsService.PostingsExtra.subscribe((data) => {
      if (data) {
        // console.log("postings data",data);
      }
    })
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

  uncheckAll(): void {
    this.dateMarker = false;
    this.tellerDateMarker = false;
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
    this.studyStatusMarker = false;
  }

  checkStat(aString: string): void {
    if (aString === 'bank' && !this.bankMarker) {this.selectedLedgerInfo.bank = undefined}
    if (aString === 'bank') {
      if (this.bankMarker) {
        this.paymentModeMarker = true;
        this.selectedLedgerInfo.paymentMode = "Bank";
      }
      else {
        this.selectedLedgerInfo.bank = undefined;
        this.selectedLedgerInfo.paymentMode = undefined;
      }
    }

    if (aString === 'session' && !this.sessionMarker) {this.selectedLedgerInfo.session = undefined}
    if (aString === 'semester' && !this.semesterMarker) {this.selectedLedgerInfo.semester = undefined}
    if (aString === 'paymentMode' && !this.paymentModeMarker) {
      this.selectedLedgerInfo.paymentMode = undefined
    }

    if (aString === 'transacType' && !this.transacTypeMarker) {
      this.selectedLedgerInfo.transacType = 0;
    }

    if (aString === 'studyStatus' && !this.studyStatusMarker) {
      this.selectedLedgerInfo.studyStatus = undefined;
    }

    if (aString === 'receiptNo' && !this.receiptNoMarker) {this.selectedLedgerInfo.receiptNo = undefined}
    if (aString === 'product' && !this.productMarker) {
      this.selectedLedgerInfo.product = undefined;
      this.selectedProduct = {};
    }
    if (aString === 'studentNo' && !this.studentMarker) {
      this.selectedLedgerInfo.studentNo = undefined;
      this.selectedStudent = {};
    }

    if (aString === 'staffIn' && !this.staffInMarker) {
      this.selectedStaff.staffID = undefined;
      this.selectedStaff = {};
    }

    if (aString === 'date' && !this.dateMarker) {
      this.selectedLedgerInfo.datePostedList = [];
      this.range.reset();
      // this.range.value.end = null;
      // this.range.value.start = null;

    }

    if (aString === 'tellerdate' && !this.tellerDateMarker) {
      this.selectedLedgerInfo.tellerDateList = [];
      this.range2.reset();
      // this.range.value.end = null;
      // this.range.value.start = null;

    }
    if (aString === 'level' && !this.levelMarker) {this.selectedLedgerInfo.level = undefined}

    if (aString === 'paid' && !this.paidMarker) {
      this.selectedLedgerInfo.amount = undefined;
      this.selectedLedgerInfo.paidSign = undefined;
    }


  }
  calcTotal(): void {
    this.selectedLedgerInfo.product = this.selectedProduct.prodCode;
    // console.log("PRODUCT SELECTED::", this.selectedLedgerInfo.product);
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

  displayFnStaff(applicant: User): string {
    // console.log("THE INDEX::", applicant);
    // this.selectedApplication = applicant;
    // console.log("THE APP::", this.selectedStudent);

    return applicant && applicant.staffID ? applicant.staffID : '';
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

  private _filterStates3(value: string): User[] {
    const filterValue = value.toLowerCase();

    return this.usersList.filter(state =>
    {

      return state.staffID.toLocaleLowerCase().includes(filterValue)
        || state.lName.toLocaleLowerCase().includes(filterValue)
        || state.fName.toLocaleLowerCase().includes(filterValue)


    });
  }

  clearFilter(): void {
    this.selectedStudent = {};

  }

  clearFilterStaff(): void {
    this.selectedStaff = {};

  }

  setStudentNo(): void {
    this.selectedLedgerInfo.studentNo = this.selectedStudent.studentNo;
  }
  setStaffNo(): void {
    this.selectedLedgerInfo.staffIn = this.selectedStaff.staffID;
  }

}


