import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, Subscription } from 'rxjs';
import { StudentLedgerEntry, StudentType } from 'src/app/interfaces/student';
import { DataService } from 'src/app/services/data.service';
import { PaymentsService } from 'src/app/services/payments.service';
import { StudentService } from 'src/app/services/student.service';
import { UtilityService } from 'src/app/services/utility.service';
import { TU_LOGO_IMAGE } from 'src/app/utilities/sharedFile';
import jspdf from 'jspdf'
import jsPDF from 'jspdf'

import html2canvas from 'html2canvas'
import autoTable from 'jspdf-autotable'// import JSPDF from 'jspdf';
import { Neo4jdatePipe } from 'src/app/pipes/neo4jdate.pipe';


@Component({
  selector: 'app-studentledger',
  templateUrl: './studentledger.component.html',
  styleUrls: ['./studentledger.component.css'],
  providers: [Neo4jdatePipe]
})
export class StudentledgerComponent implements OnInit {
  // @Input()
  // studentNo!: BehaviorSubject<string>;
  // @Input() childMessage: string;
  // @Input() studentNo: BehaviorSubject<string> = new BehaviorSubject<string>('');
  displayedColumns = ['datePosted', 'session', 'semester', 'product', 'qty',  'dr', 'cr' ,'balance', 'details', 'paymentMode', 'bank', 'tellerDate', 'tellerNo', 'receiptNo', 'depositor', 'staffIn']; // , 'dOB',
  original = this.displayedColumns;

  columnsToDisplay: string[] = this.displayedColumns.slice(0, 9);
  selectedColumn = [];
  studentTypeList: StudentType[] = [];
  allSelected = false;

  // toppings = new FormControl();
  dataSource!: MatTableDataSource<StudentLedgerEntry>;

  childMessage = '';
  subscription: Subscription;
  logoImage = TU_LOGO_IMAGE;
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;

  constructor(
    public dialog: MatDialog,

    private studentService: StudentService,
    private paymentService: PaymentsService,
    private utilityService: UtilityService,
    private snackBar: MatSnackBar,
    private dataService: DataService
  )
  {

    // this.childMessage = '';
    this.loadData();
    // this.studentNo.subscribe((data) => {
    //   console.log("this is the student no at ledger data", data);

    //   if (data !== undefined)
    //   {
    //       this.aStudentNo = data;
    //       this.loadData();

    //   }
    // }    );


  }

  ngOnInit() {
    this.subscription = this.dataService.currentMessage.subscribe(message =>

      {
        this.childMessage = message;

            this.loadData();
            // this.dataSource.paginator = this.paginator;
            // this.dataSource.sort = this.sort;

      });

    // this.loadData();
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();

  }

  exportToPdf(): void {
    var element = document.getElementById('ExampleTable');
    html2canvas(element!).then((canvas)=>{
      console.log(canvas);
      let imgData = canvas.toDataURL('image/png');

      let doc = new jspdf("p", "mm", "a4");
      let imgHeight = canvas.height *208 / canvas.width;
      doc.addImage(imgData,0,0,208,imgHeight);
      doc.save('image.pdf');

    });
  }

  exportToPdf2(): void {
    let timeSpan = new Date().toISOString();
    const fileName = `${this.childMessage}_TUledger_${timeSpan}`;
    this.utilityService
    .exportToPdf(this.dataSource.filteredData,fileName,this.columnsToDisplay,'',this.childMessage + ' LEDGER')
  }

  exportToPdf2_old() {
    let prepare: any[] = [];
    this.dataSource.data.forEach(
      e => {
      var tempObj = [];
      tempObj.push(e.datePosted);
      tempObj.push('');
      tempObj.push(e.product);
      tempObj.push('');

      tempObj.push( e.details);
      tempObj.push('');



      tempObj.push( e.cr);
      tempObj.push('');

      tempObj.push(e.dr);
      tempObj.push('');

      tempObj.push( e.balance);
      tempObj.push('');

      // tempObj.push(e.balance);
      tempObj.push(e.paymentMode);

      prepare.push(tempObj);
    });
    const doc = new jsPDF({
      orientation: "landscape"

    });


    // doc.setTableHeaderRow  ['studentNo','','lastName','','firstName','','product','','cr','','dr','','balance','','paymentMode','','details'];
    // doc.autoTable({
    //     head: [['studentNo','','lastName','','firstName','','product','','cr','','dr','','balance','','paymentMode','','details']],
    //     body: prepare
    // });
    const d = new Date();
    const ye = new Intl.DateTimeFormat('en-GB', { year: 'numeric' }).format(d);
    const mo = new Intl.DateTimeFormat('en-GB', { month: '2-digit' }).format(d);
    const da = new Intl.DateTimeFormat('en-GB', { day: '2-digit' }).format(d);
    const bb = d.toLocaleTimeString('en-GB');
    const myDate = (`Date: ${da}/${mo}/${ye} ${bb} `);
    // const credits = (`Credits ${} ${}`);
    doc.text("TOPFAITH UNIVERSITY, MKPATAK", 50, 15);
    doc.text("AKWAIBOM STATE", 50, 25);
    doc.rect(200, 5, 90, 40);
    doc.text("Report Parameters", 202, 10);
    doc.setFontSize(10);
    doc.text(['Source: Bursary, Topfaith University', myDate], 202, 14);
    // doc.text("Time: ", 202, 20);

    // doc.text('TextField:', 10, 145);
    // var textField = new Textfield();
    // textField.value = [202, 30, 30, 10];
    // textField.multiline = true;
    // textField.value = "The quick brown fox ate the lazy mouse The quick brown fox ate the lazy mouse The quick brown fox ate the lazy mouse"; //
    // textField.fieldName = "TestTextBox";

    // //SET FONT SIZE
    // textField.maxFontSize = 9;

    // doc.addField(textField);

    doc.addImage(this.logoImage, 'PNG', 10, 5, 30,30);
    // doc.addImage(imageData, format, x, y, width, height, alias, compression, rotation)

    autoTable(doc,
      { head: [['DATE POSTED','','PRODUCT','','DETAILS','','CR','','DR','', 'BALANCE','','PAYMENTMODE']],
    body: prepare, startY: 48})

    doc.save('TU_StudenLedgerInfo' + '.pdf');
  }

  exportTable(){
    TableUtil.exportToExcel("ExampleTable");
  }



  Balance(aString: string): string {
    let answer = '';

    if (this.columnsToDisplay[0] === aString){
      answer = 'BALANCE';
    }
    return answer;
  }

  getBalance(): number|string {
    if (this.childMessage)
      return this.paymentService.Balance.getValue()[0];
    else
      return "0.0";
  }



  loadData() {
    if ( this.childMessage !== undefined && this.childMessage === '') {
      console.log("MSESSAGE IS :::", this.childMessage);
      const aDummyLedger: StudentLedgerEntry[] = [];
      this.dataSource= new MatTableDataSource(aDummyLedger);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.dataSource.connect();
    }
    else if (this.childMessage !== undefined && this.childMessage !== ''
    && this.childMessage !== '-1'){
      this.paymentService.getPostings(this.childMessage);
      this.paymentService.Postings.subscribe((data) => {
        if (data !== undefined && data !== null) {
          for (let a of data) {
            if (a.paymentMode){
              a.cr = a.cr ? a.cr : "0.00";
            }
            else {
              a.dr = a.dr ? a.dr : "0.00";

            }
            a.balance = a.balance ? a.balance : "0.00";
          }
          // console.log("this is the ledger data", data);
          this.dataSource= new MatTableDataSource(data);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
      }

      });
  }



  }

selectAll(status: boolean): void {
  if (status) {
    this.columnsToDisplay = this.original;

  }
  else {this.columnsToDisplay = []; }

}

checkDisplayForCrDr(aPaymentMode: string, aValue:any, aValue2:any): string {
  let answer = '';
  console.log("AT CHECK DISPLAY::", aPaymentMode, aValue, aValue2);
  if(aPaymentMode){
    if (aValue)
      answer = aValue + '';
    else {
      answer = '0.00';
    }
  }
  return answer;
}
print(): void {
  console.log("SELECTED COLUMN::", this.columnsToDisplay);
}











  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}

import * as XLSX from "xlsx";

export class TableUtil {
  static exportToExcel(tableId: string, name?: string) {
    let timeSpan = new Date().toISOString();
    let prefix = name || "ExportResult";
    let fileName = `${prefix}-${timeSpan}`;
    let targetTableElm = document.getElementById(tableId);
    let wb = XLSX.utils.table_to_book(targetTableElm, <XLSX.Table2SheetOpts>{ sheet: prefix });
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }
}
