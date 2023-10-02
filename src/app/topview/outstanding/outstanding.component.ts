import { Component, OnInit } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { BehaviorSubject } from 'rxjs';
import { LedgerInfo, OutstandingInfo, OutstandingInfoData } from 'src/app/interfaces/student';
import { ApplicationService } from 'src/app/services/application.service';
import { BankService } from 'src/app/services/bank.service';
import { PaymentsService } from 'src/app/services/payments.service';
import { StudentService } from 'src/app/services/student.service';
import { UtilityService } from 'src/app/services/utility.service';
import { AppDateAdapter, APP_DATE_FORMATS } from 'src/app/utilities/format-datepicker';

@Component({
  selector: 'app-outstanding',
  templateUrl: './outstanding.component.html',
  styleUrls: ['./outstanding.component.css'],
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
  ]
})
export class OutstandingComponent implements OnInit {
  selectedLedgerInfo: Partial <OutstandingInfo> = {};
  DCol: any[] = [];
  displayedColumns = [

    'studentNo', 'lastName', 'firstName', 'middleName','balance','gender', 'level', 'programme'];
  paidList = ['>', '<', '=' ];
  Genders = [ 'M', 'F' ];
  OutstandingList: BehaviorSubject<any[]> = new BehaviorSubject <any[]>([]);

  Levels = [100, 200, 300, 400, 500 ];

  semesterList = [1, 2];
  sessionList: string[] = [];
  departmentList: any[] = [];
  facultyList: any[] = [];
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
  debitMarker = false;
  paymentModeMarker = false;
  genderMarker = false;
  studentMarker = false;
  facultyMarker = false;
  departmentMarker = false;
  outOrCred = false;
  OutstandingText = 'Outstanding';
  Outcredcolor = 'warn';
  constructor(
    private utilityService: UtilityService,
    private paymentsService: PaymentsService,
    private bankService: BankService,
    private studentService: StudentService,
    private applicationService: ApplicationService

  ) {

  }

  ngOnInit(): void {
    this.selectedLedgerInfo.paidSign = '<';
    this.DCol.push(this.displayedColumns);
    this.DCol.push(this.OutstandingList);

    this.applicationService.getProgrammes().subscribe((data)=> {
      this.departmentList = data
    });
    this.applicationService.getFaculties().subscribe((data)=> {
      this.facultyList = data
    });;

    this.Outcredcolor = this.outOrCred ? 'primary' : 'warn';
  }

  swap(): void {
    this.outOrCred = !this.outOrCred
    this.OutstandingText = this.outOrCred ? 'Creditors' : 'Outstandings';
    this.Outcredcolor = this.outOrCred ? 'primary' : 'warn';
  }
  postingsTest(): void {
    // if (this.dateMarker && this.range.value)
    //   {
    //     const dateList = [];
    //     dateList.push(this.range.value.start);
    //     dateList.push(this.range.value.end);
    //     this.selectedLedgerInfo.datePostedList = dateList;


    //   }
    if (this.selectedLedgerInfo.amount) {
      this.selectedLedgerInfo.paidSign = '<'
    }

    console.log('HERE IS SELECTED_L_INFO:::', this.selectedLedgerInfo as LedgerInfo);

    this.paymentsService.getBalanceBulkClearance(this.selectedLedgerInfo as OutstandingInfo);
    this.paymentsService.BalanceBulk.subscribe((tempData) => {
      if (tempData) {
        this.selectedLedgerInfo.amount = this.selectedLedgerInfo.amount ? this.selectedLedgerInfo.amount : 0
        const data =
          this.filterOutstanding((this.selectedLedgerInfo.amount), tempData)  ;

        if (this.DCol.length > 1) {

          this.OutstandingList.next(data);
          // this.DCol[1] = DCol[1].next(data);
        }
        else {
          this.DCol = [];
          this.DCol.push(this.displayedColumns);
          this.DCol.push(this.OutstandingList.next(data));
        }
      }
      console.log('THIS IS DCOL:::', this.DCol);
    })
  }

  filterOutstanding(cutOff: number, sourceData: OutstandingInfoData[]): OutstandingInfoData[] {
    const tempObj: any[] = [];
    if (this.outOrCred) {
      sourceData.forEach(
        e => {
          // var tempObj = [];
          if ((e.balance >= cutOff) ) {
            // console.log('THIS IS LESS THAN CUTOFF:::', cutOff, e.balance);
            tempObj.push(e);
          }

        });
    }
    else {
      cutOff = -1*cutOff;
      sourceData.forEach(
        e => {
          // var tempObj = [];
          if ((e.balance < cutOff) ) {
            // console.log('THIS IS LESS THAN CUTOFF:::', cutOff, e.balance);
            tempObj.push(e);
          }

        });
    }

    return tempObj;
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


    if (aString === 'faculty' && !this.facultyMarker) {this.selectedLedgerInfo.faculty = undefined}
    if (aString === 'programme' && !this.departmentMarker) {this.selectedLedgerInfo.programme = undefined}

    if (aString === 'transacType' && !this.transacTypeMarker) {
      this.selectedLedgerInfo.status = 0;
    }


    if (aString === 'gender' && !this.genderMarker) {
      this.selectedLedgerInfo.gender = undefined;
    }




    if (aString === 'date' && !this.dateMarker) {
      this.selectedLedgerInfo.dateToLookAt = undefined;
      // this.range.value.end = null;
      // this.range.value.start = null;

    }
    if (aString === 'level' && !this.levelMarker) {this.selectedLedgerInfo.level = undefined}

    if (aString === 'paid' && !this.paidMarker) {
      this.selectedLedgerInfo.amount = undefined;
      this.selectedLedgerInfo.paidSign = undefined;
    }


  }






}

