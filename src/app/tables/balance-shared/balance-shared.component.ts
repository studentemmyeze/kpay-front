


import { Component, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { OutstandingInfoData, StudentType } from 'src/app/interfaces/student';
import { DataService } from 'src/app/services/data.service';
import { PaymentsService } from 'src/app/services/payments.service';
import { StudentService } from 'src/app/services/student.service';
import { UtilityService } from 'src/app/services/utility.service';
import { TU_LOGO_IMAGE } from 'src/app/utilities/sharedFile';
import jspdf from 'jspdf'
import jsPDF from 'jspdf'

import autoTable from 'jspdf-autotable'// import JSPDF from 'jspdf';


@Component({
  selector: 'app-balance-shared',
  templateUrl: './balance-shared.component.html',
  styleUrls: ['./balance-shared.component.css']
})
export class BalanceSharedComponent implements OnInit {
  @Input() DCol: any[];
  allSelected = false;
  displayedColumns: string[] = [];
  original: string[] = [];
  logoImage = TU_LOGO_IMAGE;
  columnsToDisplay: string[];
  selectedColumn = [];
  studentTypeList: StudentType[] = [];
  drCr: number = 0.0;
  filterValue = '';

  dataSource!: MatTableDataSource<OutstandingInfoData>;

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
  ) { }

  ngOnInit(): void {
    this.loadData();
    this.displayedColumns = this.DCol[0];
    this.original = this.displayedColumns;
    this.columnsToDisplay = this.displayedColumns.slice(0, 10);

  }

  exportToPdf2() {
    let prepare: any[] = [];
    this.dataSource.data.forEach(
      e => {
      var tempObj = [];
      tempObj.push(e.studentNo);
      tempObj.push(e.lastName);

      tempObj.push( e.firstName);

      tempObj.push( e.middleName);

      tempObj.push( e.balance ? e.balance.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') : '0.00');

      tempObj.push(e.programme);

      tempObj.push(e.level);

      prepare.push(tempObj);
    });
    const doc = new jsPDF({
      orientation: "landscape"

    });

    const d = new Date();
    const ye = new Intl.DateTimeFormat('en-GB', { year: 'numeric' }).format(d);
    const mo = new Intl.DateTimeFormat('en-GB', { month: '2-digit' }).format(d);
    const da = new Intl.DateTimeFormat('en-GB', { day: '2-digit' }).format(d);
    const bb = d.toLocaleTimeString('en-GB');
    const myDate = (`Date: ${da}/${mo}/${ye} ${bb} `);
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

    // head: [['STUDENT NO','','LASTNAME','','FIRSTNAME','','MIDDLENAME','','BALANCE',
    // '','DEPARTMENT','','LEVEL']],

    autoTable(doc,
      { head: [['STUDENT NO','LASTNAME','FIRSTNAME','MIDDLENAME','BALANCE',
      'PROGRAMME','LEVEL']],
    body: prepare, startY: 48,
    bodyStyles: {lineWidth:0.2, cellWidth:'wrap', cellPadding:2} ,
    columnStyles: {4: {halign: 'right'}},
    headStyles: { halign: 'center', fillColor:  false, textColor: 20, lineWidth:0.2 , cellPadding:2},

tableLineWidth: 0.5,
theme: 'grid'
  })

    doc.save('Outstanding_List' + '.pdf');
  }


  ngOnDestroy() {
    if (this.subscription) {

      this.subscription.unsubscribe();

    }
    else {       this.paymentService.PostingsExtra.next([]);
    }

  }



  Balance(aString: string): string {
    let answer = '';

    if (this.columnsToDisplay[0] === aString){
      answer = 'BALANCE';
    }
    return answer;
  }

  exportTable(){
    TableUtil.exportToExcel("ExampleTable");
  }

  getBalance(): number {
    // if (this.childMessage)
    //   return this.paymentService.Balance.getValue()[0];
    // else
      return 0.0;
  }



getCRDR(aData: OutstandingInfoData[]): number {
          let  outSum =0.0;
          // let drSum = 0.0;
          for(let i = 0 ; i < aData.length; i++){
            outSum += (aData[i].balance ? aData[i].balance : 0);
            // drSum += (aData[i].dr ? aData[i].dr : 0);

          }
        return outSum;
}

filterOutstanding(cutOff: number): OutstandingInfoData[] {
  const tempObj: any[] = [];
  this.dataSource.data.forEach(
    e => {
    // var tempObj = [];
    if ((e.balance < cutOff) ) {
      tempObj.push(e);
    }

  });
  return tempObj;
}

  loadData() {
    this.DCol[1].subscribe((data: OutstandingInfoData[]) => {
        // this.dataSource.data = data;

        this.dataSource= new MatTableDataSource(data);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.drCr = this.getCRDR(data);

    }
    );


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

  this.dataSource.filter = this.filterValue.trim().toLowerCase();
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

function isPrime(num: number) {
  for (let i = 2; num > i; i++) {
    if (num % i == 0) {
      return false;
    }
  }
  return num > 1;
}


