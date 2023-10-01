import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Student } from 'src/app/interfaces/student';
import { DataService } from 'src/app/services/data.service';
import { PaystackService } from 'src/app/services/paystack.service';
import { StudentService } from 'src/app/services/student.service';

@Component({
  selector: 'app-make-payments',
  templateUrl: './make-payments.component.html',
  styleUrls: ['./make-payments.component.css']
})
export class MakePaymentsComponent implements OnInit {
  // aStudentNo : BehaviorSubject<string> =  new BehaviorSubject<string>('');
  childMessage = '';
  progressMessage = 0;
  progressMessage2 = 0;

  subscription: Subscription;
  progressSubscription: Subscription;
  progressSubscription2: Subscription;

  selectedStudent: Partial <Student> = {};
  stateCtrl = new FormControl();
  filteredStates: Observable<Student[]>;
  lastCheckedDate: Date;
  lastCheckedCount =0;

  studentList: Student[] =[];

  constructor(
    private studentService: StudentService,
    private payStackService: PaystackService,
    private dataService: DataService) {
    // this.childMessage = '';
    this.filteredStates = this.stateCtrl.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.studentNo),
        map(state => state ? this._filterStates(state) : this.studentList.slice())
      );
  }

  ngOnInit(): void {
    this.payStackService.getLastChecked();
    this.dataService.changeMessage('');
    this.subscription = this.dataService.currentMessage.subscribe(message => this.childMessage = message);

    this.payStackService.PayStackLastCheck.subscribe((data) => {
      // console.log("\n::::::DATE UPDATED:::::::\n", data);
      this.lastCheckedDate = new Date(data);
    });

    this.payStackService.NewLedgerEntries.subscribe((data) => {
      // console.log("\n::::::LEDGER UPDATED:::::::\n", data);
      this.lastCheckedCount = data.length;
    });

    this.progressSubscription = this.dataService.currentProgressMessage.subscribe((message) =>
    {this.progressMessage = message;
    console.log('progressmessage changed to::', this.progressMessage)});

    this.progressSubscription2 = this.dataService.currentProgressMessage2.subscribe((message) =>
    {this.progressMessage2 = message;
    console.log('progressmessage2 changed to::', this.progressMessage2)});
    this.studentService.getStudentsList().subscribe(
      data => {
        this.studentList = data;
        // console.log("APPLICATION:::", data);
      }
    );
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.progressSubscription.unsubscribe();
    this.progressSubscription2.unsubscribe();
    // this.payStackService.PayStackLastCheck.unsubscribe();
  }
  setStudentNo(): void {
    // console.log("SNO IN SET STUDENT NO", aStudentNo);
    this.dataService.changeMessage(this.selectedStudent.studentNo || '');
    // this.childMessage = this.selectedStudent.studentNo ; // || '';
    // return this.childMessage;
    // this.aStudentNo.next((this.selectedStudent as Student).studentNo);
    // return ((this.selectedStudent as Student).studentNo);
  }

  prepareForPayStack(): void {
    this.selectedStudent = {};
    this.dataService.changeMessage('');

  }
  doAutoPaystackPosting():void{
    if (this.childMessage !== '') {
      this.prepareForPayStack();
    }



    // else {}
    // else{ console.log('A AUTO SERVICE IS GOING!')}
    setTimeout(()=> {
      this.dataService.changeMessage('-1');

    }, 200);

  }
  doAutoReconPosting():void{
    // check if PayStack Posting is going on
    if (this.childMessage === '') {
      this.dataService.changeMessage('-2');

    }
    else{ console.log('A AUTO SERVICE IS GOING!')}

  }


  clearFilter(): void {
    this.selectedStudent = {};
    this.dataService.changeMessage('');

    // this.setStudentNo();
  }
  displayFn(applicant: Student): string {
    // console.log("THE INDEX::", applicant);
    // this.selectedApplication = applicant;
    // console.log("THE APP::", this.selectedStudent);

    return applicant && applicant.studentNo ? applicant.studentNo : '';
  }

  private _filterStates(value: string): Student[] {
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


}
