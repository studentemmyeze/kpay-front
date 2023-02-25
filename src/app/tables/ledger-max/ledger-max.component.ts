import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Student, StudentLedgerEntry, StudentType } from 'src/app/interfaces/student';
import { DataService } from 'src/app/services/data.service';
import { PaymentsService } from 'src/app/services/payments.service';
import { StudentService } from 'src/app/services/student.service';
import { UtilityService } from 'src/app/services/utility.service';

@Component({
  selector: 'app-ledger-max',
  templateUrl: './ledger-max.component.html',
  styleUrls: ['./ledger-max.component.css']
})
export class LedgerMaxComponent implements OnInit {
  // @Input()
  // studentNo!: BehaviorSubject<string>;
  // @Input() childMessage: string;
  // @Input() studentNo: BehaviorSubject<string> = new BehaviorSubject<string>('');
  displayedColumns = ['datePosted', 'session', 'semester', 'product', 'qty',  'dr', 'cr' ,'balance',
  'details', 'studentNo', 'lastName', 'firstName', 'gender', 'level', 'department']; // , 'dOB',
  original = this.displayedColumns;

  columnsToDisplay: string[] = this.displayedColumns.slice(0, 10);
  selectedColumn = [];
  studentTypeList: StudentType[] = [];

  // toppings = new FormControl();
  dataSource!: MatTableDataSource<MaxLedger>;

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

    this.dataSource.filterPredicate = this.getFilterPredicate();
    // this.subscription = this.dataService.currentMessage.subscribe(message =>

    //   {
    //     this.childMessage = message;

            this.loadData();
            // this.dataSource.paginator = this.paginator;
            // this.dataSource.sort = this.sort;

      // });

    // this.loadData();
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();

  }

  getFilterPredicate() {
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
      this.paymentService.PostingsExtra.subscribe((data) => {
        if (data !== undefined && data !== null) {
          console.log("this is the ledger data", data);
          this.dataSource= new MatTableDataSource(data);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
      }

      else{
        const aDummyLedger: MaxLedger[] = [];
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











  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}

export interface MaxLedger {
  ledger: StudentLedgerEntry;
  student: Student
}
