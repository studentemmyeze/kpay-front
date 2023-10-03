// https://www.npmjs.com/package/jspdf-invoice-template

import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { OutstandingInfo, LedgerInfo, OutstandingInfoData, BillInfo, BillInfoData, Student, StudentLedgerEntryMax, StudentLedgerEntryMax2 } from 'src/app/interfaces/student';
import { ApplicationService } from 'src/app/services/application.service';
import { BankService } from 'src/app/services/bank.service';
import { PaymentsService } from 'src/app/services/payments.service';
import { StudentService } from 'src/app/services/student.service';
import { UtilityService } from 'src/app/services/utility.service';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { ApprovedBank } from 'src/app/interfaces/user';
import { BillService } from 'src/app/services/bill.service';
import { BillPipe } from 'src/app/pipes/bill.pipe';
import { SendingbillsService } from 'src/app/services/sendingbills.service';
import { ScriptService } from 'src/app/services/script.service';
// import jsPDFInvoiceTemplate, { OutputType, jsPDF } from "jspdf-invoice-template";

// declare let pdfMake: any ;
// declare let vfsFonts: any ;
import jsPDF from 'jspdf'
import { TU_LOGO_IMAGE } from 'src/app/utilities/sharedFile';

import autoTable from 'jspdf-autotable'// import JSPDF from 'jspdf';
import { Options } from 'selenium-webdriver';
import { LedgerMaxPipe } from 'src/app/pipes/ledger-max.pipe';


@Component({
  selector: 'app-bills',
  templateUrl: './bills.component.html',
  styleUrls: ['./bills.component.css'],
  providers: [BillPipe, LedgerMaxPipe]

})


export class BillsComponent implements OnInit {
  selectedLedgerInfo: Partial <BillInfo> = {};
  selectedStudent: Partial <Student> = {};

  DCol: any[] = [];
  displayedColumns = [

    'studentNo', 'lastName', 'firstName', 'middleName','balance','gender', 'level', 'programme'];
  paidList = ['>', '<', '=' ];
  Genders = [ 'M', 'F' ];
  OutstandingList: BehaviorSubject<any[]> = new BehaviorSubject <any[]>([]);

  progressChecks: BehaviorSubject<number> = new BehaviorSubject <number>(0);
  studentListToEmail: string[] = []

  Levels = [100, 200, 300, 400, 500 ];
  facultyList: string[] = [];
  semesterList = [1, 2];
  sessionList: string[] = [];
  departmentList: any[] = [];
  studentList: Student[] =[];
  totalNumberProcessedPrint = 0;
  totalNumberProcessedEmail = 0;
  totalNumberProcessedEmailSent = 0;
  color = 'primary';
  valuePrint = 100
  valueEmail = 100
  valueEmailSent = 100
  searchVariables = ['studentNo']
  dateMarker = true;
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
  rearrangePostings = false;
  debitMarker = false;
  departmentMarker = false;
  facultyMarker = false;
  genderMarker = false;
  studentMarker = false;

  separatorKeysCodes: number[] = [ENTER, COMMA];
  fruitCtrl = new FormControl();
  stateCtrl2= new FormControl();

  filteredBank: Observable<ApprovedBank[]>;
  filteredStates2: Observable<Student[]>;


  bank: ApprovedBank[] = [] ;
  bankList: ApprovedBank[] = [];
  @ViewChild('bankInput') bankInput: ElementRef<HTMLInputElement>;
  constructor(
    private utilityService: UtilityService,
    private paymentsService: PaymentsService,
    private bankService: BankService,
    private studentService: StudentService,
    private applicationService: ApplicationService,
    private billService: BillService,
    private billPipe: BillPipe,
    private ledgerMaxPipe: LedgerMaxPipe,
    private sendBillService: SendingbillsService,
    private scriptService: ScriptService


  ) {
    this.scriptService.load('pdfMake', 'vfsFonts');

    this.bankList = this.bankService.getApprovedBanks();
    // console.log("BANK LIST::", this.bankList);
    this.bank.push(this.bankList[0]);
    this.filteredBank = this.fruitCtrl.valueChanges.pipe(
      startWith(null),
      map((fruit: ApprovedBank | null) => (fruit ? this._filter(fruit.longName) : this.bankList.slice())),
    );

    this.progressChecks.subscribe(
      (data) => {
        if (data) {
          this.sendBillService.getEmailStatus().subscribe((statusInfo) => {
            console.log("STATUS INFO:::", statusInfo);
          });
        }
        else {}
      }
    )

    this.filteredStates2 = this.stateCtrl2.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.studentNo),
        map(state => state ? this._filterStates2(state) : this.studentList.slice())
      );
    this.studentService.getStudentsList().subscribe(
      data => {
        this.studentList = data;
        // console.log("APPLICATION:::", data);
      }
    );

  }

  ngOnInit(): void {
    this.DCol.push(this.displayedColumns);
    this.DCol.push(this.OutstandingList);

    // this.departmentList =  this.applicationService.getProgrammes();
    // this.sessionList = this.utilityService.generateSessionList();
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

    this.utilityService.generateSessionList().subscribe(
        data => {
          this.sessionList = data;
          // console.log("APPLICATION:::", data);
        }
    );


  }



  // receives sorted transactions and re-arranges it debit before credit
  reArrangeTransactions(aBillInfoData: StudentLedgerEntryMax2[]): StudentLedgerEntryMax2[] {
    const result: StudentLedgerEntryMax2[] = [];
    const acceptance_cr: StudentLedgerEntryMax2[] = [];
    const acceptance_dr: StudentLedgerEntryMax2[] = [];

    const fees_cr: StudentLedgerEntryMax2[] = [];
    const fees_dr : StudentLedgerEntryMax2[]= [];

    const jamb_cr: StudentLedgerEntryMax2[] = [];
    const jamb_dr : StudentLedgerEntryMax2[]= [];
    const dataSource2 = aBillInfoData;
    const dataSource: StudentLedgerEntryMax2[]= [];
    let addHours = 4;
    dataSource2.sort((a, b) => +new Date(a.datePosted ) - +new Date (b.datePosted))

    dataSource2.forEach(data => {
      if (data) {dataSource.push(data)}
    })

    if (dataSource2[0].studentNo === "202100055") {
      dataSource2.forEach(data => {
        console.log("\n\nXXXXXXXXXXX dataSource2", data.studentNo, data?.dr, data?.cr, data.balance)

      })
    }

    const beginDate = new Date(dataSource[0].datePosted);
    for (let i = 0; i < dataSource.length; i++) {
      if (dataSource[i].cr && dataSource[i].product.includes('ACCEPTANCE'))
      {
        acceptance_cr.push(dataSource[i]);
      }

      if (dataSource[i].dr && dataSource[i].product.includes('ACCEPTANCE'))
      {
        acceptance_dr.push(dataSource[i]);
      }

      if (dataSource[i].cr && !dataSource[i].product.includes('ACCEPTANCE') && dataSource[i].product.includes('FEE'))
      {
        fees_cr.push(dataSource[i]);
      }



      if (dataSource[i].dr && !dataSource[i].product.includes('ACCEPTANCE') && dataSource[i].product.includes('FEE'))
      {
        if (dataSource[i].product.includes('LAWFEES') ||
          dataSource[i].product.includes('ENGINEERINGFEES') ||
          dataSource[i].product.includes('MASSFEES') ||
          dataSource[i].product.includes('COMPASSFEES')) {
          dataSource[i].details = '2021/2022 tuition, accommodation and feeding fees';
          dataSource[i].details = dataSource[i].details.toUpperCase();

        }
        fees_dr.push(dataSource[i]);
      }

      if (dataSource[i].dr && dataSource[i].product.includes('JAMB') )
      {
        jamb_dr.push(dataSource[i]);
      }

      if (dataSource[i].cr && dataSource[i].product.includes('JAMB') )
      {
        jamb_cr.push(dataSource[i]);
      }

    }

    if (dataSource2[0].studentNo === "202100055") {
      console.log("CHECK", acceptance_cr, acceptance_dr, fees_cr, fees_dr, jamb_cr, jamb_dr)
    }


    if (acceptance_cr && acceptance_cr[0]) {
      let crDate = new Date(acceptance_cr[0].datePosted);
      // if (new Date(acceptance_cr[0].datePosted))
      if (acceptance_dr)
      {
        // const drDate = crDate.setTime(crDate.getTime()- (addHours * 60 * 60 * 1000))
        //acceptance_dr[0].datePosted = new Date(drDate);// .setDate(acceptance_cr[0].datePosted.getDate() - 0.3);
        acceptance_dr[0].datePosted = new Date(beginDate.setTime(beginDate.getTime() - (addHours*60*60*1000)));
        acceptance_dr.forEach(acceptance => {
          result.push(acceptance);
        });

        acceptance_cr.forEach(acceptance => {
          result.push(acceptance);
        });
        // result.push(acceptance_dr[0]);
        // result.push(acceptance_cr[0]);
      }


    }

    else {
      acceptance_dr[0].datePosted = new Date(beginDate.setTime(beginDate.getTime() - (addHours*60*60*1000)));
      result.push(acceptance_dr[0]);

    }

    if (fees_cr && fees_cr[0]) {
      let crFeeDate = new Date(fees_cr[0].datePosted);
      if (fees_dr)
      {
        const drFeeDate = crFeeDate.setTime(crFeeDate.getTime()- ((addHours - 1) * 60 * 60 * 1000))
        fees_dr[0].datePosted = new Date(drFeeDate);
        result.push(fees_dr[0]);

      }

      fees_cr.forEach(data => {
        result.push(data);
      })

    }

    else {

      fees_dr.forEach(data => {
        result.push(data);
      });

      // result.push(fees_dr[0]);

    }

    if (jamb_dr) {
      // jamb_dr[0].datePosted = new Date(fees_cr[0].datePosted.getDate() - 0.3)
      result.push(jamb_dr[0]);

    }

    if (jamb_cr) {result.push(jamb_cr[0]);}

    let balance = 0.00;
    const temp2: StudentLedgerEntryMax2[] = [];
    result.forEach((data: StudentLedgerEntryMax2) => {

      if (data) {temp2.push(data)}
    })

    ///////
    if (temp2[0].studentNo === "202100055") {
      temp2.forEach(data => {
        console.log("\n\nXXXXXXXXXXX", data.studentNo, data?.dr, data?.cr, data.balance)

      })
    }

    temp2.sort((a, b) => +new Date(a.datePosted ) - +new Date (b.datePosted))
    const temp3:any[] = [];
    temp2.forEach(data => {
      if (data) {temp3.push(data)}
    })

    if (temp3[0].studentNo === "202100055") {
      temp3.forEach(data => {
        console.log("\n\nXXXXXXXXXXX", data.studentNo, data?.dr, data?.cr, data.balance)

      })
    }
    for (let i = 0; i < temp3.length; i++) {

      if (temp3[i]) {

        if (temp3[i].studentNo === "202100055") {
          console.log("\n\nXXXXXXXXXXX", temp3[i].studentNo, temp3[i]?.dr, temp3[i]?.cr, temp3[i].balance)
        }
        if (temp3[i].dr !== undefined && temp3[i].dr)
        {

          temp3[i].balance = balance - temp3[i].dr  ;
          balance = balance - temp3[i].dr;
        }
        else {

          temp3[i].balance = balance +  temp3[i].cr ;
          balance = balance +  temp3[i].cr;
        }
      }
      if (temp3[i].studentNo === "202100055") {
        console.log("\n\nXXXXXXXXXXX", temp3[i])

      }
      this.waitforme(500);

    }
    const temp: StudentLedgerEntryMax2[] = [];
    temp3.forEach((data: StudentLedgerEntryMax2) => {

      if (data) {temp.push(data)}
    })

    return temp;
  }

  exportToPdf2(aBillInfoData: BillInfoData[]) {
    let prepare: any[] = [];
    const dataSource = aBillInfoData;
    console.log('aBILLINFODATA::', aBillInfoData[0] )
    const studentFirstName = aBillInfoData[0].firstName;
    const studentLastName =aBillInfoData[0].lastName;
    const studentNo =aBillInfoData[0].studentNo;
    const programme = aBillInfoData[0].programme;
    let dataSource2 = [];

    dataSource.sort((a, b) => +new Date(a.datePosted ) - +new Date (b.datePosted))

    let lastBalance = dataSource[dataSource.length - 1].balance;
    // console.log('each bill', dataSource, lastBalance);

    // check for balance filter
    if (this.selectedLedgerInfo.balance === undefined || (lastBalance < (-1 * this.selectedLedgerInfo.balance) && lastBalance ))
    {
      console.log("ENTERRED");
      // console.log("INSIDE IF- lastbalance - cutoff::", lastBalance, this.selectedLedgerInfo.balance)
      lastBalance = lastBalance > 0 ? 0.0 : lastBalance;
      dataSource.forEach(
        e => {
          var tempObj = [];
          const d = new Date(e.datePosted);
          const ye = new Intl.DateTimeFormat('en-GB', { year: 'numeric' }).format(d);
          const mo = new Intl.DateTimeFormat('en-GB', { month: '2-digit' }).format(d);
          const da = new Intl.DateTimeFormat('en-GB', { day: '2-digit' }).format(d);
          // const bb = d.toLocaleTimeString('en-GB');
          const myDate = (`${da}/${mo}/${ye} `);

          tempObj.push(myDate);

          if (e.details) {
            const breakDetails = e.details.split(' ');
            const last = breakDetails[breakDetails.length - 1].toUpperCase();

            if (e.cr && last !== 'PAYMENT' && last !== 'BF' ) {
              tempObj.push(e.details?.toUpperCase() + ' PAYMENT');
            }

            else {

              tempObj.push(e.details.toUpperCase());
            }
            // console.log('SPLIT DETAIL LAST::', breakDetails[breakDetails.length - 1])
          }

          else {tempObj.push('');}
          // tempObj.push(e.details?.toUpperCase());

          if (e.dr)
          {
            try {
              tempObj.push( e.dr.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') );

            } catch (error) {
              tempObj.push( '0.00' );


            }
          }

          else {
            tempObj.push ('');
          }
          // tempObj.push( e.dr ? e.dr.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') : '');

          // tempObj.push( e.cr ? e.cr.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') : '');


          if (e.cr)
          {
            try {
              tempObj.push( e.cr.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') );

            } catch (error) {
              tempObj.push( '0.00' );


            }
          }

          else {
            tempObj.push ('');
          }

          if (e.balance)
          {
            try {
              tempObj.push( e.balance.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') );

            } catch (error) {
              tempObj.push( '0.00' );


            }
          }

          else {
            tempObj.push ('0.00');
          }


          // tempObj.push( e.balance ? e.balance.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') : '0.00');

          // tempObj.push(e.department);

          // tempObj.push(e.level);
          dataSource2 = tempObj;
          prepare.push(tempObj);
        });
      const doc = new jsPDF({
        orientation: "portrait"

      });

      const d = new Date();
      const ye = new Intl.DateTimeFormat('en-GB', { year: 'numeric' }).format(d);
      const mo = new Intl.DateTimeFormat('en-GB', { month: '2-digit' }).format(d);
      const da = new Intl.DateTimeFormat('en-GB', { day: '2-digit' }).format(d);
      const bb = d.toLocaleTimeString('en-GB');
      const myDate = (`${da}/${mo}/${ye} `);
      doc.text("TOPFAITH UNIVERSITY, MKPATAK", 60, 12);
      doc.text("AKWA IBOM STATE", 60, 20);
      doc.setFontSize(10);
      doc.text("Email: info@topfaith.edu.ng", 60, 28);
      doc.text("Phone: +2348053475763 ; +2347066211122", 60, 33);



      // salutation
      doc.setFontSize(10);
      doc.text(`${myDate} `, 12,43)

      doc.text(`Dear ${studentLastName} ${studentFirstName} (${studentNo} -${programme}), `, 12,51)
      doc.setFontSize(12);
      doc.text(`${this.selectedLedgerInfo.session} SESSION FINANCIAL POSITION`, 60,63,)



      doc.addImage(TU_LOGO_IMAGE, 'PNG', 10, 5, 28,28);

      autoTable(doc,
        { head: [['DATE POSTED','DETAILS','DEBIT','CREDIT','BALANCE']],
          body: prepare, startY: 66,
          bodyStyles: {lineWidth:0.2, cellPadding:2} ,
          columnStyles: {0: { cellWidth: 30, halign: 'center'}, 1: { cellWidth: 'auto'}, 2: {halign: 'right', cellWidth:'wrap'}, 3: {halign: 'right', cellWidth:'wrap'}, 4: {halign: 'right', cellWidth:'wrap'}},
          headStyles: { halign: 'center', fillColor:  false, textColor: 20, lineWidth:0.2 , cellPadding:2},
          showFoot: 'lastPage',
          tableLineWidth: 0.5,
          theme: 'grid'

        })


      // @ts-ignore
      const endY = Math.round(doc.autoTable.previous.finalY)

      doc.text(`FEES PAYABLE:`, 60, endY + 6)
      doc.text(`${Math.abs(lastBalance).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`, 172, endY + 5)



      doc.text(`PLEASE MAKE PAYMENTS VIA THIS LINK:`, 10, endY + 17)
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 255);
      doc.text(` https://paystack.com/pay/paytopfaithfees`, 103, endY + 17)

      doc.setTextColor(0, 0, 0);

      doc.setFontSize(9);

      doc.text(`Please note that payments can also be made to any of the following banks:`, 10, endY + 28)



      autoTable(doc,
        {        body: [['UBA  (1024784509)','FCMB   (9324084010)', 'ZENITH BANK   (1217023060)']], startY: endY + 33,

          // body: [['UBA  (1024784509)', 'ZENITH BANK   (1217023060)']], startY: endY + 33,
          bodyStyles: {lineWidth:0.2, cellWidth:'wrap', cellPadding:2, fontSize:9} ,

          headStyles: { halign: 'center', fillColor:  false, textColor: 20, lineWidth:0.2 , cellPadding:2},
          showFoot: 'lastPage',
          tableLineWidth: 0.5,
          theme: 'grid'

        })

      // @ts-ignore
      const endY2 = Math.round(doc.autoTable.previous.finalY)

      doc.setFont('helvetica', 'normal')
      // console.log('FONTLIST', doc.getFontList());
      doc.setFontSize(10);
      doc.text(`NOTE: ANY PAYMENT INTO ANY LINK OR BANK OTHER THAN THE LISTED`, 10, endY2 + 13)
      doc.text(`ABOVE SHALL NOT BE ACCEPTED.`, 10, endY2 + 18)
      doc.text(`EVIDENCE OF PAYMENTS MADE INTO THE BANK ACCOUNTS LISTED SHOULD BE SENT TO: bursary@topfaith.edu.ng `, 10, endY2 + 25)
      doc.setFontSize(9);
      doc.text(`Thank you.`, 10, endY2 + 37)

      doc.text(`Topfaith University Bursary`, 10, endY2 + 47)
      doc.save(studentNo + '.pdf');
    }

  }

  exportToPdf_Print(aBillInfoData: BillInfoData[], doc: any) {
    let prepare: any[] = [];
    const dataSource = aBillInfoData;
    // console.log('DATASOURCE:::', aBillInfoData);
    const studentFirstName =aBillInfoData[0].firstName;
    const studentLastName =aBillInfoData[0].lastName;
    const studentNo =aBillInfoData[0].studentNo;
    const programme = aBillInfoData[0].programme;
    let dataSource2 = [];

    dataSource.sort((a, b) => +new Date(a.datePosted ) - +new Date (b.datePosted))
    let lastBalance = dataSource[dataSource.length - 1].balance;
    // console.log('LAST BALANCE::', lastBalance);
    if (this.selectedLedgerInfo.balance === undefined || (lastBalance < (-1 * this.selectedLedgerInfo.balance) && lastBalance ))
    {
      // console.log('LAST BALANCE ENTERED::', lastBalance, this.selectedLedgerInfo.balance);

      // console.log("INSIDE IF- lastbalance - cutoff::", lastBalance, this.selectedLedgerInfo.balance)
      lastBalance = lastBalance > 0 ? 0.0 : lastBalance;
      dataSource.forEach(
        e => {
          var tempObj = [];
          const d = new Date(e.datePosted);
          const ye = new Intl.DateTimeFormat('en-GB', { year: 'numeric' }).format(d);
          const mo = new Intl.DateTimeFormat('en-GB', { month: '2-digit' }).format(d);
          const da = new Intl.DateTimeFormat('en-GB', { day: '2-digit' }).format(d);
          // const bb = d.toLocaleTimeString('en-GB');
          const myDate = (`${da}/${mo}/${ye} `);

          tempObj.push(myDate);
          if (e.details) {
            const breakDetails = e.details.split(' ');
            const last = breakDetails[breakDetails.length - 1].toUpperCase();

            if (e.cr && last !== 'PAYMENT' && last !== 'BF'  ) {
              tempObj.push(e.details?.toUpperCase() + ' PAYMENT');
            }

            else {
              tempObj.push(e.details.toUpperCase());
            }
            // console.log('SPLIT DETAIL LAST::', breakDetails[breakDetails.length - 1])
          }

          else {tempObj.push('');}
          // tempObj.push(e.details?.toUpperCase());

          if (e.dr)
          {
            try {
              tempObj.push( e.dr.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') );

            } catch (error) {
              tempObj.push( '0.00' );


            }
          }

          else {
            tempObj.push ('');
          }
          // tempObj.push( e.dr ? e.dr.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') : '');

          // tempObj.push( e.cr ? e.cr.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') : '');


          if (e.cr)
          {
            try {
              tempObj.push( e.cr.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') );

            } catch (error) {
              tempObj.push( '0.00' );


            }
          }

          else {
            tempObj.push ('');
          }

          if (e.balance)
          {
            try {
              tempObj.push( e.balance.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') );

            } catch (error) {
              tempObj.push( '0.00' );


            }
          }

          else {
            tempObj.push ('0.00');
          }


          // tempObj.push( e.balance ? e.balance.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') : '0.00');

          // tempObj.push(e.department);

          // tempObj.push(e.level);
          dataSource2 = tempObj;
          prepare.push(tempObj);
        });
      // const doc = new jsPDF({
      //   orientation: "portrait"

      // });

      const d = new Date();
      const ye = new Intl.DateTimeFormat('en-GB', { year: 'numeric' }).format(d);
      const mo = new Intl.DateTimeFormat('en-GB', { month: '2-digit' }).format(d);
      const da = new Intl.DateTimeFormat('en-GB', { day: '2-digit' }).format(d);
      const bb = d.toLocaleTimeString('en-GB');
      const myDate = (`${da}/${mo}/${ye} `);
      doc.setFontSize(18);

      doc.text("TOPFAITH UNIVERSITY, MKPATAK", 60, 12);
      doc.text("AKWA IBOM STATE", 60, 20);
      doc.setFontSize(10);
      doc.text("Email: info@topfaith.edu.ng", 60, 28);
      doc.text("Phone: +2348053475763 ; +2347066211122", 60, 33);



      // salutation
      doc.setFontSize(10);
      doc.text(`${myDate} `, 12,43)

      doc.text(`Dear ${studentLastName} ${studentFirstName} (${studentNo} -${programme}), `, 12,51)
      doc.setFontSize(12);
      doc.text(`${this.selectedLedgerInfo.session} SESSION FINANCIAL POSITION`, 60,63,)


      doc.addImage(TU_LOGO_IMAGE, 'PNG', 10, 5, 28,28);

      autoTable(doc,
        { head: [['DATE POSTED','DETAILS','DEBIT','CREDIT','BALANCE']],
          body: prepare, startY: 66,
          bodyStyles: {lineWidth:0.2, cellPadding:2} ,
          columnStyles: {0: { cellWidth: 30, halign: 'center'}, 1: { cellWidth: 'auto'}, 2: {halign: 'right', cellWidth:'wrap'}, 3: {halign: 'right', cellWidth:'wrap'}, 4: {halign: 'right', cellWidth:'wrap'}},
          headStyles: { halign: 'center', fillColor:  false, textColor: 20, lineWidth:0.2 , cellPadding:2},
          showFoot: 'lastPage',
          tableLineWidth: 0.5,
          theme: 'grid'

        })


      // @ts-ignore
      const endY = Math.round(doc.autoTable.previous.finalY)

      doc.text(`FEES PAYABLE:`, 60, endY + 6)
      doc.text(`${Math.abs(lastBalance).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`, 172, endY + 5)



      doc.text(`PLEASE MAKE PAYMENTS VIA THIS LINK:`, 10, endY + 17)
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 255);
      doc.text(` https://paystack.com/pay/paytopfaithfees`, 103, endY + 17)

      doc.setTextColor(0, 0, 0);

      doc.setFontSize(9);

      doc.text(`Please note that payments can also be made to any of the following banks:`, 10, endY + 28)



      autoTable(doc,
        {
          body: [['UBA  (1024784509)', 'FCMB   (9324084010)']], startY: endY + 33,
          bodyStyles: {lineWidth:0.2, cellWidth:'wrap', cellPadding:2, fontSize:9} ,

          headStyles: { halign: 'center', fillColor:  false, textColor: 20, lineWidth:0.2 , cellPadding:2},
          showFoot: 'lastPage',
          tableLineWidth: 0.5,
          theme: 'grid'

        })

      // @ts-ignore
      const endY2 = Math.round(doc.autoTable.previous.finalY)

      doc.setFont('helvetica', 'normal')
      // console.log('FONTLIST', doc.getFontList());
      doc.setFontSize(10);
      doc.text(`NOTE: ANY PAYMENT INTO ANY LINK OR BANK OTHER THAN THE LISTED`, 10, endY2 + 13)
      doc.text(`ABOVE SHALL NOT BE ACCEPTED.`, 10, endY2 + 18)
      doc.text(`EVIDENCE OF PAYMENTS MADE INTO THE BANK ACCOUNTS LISTED SHOULD BE SENT TO: bursary@topfaith.edu.ng `, 10, endY2 + 25)
      doc.setFontSize(9);
      doc.text(`Thank you.`, 10, endY2 + 37)

      doc.text(`Topfaith University Bursary`, 10, endY2 + 47)


      doc.addPage()
    }

  }

  setStudentNo(): void {
    this.selectedLedgerInfo.studentNo = this.selectedStudent.studentNo;
  }

  clearFilter(): void {
    this.selectedStudent = {};
    this.selectedLedgerInfo.studentNo = undefined;

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

  add(event: MatChipInputEvent): void {
    const value = (event.value || {});

    // Add our fruit
    if (value) {
      this.bank.push(value as ApprovedBank);
    }

    // Clear the input value
    // event.input.clear();

    this.fruitCtrl.setValue(null);
  }

  constructBF(aDbBalance:any[]): BillInfoData[] {
    const answer: BillInfoData[] = [];
    let balance2Check = 0.0
    if (this.paidMarker){
      balance2Check = this.selectedLedgerInfo.balance ? -1 * this.selectedLedgerInfo.balance : 0.0;
    }

    for (let i=0; i < aDbBalance.length ; i++) {
      if (this.paidMarker){
        const tempBalance= (!aDbBalance[i][0]  ? 0.0 : aDbBalance[i][0])
        if (balance2Check >= (tempBalance)){
          const aBillInfoData: BillInfoData = {
            datePosted: this.selectedLedgerInfo.dateToLookAt as Date,
            studentNo: aDbBalance[i][1],
            lastName: aDbBalance[i][2],
            firstName: aDbBalance[i][3],
            middleName: aDbBalance[i][4],

            details: 'BALANCE BF',
            cr: (!aDbBalance[i][0] || aDbBalance[i][0] > 0 ?
              (aDbBalance[i][0] ? aDbBalance[i][0] : '0.0') : ''),
            dr: (aDbBalance[i][0] && aDbBalance[i][0] < 0 ? (-1 * aDbBalance[i][0]) : ''),
            balance: (!aDbBalance[i][0]  ? '0.0' : aDbBalance[i][0]),
            programme: aDbBalance[i][5],
            level: '',
            status: ''

          } as BillInfoData
          // console.log('BILLINFO::', aBillInfoData);

          answer.push(
            aBillInfoData

          );}}
      else{

        const aBillInfoData: BillInfoData = {
          datePosted: this.selectedLedgerInfo.dateToLookAt as Date,
          studentNo: aDbBalance[i][1],
          lastName: aDbBalance[i][2],
          firstName: aDbBalance[i][3],
          middleName: aDbBalance[i][4],

          details: 'BALANCE BF',
          cr: (!aDbBalance[i][0] || aDbBalance[i][0] > 0 ?
            (aDbBalance[i][0] ? aDbBalance[i][0] : '0.0') : ''),
          dr: (aDbBalance[i][0] && aDbBalance[i][0] < 0 ? (-1 * aDbBalance[i][0]) : ''),
          balance: (!aDbBalance[i][0]  ? '0.0' : aDbBalance[i][0]),
          programme: aDbBalance[i][5],
          level: '',
          status: ''

        } as BillInfoData
        // console.log('BILLINFO::', aBillInfoData);

        answer.push(
          aBillInfoData

        );}
      //   }
      // }
    }
    return answer;
  }

  // getUniqueStudNo()

  // for one document contains all printing
  getBills_Print(): void {
    this.totalNumberProcessedPrint = 0
    this.studentListToEmail = []

    // this.generatePdf();
    // const seperatedList: BillInfoData[][] = [];
    const answer = this.billService.getBalanceBF(this.selectedLedgerInfo as BillInfo);
    const BillBulk = this.billService.getBill(this.selectedLedgerInfo as BillInfo);
    BillBulk.subscribe(data=> {
      if (data && data.length > 0) {

        answer.subscribe((data2: any[]) => {
          if (data2) {
            const bF = this.constructBF(data2);
            // console.log("BALANCE BF:::",bF );
            const doc = new jsPDF({
              orientation: "portrait"

            });
            for (let a of bF) {
              // console.log('An a',a);
              let studentBill = [];
              studentBill = this.billPipe.transform(data, a.studentNo);
              if (studentBill.length == 0 || !studentBill) {
                studentBill = [a];
              }
              else {studentBill.push(a)}
              //studentBill.push(this.billPipe.transform(bF, a.studentNo)[0]);



              this.exportToPdf_Print(studentBill, doc);
              this.totalNumberProcessedPrint += 1;
              console.log("tNPP", this.totalNumberProcessedPrint)
              this.valuePrint = Math.floor(this.totalNumberProcessedPrint/bF.length) * 100
              // if (this.value === 100) {this.clearAdvancedVariables();}
            }
            doc.save('combined.pdf');

            //this.exportToPdf2(seperatedList[0]);

            // console.log("SEPERATED LIST:::",seperatedList );

          }

        });

      }
    });
  }
  //for email or individual printing
  async getBills_saveforemail() {
    this.studentListToEmail = []
    this.totalNumberProcessedEmail = 0;
    const seperatedList: BillInfoData[][] = [];
    const answer = this.billService.getBalanceBF(this.selectedLedgerInfo as BillInfo);
    const BillBulk = this.billService.getBill(this.selectedLedgerInfo as BillInfo);
    BillBulk.subscribe(data=> {
      if (data && data.length > 0) {

        answer.subscribe(async (data2: any[]) => {
          if (data2) {
            // console.log("BF unprocessed",data2 )
            const bF = this.constructBF(data2);
            // console.log("BF", bF);
            for (let a of bF) {
              let studentBill = [];
              studentBill = this.billPipe.transform(data, a.studentNo);
              if (studentBill.length == 0 || !studentBill) {
                studentBill = [a];
              }
              else {
                studentBill.push(a)
                this.studentListToEmail.push(a.studentNo);
              }
              this.exportToPdf2(studentBill);
              await this.waitforme(1000); // loop will be halted here until promise is resolved
              this.totalNumberProcessedEmail += 1;
              this.valueEmail = Math.floor(this.totalNumberProcessedEmail/bF.length) * 100
              // if (this.value === 100) {this.clearAdvancedVariables();}
            }


            //this.exportToPdf2(seperatedList[0]);

            // console.log("SEPERATED LIST:::",seperatedList );

          }

        });

      }
      else {
        answer.subscribe(async (data2: any[]) => {
          if (data2) {
            // console.log("BF unprocessed",data2 )
            const bF = this.constructBF(data2);
            // console.log("BF", bF);
            for (let a of bF) {
              let studentBill = [];
              studentBill = this.billPipe.transform(data, a.studentNo);
              if (studentBill.length == 0 || !studentBill) {
                studentBill = [a];
              }
              else {studentBill.push(a)}
              this.exportToPdf2(studentBill);
              await this.waitforme(1000); // loop will be halted here until promise is resolved
              this.totalNumberProcessedEmail += 1;
              this.valueEmail = Math.floor(this.totalNumberProcessedEmail/bF.length) * 100
              // if (this.value === 100) {this.clearAdvancedVariables();}
            }


            //this.exportToPdf2(seperatedList[0]);

            // console.log("SEPERATED LIST:::",seperatedList );

          }

        });

      }
    });

    //this.billService.getBilledPeopleEmail(this.selectedLedgerInfo as BillInfo);
    //this.sendBillService.tryChech();
  }

  waitforme(ms: number)  {
    return new Promise( resolve => { setTimeout(resolve, ms); });
  }

  canGenBill(): boolean {
    let answer = false;
    if (this.selectedLedgerInfo.session &&
      this.selectedLedgerInfo.session !== ''
      && this.selectedLedgerInfo.dateToLookAt)
    {answer = true;}
    // console.log('canGenBill::', answer);
    return answer;
  }

  toggleAdvanced(): void {
    this.rearrangePostings =  !this.rearrangePostings;
  }
  sendBills_Email(): void {
    this.billService.getBilledPeopleEmail(this.selectedLedgerInfo as BillInfo)
      .subscribe(
        (data) => {
          if (data) {
            console.log('billedpeople email', data);
            const dataToSend: any[] = [];
            data.forEach((answer) => {

              // console.log('this is answer email List', answer.emailList);
              const tempEmailList = answer.emailList;
              if (answer.sponsorList[0] in tempEmailList)
              {tempEmailList.push(answer.sponsorList[0]);

              }
              if (this.studentListToEmail.includes(answer.studentNo)) {
                dataToSend.push({

                  studentNo: answer.studentNo, lastName: answer.lastName,
                  firstName: answer.firstName,
                  programme: answer.programme, session: answer.session,
                  emailList: tempEmailList
                })
              }

            });
            this.progressChecks.next(1);
            this.sendBillService.sendEmailData(dataToSend);
          }
        }
      );
    // this.sendBillService.getEmailStatus();
  }

  // Reorder postings so that debit comes before credits
  PostingsReOrderForBill(aStudentList?: Student[] ): void { // PostingsReOrderForBill

    const answer = this.studentService.getStudentsList();
    console.log('student list', answer);
    const bigAnswer: {
      student
        : string; studentTransact: StudentLedgerEntryMax2[];
    }[] = [];
    const BillBulk = this.paymentsService.getPostingsInfo_WithIndex({} as LedgerInfo);
    BillBulk.subscribe(data=> {
      if (data && data.length > 0) {
        // console.log('THIS IS DATA::', data);
        if (aStudentList) {
          aStudentList.forEach( a => {
            let studentTransact = [];
            studentTransact = this.ledgerMaxPipe.transform(data, a.studentNo);
            // studentBill.push(this.billPipe.transform(bF, a.studentNo)[0]); // addition of the bf to the billbulk

            // console.log('Student transact', studentTransact);
            const responses = this.reArrangeTransactions(studentTransact);
            // console.log('Student rearranged', responses[0].studentNo, responses);

            bigAnswer.push({student: a.studentNo, studentTransact: responses})


          });
        }
        else {
          answer.subscribe((data2: Student[])=> {
            if (data2 && data2.length > 0) {
              // console.log('THIS IS DATA2::', data2);
              for (let a of data2) {
                let studentTransact = [];
                studentTransact = this.ledgerMaxPipe.transform(data, a.studentNo);
                // studentBill.push(this.billPipe.transform(bF, a.studentNo)[0]); // addition of the bf to the billbulk

                // console.log('Student transact', studentTransact);
                const responses = this.reArrangeTransactions(studentTransact);
                // console.log('Student rearranged', responses[0].studentNo, responses);

                bigAnswer.push({student: a.studentNo, studentTransact: responses})


              }

            }
          });
        }
        if (bigAnswer) {
          bigAnswer.forEach((answer) =>{
            answer.studentTransact.forEach((ans) => {

              this.paymentsService.reOrderPostings(ans.id, ans.datePosted, ans.balance, ans.details);

            })
          })
        }

        //this.exportToPdf2(seperatedList[0]);

        // console.log("SEPERATED LIST:::",seperatedList );

      }

    });



    // this.billService.getBilledPeopleEmail(this.selectedLedgerInfo as BillInfo);
    // this.sendBillService.tryChech();
  }

  remove(fruit: ApprovedBank): void {
    const index = this.bankList.indexOf(fruit);

    if (index >= 0) {
      this.bankList.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.bankList.push(event.option.viewValue as unknown as ApprovedBank);
    this.bankInput.nativeElement.value = '';
    this.fruitCtrl.setValue(null);
  }

  private _filter(value: string): ApprovedBank[] {
    // console.log('THIS IS THE VALUE IN FILTER:::', value);
    const filterValue = value.toLowerCase();

    return this.bankList.filter(fruit => fruit.longName.toLowerCase().includes(filterValue));
  }



  filterOutstanding(cutOff: number, sourceData: OutstandingInfoData[]): OutstandingInfoData[] {
    const tempObj: any[] = [];
    sourceData.forEach(
      e => {
        // var tempObj = [];
        if ((e.balance < cutOff) ) {
          console.log('THIS IS LESS THAN CUTOFF:::', cutOff, e.balance);
          tempObj.push(e);
        }

      });
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
    this.departmentMarker = false;
    this.genderMarker = false;
    this.studentMarker = false;
    this.transacTypeMarker = false;
  }

  checkStat(aString: string): void {



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

    if (aString === 'programme' && !this.departmentMarker) {
      this.selectedLedgerInfo.programme = undefined;

    }
    if (aString === 'level' && !this.levelMarker) {this.selectedLedgerInfo.level = undefined}


    if (aString === 'paid' && !this.paidMarker) {
      this.selectedLedgerInfo.balance = undefined;
    }

    if (aString === 'studentNo' && !this.studentMarker) {
      this.clearFilter();
    }

  }






}

