import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Event } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Student, StudentLedgerEntry, StudentLedgerEntryMax, StudentType } from 'src/app/interfaces/student';
import { DataService } from 'src/app/services/data.service';
import { PaymentsService } from 'src/app/services/payments.service';
import { StudentService } from 'src/app/services/student.service';
import { RawUtil, UtilityService } from 'src/app/services/utility.service';
import { TU_LOGO_IMAGE } from 'src/app/utilities/sharedFile';
import jspdf from 'jspdf'
import jsPDF from 'jspdf'

import html2canvas from 'html2canvas'
import autoTable from 'jspdf-autotable'// import JSPDF from 'jspdf';

@Component({
  selector: 'app-ledger-shared',
  templateUrl: './ledger-shared.component.html',
  styleUrls: ['./ledger-shared.component.css']
})
export class LedgerSharedComponent implements OnInit {
  @Input() DCol: any[];
  allSelected = false;
  displayedColumns: string[] = [];
  original: string[] = [];
  logoImage = TU_LOGO_IMAGE;
  columnsToDisplay: string[];
  selectedColumn = [];
  studentTypeList: StudentType[] = [];
  drCr: number[] = [];

  dataSource!: MatTableDataSource<StudentLedgerEntryMax>;
  filterValue = '';
  childMessage = '';
  subscription: Subscription;

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


    this.loadData();


  }

  ngOnInit() {

    // this.dataSource.filterPredicate = this.getFilterPredicate();
    // this.subscription = this.dataService.currentMessage.subscribe(message =>

    //   {
    //     this.childMessage = message;

            this.loadData();
            this.displayedColumns = this.DCol;
    this.original = this.displayedColumns;
    this.columnsToDisplay = this.displayedColumns.slice(0, 10);
            // this.dataSource.paginator = this.paginator;
            // this.dataSource.sort = this.sort;

      // });

    // this.loadData();
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
  }

//   private getImage(imagePath: any): BehaviorSubject<any> {
//     var defer = this.q.defer<any>();
//     var img = new Image();
//     img.src = imagePath;
//     img.addEventListener('load',()=>{
//        defer.resolve(img);
//     });


//     return defer.promise;
// }

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

  exportToPdf2_old() {
    let prepare: any[] = [];
    this.dataSource.data.forEach(
      e => {
      var tempObj = [];
      tempObj.push(e.studentNo);
      tempObj.push('');
      tempObj.push(e.lastName);
      tempObj.push('');

      tempObj.push( e.firstName);
      tempObj.push('');

      tempObj.push( e.product);
      tempObj.push('');

      tempObj.push( e.cr);
      tempObj.push('');

      tempObj.push(e.dr);
      tempObj.push('');

      // tempObj.push(e.balance);
      tempObj.push(e.paymentMode);
      tempObj.push('');


      tempObj.push(e.details);
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
      { head: [['studentNo','','lastName','','firstName','','product','','cr','','dr','','payMode','','details']],
    body: prepare, startY: 48})

    doc.save('TU_PaymentsInfo' + '.pdf');
  }

  exportToPdf2(): void {
    let timeSpan = new Date().toISOString();
    const fileName = `TU_Find_Payments_${timeSpan}`;
    this.utilityService
    .exportToPdf(this.dataSource.filteredData,fileName,this.columnsToDisplay,'','PAYMENTS INFORMATION')
  }


  ngOnDestroy() {
    if (this.subscription) {

      this.subscription.unsubscribe();

    }
    else {       this.paymentService.PostingsExtra.next([]);
    }

  }



  Balance(aString: string): string {
    let answer = 'BALANCE';

    if (this.columnsToDisplay[0] === aString){}
    return answer;
  }

  exportTable(){
    let timeSpan = new Date().toISOString();
    const fileName = `TU_Find_Payments_${timeSpan}`;
    RawUtil.exportToExcel(this.dataSource.filteredData,fileName, this.columnsToDisplay)
    // TableUtil.exportToExcel("ExampleTable");
  }

  getFilterPredicate(): (row: MaxLedger, filters: string) => boolean {
    return (row: MaxLedger, filters: string) => {
      // split string per '$' to array
      const departureDate = filters;
      // const filterArray = filters.split('$');
      // const departureDate = filterArray[0]; // order number
      // const departureStation = filterArray[1]; // amount

      const matchFilter = [];

      // Fetch data from row
      // console.log('@getFilterPredicate-row', row.orderItem.barOrderID);
      // const columnDatePosted = row.ledger.datePosted;
      const columnProduct = row.ledger.product;
      const columnStudent = row.student.studentNo;


      // const columnDepartureStation = row.orderItem.costOfOrder - row.orderItem.amountPaid;
      // const columnArrivalStation = row.route.arrivalStation.name;

      // verify fetching data by our searching values
      const customFilterDD = columnProduct.toLowerCase().includes(departureDate) ||
                              columnStudent.toLowerCase().includes(departureDate);

      console.log('CUSTOM FILTER DD', customFilterDD);
      // const customFilterDS = columnDepartureStation.toLowerCase().includes(departureDate);

      // push boolean values into array
      // matchFilter.push(customFilterDS);

      matchFilter.push(customFilterDD);

      // return true if all values in array is true
      // else return false
      return matchFilter.every(Boolean);
    };
  }

  getBalance(): number {
    // if (this.childMessage)
    //   return this.paymentService.Balance.getValue()[0];
    // else
      return 0.0;
  }

getCRDR(aData: StudentLedgerEntryMax[]): number[] {
          let  crSum =0.0;
          let drSum = 0.0;
          for(let i = 0 ; i < aData.length; i++){
            crSum += (aData[i].cr ? aData[i].cr : 0);
            drSum += (aData[i].dr ? aData[i].dr : 0);

          }
        return [drSum, crSum];
}

  loadData() {
    // if ( this.childMessage !== undefined && this.childMessage === '') {
    //   console.log("MSESSAGE IS :::", this.childMessage);
    //   const aDummyLedger: MaxLedger[] = [];
    //   this.dataSource= new MatTableDataSource(aDummyLedger);
    //   this.dataSource.sort = this.sort;
    //   this.dataSource.paginator = this.paginator;
    //   this.dataSource.connect();
    // }
    // else if (this.childMessage !== undefined && this.childMessage !== ''){
      // this.paymentService.PostingsExtra();
      this.paymentService.PostingsExtra.subscribe((data: StudentLedgerEntryMax[]) => {
        if (data !== undefined && data !== null) {
          this.drCr = this.getCRDR(data);


          this.dataSource= new MatTableDataSource(data);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
      }

      else{
        const aDummyLedger: StudentLedgerEntryMax[] = [];
          this.drCr = [];
          this.dataSource= new MatTableDataSource(aDummyLedger);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
      }

      });
  // }



  }

selectAll(status: boolean): void {
  if (status) {
    this.columnsToDisplay = this.original;

  }
  else {this.columnsToDisplay = []; }

}
print(): void {
  console.log("SELECTED COLUMN::", this.columnsToDisplay);
}











  applyFilter() {


    // const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = this.filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}

export interface MaxLedger {
  ledger: StudentLedgerEntry;
  student: Student
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
