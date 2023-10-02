import { Component, Input, OnInit } from '@angular/core';
import { Applications, Concession, NextKin, PaystackAndPayments, Student, StudentLedgerEntry, StudentProduct, Study } from 'src/app/interfaces/student';
import { UtilityService } from 'src/app/services/utility.service';
import { DateAdapter, MatDateFormats, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from 'src/app/utilities/format-datepicker';
import { FormControl } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { AsyncSubject, BehaviorSubject, Observable, Subscription } from 'rxjs';
import { delay, map, skipWhile, startWith } from 'rxjs/operators';
import { PaymentsService } from 'src/app/services/payments.service';
import { BankService } from 'src/app/services/bank.service';
import { DataService } from 'src/app/services/data.service';
import { PaystackService } from 'src/app/services/paystack.service';
import { KpClientService } from 'src/app/services/kp-client.service';
import { UserService } from 'src/app/services/user.service';
import { ApplicationService } from 'src/app/services/application.service';
import { StudentService } from 'src/app/services/student.service';
import { ApplicationPipe } from 'src/app/pipes/application.pipe';
import { ReconcilationService } from 'src/app/services/reconcilation.service';
import { ProductService } from 'src/app/services/product.service';
import { EmailService } from 'src/app/services/email.service';
import { R } from '@angular/cdk/keycodes';


@Component({
  selector: 'app-studentposting',
  templateUrl: './studentposting.component.html',
  styleUrls: ['./studentposting.component.css'],
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS},
    {provide: ApplicationPipe}
]
})
export class StudentpostingComponent implements OnInit {
  childMessage = '';
  childMessage2 = '';
  totalNumberFound = 0;
  progressMessage = 0;
  progressMessage2 = 0;

  balance = 0;
  subscription: Subscription;
  balanceSubsciption: Subscription;
  progressSubsciption: Subscription;
  progressSubsciption2: Subscription;

  aStudentNo = '';
  selectedLedgerEntry: Partial <StudentLedgerEntry> = {};
  newLedgerEntryList: StudentLedgerEntry[] = [];
  selectedConcession: Partial <Concession> = {};
  productList: StudentProduct[] = [];
  paymentModeList = ['Cash', 'Transfer' , 'Bank', 'PayStack', 'Concessions', 'Error Correct'];
  semesterList = [1, 2];
  sessionList: string[] = [];
  concessionList: Concession[] = [];
  applicationList: any[] = [];
  newStudentsForEmailList: Student[] = [];
  bankList: any[] = [];

  amount = 0.0;
  dMarker = false;
  bankMarker = true;
  detailsMarker = false;

  concessionMarker = true;

  receiptNoMarker = true;

  tellerDepositMarker = true;
  isTransfer = true;
  tellerDateMarker = true;
  tellerNoMarker = true;
  debitMarker = false;
  paymentModeMarker = true;
  resumptionDate: Date;
  transactionType = '1';

  // transactionType = "2";
  selectedProduct: Partial <StudentProduct> = {};
  stateCtrl = new FormControl();
  filteredStates: Observable<StudentProduct[]>;
  tempTotal = 0.0;
  currentSession = '';

  constructor(
    private utilityService: UtilityService,
    private paymentsService: PaymentsService,
    private payStackService: PaystackService,
    private bankService: BankService,
    private dataService: DataService,
    private korotePayService: KpClientService,
    private userService: UserService,
    private applicationService: ApplicationService,
    private studentService: StudentService,
    private reconcilationService: ReconcilationService,
    private applicationPipe: ApplicationPipe,
    private productService: ProductService,
    private emailService: EmailService

  ) {
    this.childMessage = '';
    this.progressMessage = 0;
    this.progressMessage2 = 0;
    this.transactionType = '1';
    this.selectedLedgerEntry.product = (this.selectedLedgerEntry.product ?
      this.selectedLedgerEntry.product : '' );
    this.selectedLedgerEntry.qty = 1;
    this.filteredStates = this.stateCtrl.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.product),
        map(state => state ? this._filterStates(state) : this.productList.slice())
      );

  }

  ngOnInit(): void {
    // this.paymentsService.getBalanceBulk();

    this.subscription = this.dataService.currentMessage.subscribe(message =>
      {
        this.childMessage = message;
        if (message !== '' && message !== '-1' && message !== '-2'){
        this.paymentsService.getBalance(this.childMessage); }
        if ( message === '-1' && this.progressMessage2 === 0){    this.doAutoPaystackPosting();
        }
        if ( message === '-2' && this.progressMessage === 0){    this.doAutoReconPosting();
        }

      });

    this.balanceSubsciption = this.paymentsService.Balance.subscribe(message => this.balance = message[0]);
    this.progressSubsciption = this.dataService.currentProgressMessage
    .subscribe(message => this.progressMessage = message);

    this.progressSubsciption2 = this.dataService.currentProgressMessage2
    .subscribe((message) =>
    {
      this.progressMessage2 = message;

    });

    this.applicationService.applicationList.subscribe((data) => {
      if (data) { this.applicationList = data; }
    });

    this.utilityService.generateSessionList().subscribe(
        (sessions) => {
          if (sessions && sessions.length > 0 ){
            this.sessionList = sessions;
          }});

    this.korotePayService.getCurrentSession().subscribe((data: any) => {
      if (data) {
        this.currentSession = data;
      }
    });
    this.paymentsService.getProductList().subscribe(
      data => {
        this.productList = data;
        // console.log("PRODUCT:::", data);
      }
    );
    this.paymentsService.getConcessionList().subscribe(
      data => {
        this.concessionList = data;
        // console.log("CONCESSION:::", data);

      }
    );
    this.selectedLedgerEntry.datePosted = new Date();
    this.bankService.getAllBanks().subscribe(
      (data) => {
        if (data && data.length > 0 )
        {this.bankList = data; }

      }
    );

    console.log('VIEW STUDENT ', this.childMessage);
    this.clearAll();

    this.korotePayService.getNextSessionResumptionDate()
      .subscribe((data) => {
        if (data) {
          console.log('data from resumption date::', data.toLocaleDateString('en-GB'));
          this.resumptionDate  = data;

        }

      });



  }

  viewCheckbox(): void {

    console.log('PAYMENT MODE FALSE', this.paymentModeMarker, this.dMarker);


  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.balanceSubsciption.unsubscribe();
    this.progressSubsciption.unsubscribe();
    this.progressSubsciption2.unsubscribe();
  }

  doAutoReconPosting() {
    this.applicationService.applicationList.subscribe((data) => {
      if (data) { this.applicationList = data; }
    });

    this.reconcilationService.loadReconcilationPayments();
    this.reconcilationService.ReconcilationPaymentsList
    .subscribe(async (recon) =>
    {
      if (recon){
        const limitOfPay = recon.length;

        for (let i = 0 ; i < limitOfPay ; i++)
        {
          const progress = ((i + 1) / limitOfPay) * 100;
          console.log('progressCalculation:::', progress);
          this.dataService.changeProgressMessage2(progress);
          const r = recon[i];
          // console.log("PAYSTACK PAYMENTS", r);

          this.paymentsService.checkLedgerEntry(r).subscribe((data8) => {
            console.log('get the status::', data8, r );
            if (!data8)
            {
              r.transactionType = 'Transfer';


              // check  to see if the student exists
              // if it does, do Ledger entry
              const data = this.studentService.checkIfStudentExists(r.jambNo.trim().toUpperCase())
              .subscribe(async (data) => {
                // console.log("student exists uestion::", data);

                if (data && data !== undefined && data !== '')

                {let tempBal = 0.0;
                 console.log('student exists::', data);
                 this.paymentsService.getBalance_auto(data).subscribe(
                    async (bal) => {
                      console.log('student existsin::', data, bal);

                      if (bal){
                        tempBal = bal;
                        await this.doLedgerEntry(data, tempBal, r);

                      }}

                  );




                }

                else {
                  // balance is zero and student doesnt exist
                  console.log('student doesnt exists::', data);

                  await this.doLedgerEntry(data, 0, r);

                }
              });

              // if it does not, create student
              // do Ledger entry

              // get balance
              // this.doLedgerEntry(r);
            }
            else {console.log('ledger exists'); }

          });
          await new Promise<void>(done => setTimeout(() => done(), 2500));
          // setTimeout(()=> {

          // }, 200);
          // console.log("PAYSTACK:::", r);

          // do creation of each student ledger entry

        }

        this.dataService.changeMessage2('');
        this.dataService.changeProgressMessage2(0);
      }
    });
  }

  async waitFor(seconds: number) {
    // used to create the fancy waterfall
    // fetch(`https://random-data-
    //        api.com/api/stripe/random_stripe` + Math.random());

    // the fake asynchronous task
    return new Promise((resolve, reject) => {
      setTimeout(resolve, seconds * 1000);
    });
  }


  // tslint:disable-next-line:typedef
  async doAutoPaystackPosting() {
    // await this.workOnGender();
    let presPaystackList: string[] = [];
    // get postings that may have been used already
    const payList =  await this.paymentsService.getPayStackPostingsID2();
    console.log('PAYLIST::', payList);

    // this.paymentsService.PayStackPostings.subscribe(
    //   async payList => {

    if (payList !== undefined) {
          presPaystackList = payList;
          console.log('A');
          await this.payStackService.getPayStackPayments2();
          let count1 = 0;
          const pp = this.payStackService.PayStackPayments;
          pp.pipe(skipWhile(val => val.length < 1));
          pp.subscribe( async (data19) => {

          if (data19 && data19.length > 0 && count1 < 1) {
            count1++;
            console.log('B');
            const data9: PaystackAndPayments[] = []; // filtered payStackList
            for (let j = 0; j < data19.length; j++) {
              if (!presPaystackList.includes(data19[j].reference) && data19[j].jambNo.toLowerCase() !== 'nil') {
                data9.push(data19[j]);
              }
              // console.log(`JS-${j}`)
            }
            console.log(`C-${data19.length}`);

            const limitOfPay = data9.length;
            this.totalNumberFound = 0;
            const startE = new Date();
            for (let i = 0 ; i < limitOfPay ; i++) {
              const startDate = new Date();

              const r = data9[i];
              r.transactionType = 'PayStack';
              // check  to see if the student exists
              // if it does, do Ledger entry
              let studentNoPayment = '';
              let studentNoFromJamb = '';
              // check is a regNo has been created for this student
              const data2 = await this.studentService.checkIfStudentExistsRegNo2(r.jambNo.trim().toUpperCase());

              // console.log("INSIDE LAST SUB")
              if (data2 !== undefined && data2 !== '') {
                // console.log('@doPayStackStuff::Sub1::student exists::', data2, r.jambNo.trim().toUpperCase())
                studentNoPayment = data2;
                // console.log("D")
              }

              else {
                // console.log('@doPayStackStuff::Sub1_1::student regNo does not exists::', data2, r.jambNo.trim().toUpperCase())
                // check if this jamb no exists in study node
                const data4rmJ = await this.studentService.checkIfStudentExists2(r.jambNo.trim().toUpperCase());
                // .subscribe((data4rmJ) => {

                if (data4rmJ) {studentNoFromJamb = data4rmJ; }
                  // console.log("student exists uestion::", data);

                  // console.log(`@doPayStackStuff::Sub1_1.1::JAMB could exists associated with study- ${data4rmJ}`)
                  // console.log("D2")



                // });
              }

              ////////////
              if ((studentNoFromJamb && studentNoFromJamb !== undefined && studentNoFromJamb !== '') || studentNoPayment !== '' )

              {
                this.totalNumberFound++;
                let tempBal = 0.0;
                console.log('student exists::', studentNoFromJamb, studentNoPayment);
                const newStudentNo = studentNoPayment !== '' ? studentNoPayment : studentNoFromJamb ;
                const bal = await this.paymentsService.getBalance_auto2(newStudentNo);
                console.log('E-bal', bal);

                if (bal !== undefined){
                  console.log('@doPayStackStuff::Sub1_2');

                  console.log('student existsin-balance=::', newStudentNo, bal);

                  tempBal = bal;
                  await this.doLedgerEntry2(newStudentNo, tempBal, r);
                  console.log('_E1');

                  await new Promise<void>(done => setTimeout(() => done(), 2500));

                }

                else {
                  console.log('@doPayStackStuff::Sub1_2.1');

                  console.log('student existsin-balance =::', newStudentNo, bal);

                  tempBal = 0.0;
                  await this.doLedgerEntry2(newStudentNo, tempBal, r);
                  console.log('_E2', bal);
                  await new Promise<void>(done => setTimeout(() => done(), 2500));


                }
                  // }

                // );




              }

              else {
                // balance is zero and student doesnt exist
                // console.log("student doesnt exist, balance 0::-",studentNoFromJamb);
                this.totalNumberFound++;
                // console.log("\n\nMARKKKKKKKK- next do ledgeentry\n\n", r)
                await this.doLedgerEntry2(studentNoFromJamb, 0, r);
                // console.log("_F")
                await new Promise<void>(done => setTimeout(() => done(), 2500));


              }

              ///////////////
              await this.doPreFinalStuff(i, limitOfPay);
              // console.log("G")
              // const progress = ((i + 1) / limitOfPay) * 100;
              // this.dataService.changeProgressMessage(progress);
              // console.log(`FOR LOOP END- ${i}`)
              // await this.waitFor(5);
              await new Promise<void>(done => setTimeout(() => done(), 2500));

            }
            // console.log('end');
            await this.doFinalStuff();

          }

        });

        }
      // });
    console.log('H');

  }
async doPreFinalStuff(i: number, limitOfPay: number){
  const progress = ((i + 1) / limitOfPay) * 100;
  this.dataService.changeProgressMessage(progress);
}

async doFinalStuff() {
  if (this.newStudentsForEmailList.length > 0) {
    this.utilityService.marker.next(2);
    this.emailService.sendNewStudentData(this.newStudentsForEmailList); // forward to create
    this.newStudentsForEmailList = [];
  }
  this.dataService.changeMessage('');
  this.dataService.changeProgressMessage(0);
  this.payStackService.setLastChecked();
  this.payStackService.getLastChecked();
}

  doAutoPaystackPosting_old() {
    console.log('START AUTO PAYSTACK');
    let presPaystackList: string[] = [];
    // get postings that may have been used already
    this.paymentsService.PayStackPostings.subscribe(
      payList => {
        if (payList) {
          presPaystackList = payList;
          this.payStackService.getPayStackPayments();
          this.payStackService.PayStackPayments.subscribe( async (data19) => {

          if (data19) {
          const data9: PaystackAndPayments[] = []; // filtered payStackList
          for (let j = 0; j < data19.length; j++) {
            if (!presPaystackList.includes(data19[j].reference) && data19[j].jambNo.toLowerCase() != 'nil') {
              data9.push(data19[j]);



            }

          }

          const limitOfPay = data9.length;
          this.totalNumberFound = 0;
              // for (let i=limitOfPay-1 ; i >= 0 ; i--)
          const promises = [];
          let startE = new Date();
          for (let i = 0 ; i < limitOfPay ; i++)

              {
                console.log(`FOR LOOP START- ${i} - ${Date.now()}`);

                await this.doPayStackStuff(i, limitOfPay, data9[i]).then(async () => {console.log(`@then::DO PAYSTACK STUFF DONE- ${i} -- ${Date.now()}`); });
                const endE = new Date();

                const timeTaken = endE.getTime() - startE.getTime();
                startE = endE;
                console.log(`\nDONEEEEEE\n- ${timeTaken} \n `);
                console.log(data9[i]);

                const progress = ((i + 1) / limitOfPay) * 100;
                this.dataService.changeProgressMessage(progress);
                console.log(`FOR LOOP END- ${i}`);
                await this.waitFor(5);


              // });
                // promises.push(promise);

              }

              // await Promise.all(promises);

          console.log('end');
          if (this.newStudentsForEmailList.length > 0) {
                this.emailService.sendNewStudentData(this.newStudentsForEmailList); // forward to create
                this.newStudentsForEmailList = [];
              }
          this.dataService.changeMessage('');
          this.dataService.changeProgressMessage(0);
          this.payStackService.setLastChecked();
          this.payStackService.getLastChecked();





        // check to see if newstudents for emails have been created

          // this.payStackService.NewLedgerEntries.next(this.newLedgerEntryList);





      }
    });



        }

      }
    );
      // get applications so far





    // get payments from paystack

    // check to see if the payments have been posted on the students ledgers

    // if it is not posted- post


  }

  async doPayStackStuff(i: number, limitOfPay: number, r: PaystackAndPayments) {
    const startDate = new Date();
    // console.log('FORLOOP START ENTRY::', startDate);

    // const r = data9[i];
    r.transactionType = 'PayStack';
    // check  to see if the student exists
    // if it does, do Ledger entry
    let studentNoPayment = '';
    let studentNoFromJamb = '';
    // check is a regNo has been created for this student
    this.studentService.checkIfStudentExistsRegNo(r.jambNo.trim().toUpperCase())
    .subscribe( async data2 =>
      {
            if (data2 && data2 !== undefined && data2 !== '') {
              console.log('@doPayStackStuff::Sub1::student exists::', data2);
              studentNoPayment = data2;
            }

            else {
              console.log('@doPayStackStuff::Sub1_1::student exists::');
              // check if this jamb no exists in study node
              this.studentService.checkIfStudentExists(r.jambNo.trim().toUpperCase())
            .subscribe((data4rmJ) => {

              if (data4rmJ) {studentNoFromJamb = data4rmJ; }
              // console.log("student exists uestion::", data);

              console.log(`@doPayStackStuff::Sub1_1.1::JAMB could exists associated with study- ${data4rmJ}`);



            });
            }

            if (studentNoFromJamb && studentNoFromJamb !== undefined && studentNoFromJamb !== '' || studentNoPayment !== '' )

              {
                this.totalNumberFound++;
                let tempBal = 0.0;
                console.log('student exists::', studentNoFromJamb, studentNoPayment);
                const newStudentNo = studentNoPayment !== '' ? studentNoPayment : studentNoFromJamb ;
                const bal = await this.paymentsService.getBalance_auto2(newStudentNo);
                //  .subscribe(
                  //  async (bal: number) =>{

                if (bal !== undefined){
                      console.log('@doPayStackStuff::Sub1_2');

                      console.log('student existsin-balance=::', newStudentNo, bal);

                      tempBal = bal;
                      await this.doLedgerEntry(newStudentNo, tempBal, r);

                    }

                    else {
                      console.log('@doPayStackStuff::Sub1_2.1');

                      console.log('student existsin-balance =::', newStudentNo, bal);

                      tempBal = 0.0;
                      await this.doLedgerEntry(newStudentNo, tempBal, r);
                    }
                  // }

                // );




              }

              else {
                // balance is zero and student doesnt exist
                console.log('student doesnt exist::-', studentNoFromJamb);
                this.totalNumberFound++;
                console.log('\n\nMARKKKKKKKK- next do ledgeentry\n\n', r);
                await this.doLedgerEntry(studentNoFromJamb, 0, r);


              }


        });

    // const sDate = new Date();
    // console.log('JUST STARTED')
    // await new Promise<void>(done => setTimeout(() =>
    // {
    //   done();
    //   console.log('JUST DONE')


    // }
    // , (i * 1500)));

    // const eDate = new Date();
    // console.log('TIME WAITED(S)::', (eDate.getMilliseconds() - sDate.getMilliseconds())/1000);


    // // console.log('OUT OF ALL SUBSCRIBE', i)
    // const endDate = new Date();

    // console.log('END DATE::', endDate);
    // console.log('TIME TAKEN FOR ONE SEARCH(S)::', (endDate.getMilliseconds() - startDate.getMilliseconds())/1000);

    // console.log('FORLOOP END ENTRY::', endDate);
    // delay(i * 3000);
  }

  async doPayStackStuff2(i: number, limitOfPay: number, r: PaystackAndPayments) {
    const startDate = new Date();
    // console.log('FORLOOP START ENTRY::', startDate);

    // const r = data9[i];
    r.transactionType = 'PayStack';
    // check  to see if the student exists
    // if it does, do Ledger entry
    let studentNoPayment = '';
    let studentNoFromJamb = '';
    // check is a regNo has been created for this student
    const data2 = await this.studentService.checkIfStudentExistsRegNo(r.jambNo.trim().toUpperCase())
    .subscribe( async data2 =>
      {
            if (data2 && data2 !== undefined && data2 !== '') {
              console.log('@doPayStackStuff::Sub1::student exists::', data2);
              studentNoPayment = data2;
            }

            else {
              console.log('@doPayStackStuff::Sub1_1::student exists::');
              // check if this jamb no exists in study node
              this.studentService.checkIfStudentExists(r.jambNo.trim().toUpperCase())
            .subscribe((data4rmJ) => {

              if (data4rmJ) {studentNoFromJamb = data4rmJ; }
              // console.log("student exists uestion::", data);

              console.log(`@doPayStackStuff::Sub1_1.1::JAMB could exists associated with study- ${data4rmJ}`);



            });
            }

            if (studentNoFromJamb && studentNoFromJamb !== undefined && studentNoFromJamb !== '' || studentNoPayment !== '' )

              {
                this.totalNumberFound++;
                let tempBal = 0.0;
                console.log('student exists::', studentNoFromJamb, studentNoPayment);
                const newStudentNo = studentNoPayment !== '' ? studentNoPayment : studentNoFromJamb ;
                this.paymentsService.getBalance_auto(newStudentNo).subscribe(
                   async (bal: number) => {

                    if (bal !== undefined){
                      console.log('@doPayStackStuff::Sub1_2');

                      console.log('student existsin-balance=::', newStudentNo, bal);

                      tempBal = bal;
                      await this.doLedgerEntry(newStudentNo, tempBal, r);

                    }

                    else {
                      console.log('@doPayStackStuff::Sub1_2.1');

                      console.log('student existsin-balance =::', newStudentNo, bal);

                      tempBal = 0.0;
                      await this.doLedgerEntry(newStudentNo, tempBal, r);
                    }
                  }

                );




              }

              else {
                // balance is zero and student doesnt exist
                console.log('student doesnt exist::-', studentNoFromJamb);
                this.totalNumberFound++;
                console.log('\n\nMARKKKKKKKK- next do ledgeentry\n\n', r);
                await this.doLedgerEntry(studentNoFromJamb, 0, r);


              }


        });

    // const sDate = new Date();
    // console.log('JUST STARTED')
    // await new Promise<void>(done => setTimeout(() =>
    // {
    //   done();
    //   console.log('JUST DONE')


    // }
    // , (i * 1500)));

    // const eDate = new Date();
    // console.log('TIME WAITED(S)::', (eDate.getMilliseconds() - sDate.getMilliseconds())/1000);


    // // console.log('OUT OF ALL SUBSCRIBE', i)
    // const endDate = new Date();

    // console.log('END DATE::', endDate);
    // console.log('TIME TAKEN FOR ONE SEARCH(S)::', (endDate.getMilliseconds() - startDate.getMilliseconds())/1000);

    // console.log('FORLOOP END ENTRY::', endDate);
    // delay(i * 3000);
  }



  waitforme(ms: number)  {
    return new Promise( resolve => { setTimeout(resolve, ms); });
  }

  async doLedgerEntry2(aStudentNo: string, aBalance: number,
                       aPayStackEntry: PaystackAndPayments) {

    const selectedLedgerEntry: Partial <StudentLedgerEntry> = {};
    if (aPayStackEntry !== undefined) {
      selectedLedgerEntry.session = this.currentSession;
      selectedLedgerEntry.semester = this.korotePayService.getCurrentSemester();
      selectedLedgerEntry.qty = 1;
      selectedLedgerEntry.cr = aPayStackEntry.amount;
      selectedLedgerEntry.balance = (aBalance) + aPayStackEntry.amount;
      selectedLedgerEntry.paymentMode = aPayStackEntry.transactionType;

      if (aPayStackEntry.transactionType !== 'PayStack' ) {
        selectedLedgerEntry.receiptNo =
        aPayStackEntry.receiptNo;
        selectedLedgerEntry.details =
          aPayStackEntry.detail   ? ('AUTO CREDITS: ' +
          aPayStackEntry.detail) : '';
        selectedLedgerEntry.bank = 'ZENITH';
        selectedLedgerEntry.product = (aPayStackEntry &&
          (aPayStackEntry.reference.includes('topfaithuniacceptancefees') ||
          aPayStackEntry.reference.includes('Acpt Fee') ) )
        ? 'ACCEPTANCE_FEES' : 'FEES PAYMENT';
      }

      else {
        console.log(' PAYSTACK ENTRY:::');
        const a = aPayStackEntry.detail !== undefined ? aPayStackEntry.detail.split('/') : [];
        // console.log("DETAILS2::", aPayStackEntry?.detail, aPayStackEntry?.detail.split('/'));
        selectedLedgerEntry.product = (aPayStackEntry && a[a.length - 1] === 'topfaithuniacceptancefees')
        ? 'ACCEPTANCE_FEES' : 'FEES PAYMENT';
        selectedLedgerEntry.details =
        aPayStackEntry.detail !== undefined  ? ('AUTO CREDITS: ' + a[a.length - 1]) : '';

      }

      selectedLedgerEntry.tellerDate = aPayStackEntry.tellerDate;
      selectedLedgerEntry.tellerNo = aPayStackEntry.reference;
      selectedLedgerEntry.staffIn = this.userService.getUser();

      if (aStudentNo !== undefined && aStudentNo !== '') {

        if (selectedLedgerEntry.paymentMode === 'PayStack') {
            const aList = this.payStackService.NewLedgerEntries.getValue();
            aList.push(selectedLedgerEntry as StudentLedgerEntry);
            console.log('COUNT OF FOUND LEDGERS', aList.length);
            this.payStackService.NewLedgerEntries.next(aList);
            await this.paymentsService.makePosting2(aStudentNo, selectedLedgerEntry as StudentLedgerEntry);


        }

      }

      else {
        if (aPayStackEntry.jambNo.toString().trim().toUpperCase() !== '') {
        const tempanswer = this.applicationPipe
        .transform(this.applicationList, aPayStackEntry.jambNo.toString().trim().toUpperCase());

        const answer = tempanswer.filter(app => app.jambNo.toString().trim().toUpperCase() === aPayStackEntry.jambNo.toString().trim().toUpperCase());
        console.log('the applications::', answer[0], this.selectedLedgerEntry);
        let max = 0;
        let maxIndex = 0;
        for (let i = 0; i < answer.length; i++) {
          const temp = this.getCountOfKeys(answer[i]);
          if (temp > max){
            max = temp;
            maxIndex = i;
          }
        }
        console.log('the applications::', answer[maxIndex], this.selectedLedgerEntry);
        await this.getStudentFromApplication(answer[maxIndex], selectedLedgerEntry as StudentLedgerEntry);
      }


    }



    }
  }

  async doLedgerEntry(aStudentNo: string, aBalance: number,
                      aPayStackEntry: PaystackAndPayments) {
    let aResponse = false;
    const testForNewStud = false;
    const selectedLedgerEntry: Partial <StudentLedgerEntry> = {};
    const selectedApplication: Partial <Applications> = {};

    // console.log("DETAILSout::", aPayStackEntry);


    if (aPayStackEntry && aPayStackEntry !== undefined) {

    // console.log("DETAILSin::", aPayStackEntry, aPayStackEntry.detail);

    // selectedLedgerEntry.session = this.korotePayService.getCurrentSession().getValue();
    // this.korotePayService.getCurrentSession().subscribe((data: any) => {
    //   if (data) {
        selectedLedgerEntry.session = this.currentSession;
    //   }
    // });
    //  this.korotePayService.getCurrentSession();
        selectedLedgerEntry.semester = this.korotePayService.getCurrentSemester();

        selectedLedgerEntry.qty = 1;
        selectedLedgerEntry.cr = aPayStackEntry.amount;
        selectedLedgerEntry.balance = (aBalance) + aPayStackEntry.amount;
        selectedLedgerEntry.paymentMode = aPayStackEntry.transactionType;

        if (aPayStackEntry.transactionType !== 'PayStack' ) {
        selectedLedgerEntry.receiptNo =
        aPayStackEntry.receiptNo;

        selectedLedgerEntry.details =
          aPayStackEntry.detail   ? ('AUTO CREDITS: ' +
          aPayStackEntry.detail) : '';
        selectedLedgerEntry.bank = 'ZENITH';
        selectedLedgerEntry.product = (aPayStackEntry &&
          (aPayStackEntry.reference.includes('topfaithuniacceptancefees') ||
          aPayStackEntry.reference.includes('Acpt Fee') ) )
        ? 'ACCEPTANCE_FEES' : 'FEES PAYMENT';
      }

    else {
      console.log(' PAYSTACK ENTRY:::');
      const a = aPayStackEntry.detail ? aPayStackEntry.detail.split('/') : [];
      console.log('DETAILS2::', aPayStackEntry.detail, aPayStackEntry.detail.split('/'));
      selectedLedgerEntry.product = (aPayStackEntry && a[a.length - 1] === 'topfaithuniacceptancefees')
    ? 'ACCEPTANCE_FEES' : 'FEES PAYMENT';
      selectedLedgerEntry.details =
    aPayStackEntry.detail   ? ('AUTO CREDITS: ' + a[a.length - 1]) : '';

    }

        selectedLedgerEntry.tellerDate = aPayStackEntry.tellerDate;
        selectedLedgerEntry.tellerNo = aPayStackEntry.reference;
        selectedLedgerEntry.staffIn = this.userService.getUser();

        if (aStudentNo && aStudentNo !== undefined && aStudentNo !== '') {

        if (selectedLedgerEntry.paymentMode === 'PayStack') {
            const aList = this.payStackService.NewLedgerEntries.getValue();
            aList.push(selectedLedgerEntry as StudentLedgerEntry);
            console.log('COUNT OF FOUND LEDGERS', aList.length);
            this.payStackService.NewLedgerEntries.next(aList);

        }
        await this.paymentsService.makePosting2(aStudentNo, selectedLedgerEntry as StudentLedgerEntry);

    }
    else {
      if (aPayStackEntry.jambNo.toString().trim().toUpperCase() !== '') {
        const answer = this.applicationPipe
      .transform(this.applicationList, aPayStackEntry.jambNo.toString().trim().toUpperCase());


        console.log('the applications::', answer[0], this.selectedLedgerEntry);
        let max = 0;
        let maxIndex = 0;
        for (let i = 0; i < answer.length; i++) {
        const temp = this.getCountOfKeys(answer[i]);
        if (temp > max){
          max = temp;
          maxIndex = i;
        }
      }
        console.log('the applications::', answer[maxIndex], this.selectedLedgerEntry);
        await this.getStudentFromApplication(answer[maxIndex], selectedLedgerEntry as StudentLedgerEntry);
      }


    }

        aResponse = true;


    }
    // return this.selectedLedgerEntry as StudentLedgerEntry;
  }

  getCountOfKeys(anApplication: Applications): number {

    const count =
      [
        'dateCreated',
        'firstName',
        'middleName',
        'lastName',
        'dOB',
        'gender',
        'nin',
        'maritalStatus',
        'religion',
        'status',
        'email',
        'phone',
        'address',
        'state',
        'applicationNo',
        'jambNo',
        'department1',
        'department2',
        'guardians1',
        'guardians2',
        'beginSession',
        'bloodGroup',
        'disability' ].filter(
          // @ts-ignore
          (k) => k in anApplication && anApplication[k] != null
        ).length;
    return count;
  }
  async getStudentFromApplication(anApplication: Applications, selectedLedgerEntry: StudentLedgerEntry) {
    // console.log('SET STUDY INFO TRIGGERED');

    const acceptanceFee = 0.0;
    const detail = 'ACCEPTANCE FEE';

    if (anApplication )
    {
      const selectedStudy: Partial <Study> = {};
      const selectedStudent: Partial <Student> = {};
      const selectedLedgerDebit: Partial <StudentLedgerEntry> = {};
      const price = await this.productService.getProductPrice2('ACCEPTANCE_FEES');
      console.log('PRICE::: ', price);
      selectedLedgerDebit.dr = price;
      selectedLedgerDebit.balance = 0 - price;
      selectedLedgerDebit.datePosted = selectedLedgerEntry.datePosted;
      selectedLedgerDebit.session = selectedLedgerEntry.session;
      selectedLedgerDebit.semester = selectedLedgerEntry.semester;
      selectedLedgerDebit.product = 'ACCEPTANCE_FEES';
      selectedLedgerDebit.qty = selectedLedgerEntry.qty;
      selectedLedgerDebit.details = 'ACCEPTANCE FEES';
      selectedLedgerDebit.staffIn = selectedLedgerEntry.staffIn;
      const nextOfKinList: NextKin[] = [];
      selectedStudy.applicationNo =
      anApplication.applicationNo ? anApplication.applicationNo : '';
      selectedStudy.programme =
      anApplication.department1 ? anApplication.department1.toString().toUpperCase() : '';
      selectedStudy.studentType = 0;
      selectedStudy.status = 'Applicant';
      selectedStudy.beginSession = anApplication.beginSession;
      selectedStudy.finishSession = '';
      selectedStudy.jambNo = anApplication.jambNo.trim().toUpperCase();


      // student info loading
      selectedStudent.dOB = anApplication.dOB;
      selectedStudent.phone = anApplication.phone;
      selectedStudent.maritalStatus = anApplication.maritalStatus?.toString().toUpperCase();
      selectedStudent.email = anApplication.email.toString().toLowerCase();
      selectedStudent.nin = anApplication.nin;
      selectedStudent.phone = anApplication.phone;
      selectedStudent.level = 100;
      selectedStudent.studentType = selectedStudy.studentType;
      selectedStudent.programme = selectedStudy.programme;

      selectedStudent.firstName = anApplication.firstName?.toString().toUpperCase();
      selectedStudent.lastName = anApplication.lastName?.toString().toUpperCase();
      selectedStudent.middleName = anApplication.middleName?.toString().toUpperCase();
      selectedStudent.gender = anApplication.gender;
      selectedStudent.religion = anApplication.religion?.toString().toUpperCase() ;
      selectedStudent.state = anApplication.state?.toString().trim().toUpperCase() ;
      selectedStudent.title = anApplication.gender === 'M' ? 'MR'
      : ( anApplication.gender === 'F' ? 'MS' : '');
      selectedStudent.nationality = anApplication.nationality?.toString().trim().toUpperCase() ;
      selectedStudent.address = anApplication.address?.toString().toUpperCase() ;
      selectedStudent.activeStatus = true;
      selectedStudy.beginDate = this.resumptionDate;
      selectedStudent.staffIn = this.userService.getUser();
      selectedStudy.staffIn = this.userService.getUser();
      // const lastNo = await this.studentService.getStudentNumber2()
      //   .then(async (regNo) => {
      //     const checkAnswer = await this.setStudentFinisher(selectedStudent, regNo);
      //     console.log('NUMBER GOT::', regNo);
      //   });
      // console.log('NUMBER GOT::', lastNo);
      this.studentService.getStudentNumber()
        .subscribe(async (lastNumber: string) => {
            const checkAnswer = await this.setStudentFinisher(selectedStudent, lastNumber);
            console.log('NUMBER GOT::', lastNumber);
            if (anApplication.guardians1?.fullName && anApplication.guardians1?.fullName !== '') {

            anApplication.guardians1.title = anApplication.guardians1.title ?
              anApplication.guardians1.title : '';
            anApplication.guardians1.address = anApplication.guardians1.address ?
              anApplication.guardians1.address : '';

            anApplication.guardians1.email = anApplication.guardians1.email ?
              anApplication.guardians1.email : '';

            anApplication.guardians1.relationship = anApplication.guardians1.relationship ?
              anApplication.guardians1.relationship : '';

            anApplication.guardians1.occupation = anApplication.guardians1.occupation ?
              anApplication.guardians1.occupation : '';
            nextOfKinList.push(anApplication.guardians1 as NextKin);

          }

            if (anApplication.guardians2?.fullName && anApplication.guardians2?.fullName !== '') {

            anApplication.guardians2.title = anApplication.guardians2.title ?
              anApplication.guardians2.title : '';
            anApplication.guardians2.address = anApplication.guardians2.address ?
              anApplication.guardians2.address : '';
            anApplication.guardians2.email = anApplication.guardians2.email ?
              anApplication.guardians2.email : '';
            anApplication.guardians2.relationship = anApplication.guardians2.relationship ?
              anApplication.guardians2.relationship : '';

            anApplication.guardians2.occupation = anApplication.guardians2.occupation ?
              anApplication.guardians2.occupation : '';
            nextOfKinList.push(anApplication.guardians2 as NextKin);

          }

            // const setStudent = await this.studentService.setStudent2(selectedStudent as Student, selectedStudy as Study, nextOfKinList)
            //   .then(
            //     async (setStudent2) => {
            //       await this.finalStudentFinisher(setStudent2, selectedStudent, selectedLedgerDebit, selectedLedgerEntry);
            //     }
            //   );

            this.studentService.setStudent(selectedStudent as Student, selectedStudy as Study, nextOfKinList)
              .subscribe(async (setStud) => {
                // async (setStudent2) => {
                await this.finalStudentFinisher(setStud, selectedStudent, selectedLedgerDebit, selectedLedgerEntry);
                // }
              });

        }
        );
      // const checkAnswer = await this.setStudentFinisher(selectedStudent, lastNo);
      // selectedStudent.studentNo = this.utilityService.prepareNewID2(lastNo, 9);




      // console.log("STUDENT DATA:::", selectedStudent);
      // console.log("STUDY DATA:::", selectedStudy);

      // console.log("AT SET STUDENT::", selectedLedgerEntry);


                  // debit acceptance fee



  }
  }
  async setStudentFinisher(selectedStudent: Partial<Student>, lastNo: string ){
    selectedStudent.studentNo = this.utilityService.prepareNewID2(lastNo, 9);
    return selectedStudent;
  }

  async finalStudentFinisher(setStudent: number, selectedStudent: Partial<Student>,
                             selectedLedgerDebit: Partial<StudentLedgerEntry>,
                             selectedLedgerEntry: StudentLedgerEntry ) {
    if (setStudent === 1) {
      this.newStudentsForEmailList.push(selectedStudent as Student);
      // const debPost = await this.paymentsService.makePosting2(selectedStudent.studentNo,
      //   selectedLedgerDebit as StudentLedgerEntry);

      this.paymentsService.makePosting(selectedStudent.studentNo,
        selectedLedgerDebit as StudentLedgerEntry)
        .subscribe(async (debPost1) => {
          const aBal = selectedLedgerDebit.balance as number;
          const cr = selectedLedgerEntry.cr as number;
          const newBal = aBal + cr;
          selectedLedgerEntry.balance = newBal;
          if (debPost1 === 1) {
            this.paymentsService.makePosting(selectedStudent.studentNo, selectedLedgerEntry).subscribe((debPost2) => {
              if (debPost2 === 1) {

                const aList = this.payStackService.NewLedgerEntries.getValue();
                aList.push(selectedLedgerEntry);
                if (selectedLedgerEntry.paymentMode === 'PayStack') {
                  this.payStackService.NewLedgerEntries.next(aList);

                }
              }

            });

          }

        });
      // const aBal = selectedLedgerDebit.balance as number;
      // const cr = selectedLedgerEntry.cr as number;
      // const newBal = aBal + cr;
      // selectedLedgerEntry.balance = newBal;
      // if (debPost === 1) {
      //   const debPost2 = await this.paymentsService.makePosting2(selectedStudent.studentNo, selectedLedgerEntry);
      //   if (debPost2 === 1) {
      //
      //
      //
      //   }
      //
      // }
      // const aList = this.payStackService.NewLedgerEntries.getValue();
      // aList.push(selectedLedgerEntry);
      // if (selectedLedgerEntry.paymentMode === 'PayStack') {
      //   this.payStackService.NewLedgerEntries.next(aList);
      //
      // }

    }
  }


  clearAll(): void {
    this.selectedLedgerEntry.bank = undefined;
    this.selectedLedgerEntry.depositor = undefined;
    this.selectedLedgerEntry.tellerDate = undefined;
    this.selectedLedgerEntry.tellerNo = undefined;
    this.selectedLedgerEntry.details = undefined;
    this.selectedLedgerEntry.depositor = undefined;
    this.selectedLedgerEntry.paymentMode = undefined;
    this.selectedLedgerEntry.receiptNo = undefined;
    this.paymentModeMarker = false;
      // this.selectedLedgerEntry.paymentMode = undefined;

  }

  disable2and3(): void {
    this.debitMarker = true;
  }

    // generate new student number


  getTellNo(): boolean {
    let answer = false;
    if (this.selectedLedgerEntry.paymentMode === 'PayStack' ||
    this.selectedLedgerEntry.paymentMode === 'Transfer')
    {
      answer = true;
    }

    // else answer = "TELLER NO"
    return answer;
  }

  validateQty(): void {
    if (this.selectedLedgerEntry.qty !== undefined && this.selectedLedgerEntry.qty < 1)
    {this.selectedLedgerEntry.qty = 1; }
    this.calcTotal();
  }

  paymentModeChange(): void {
    console.log('PAYMENT MODE::', this.selectedLedgerEntry.paymentMode );
    if (this.selectedLedgerEntry.paymentMode === 'Cash') {
      this.cashPaymentMode();
    }

    else if (this.selectedLedgerEntry.paymentMode === 'Bank') {
      this.bankPaymentMode();
    }

    else if (this.selectedLedgerEntry.paymentMode === 'PayStack') {
      this.paystackPaymentMode();
    }

    else if (this.selectedLedgerEntry.paymentMode === 'Error Correct') {
      this.errorCorrectionsMode();
    }
    else if (this.selectedLedgerEntry.paymentMode === 'Concessions') {
      this.concessionsMode();
    }
    else if (this.selectedLedgerEntry.paymentMode === 'Transfer') {
      this.transferPaymentMode();
    }
  }

  paystackPaymentMode(): void {

    this.bankMarker = true; this.detailsMarker = true; this.concessionMarker = true;

    this.receiptNoMarker = false; this.tellerDepositMarker = true; this.tellerDateMarker = false;
    this.tellerNoMarker = false;
    this.isTransfer = true;

  }

  transferPaymentMode(): void {

    this.bankMarker = false; this.detailsMarker = false; this.concessionMarker = true;

    this.receiptNoMarker = false; this.tellerDepositMarker = false; this.tellerDateMarker = false;
    this.tellerNoMarker = false;


    this.isTransfer = true;

  }

  cashPaymentMode(): void {

    this.bankMarker = true; this.detailsMarker = true; this.concessionMarker = true;

    this.receiptNoMarker = false; this.tellerDepositMarker = true; this.tellerDateMarker = true;
    this.tellerNoMarker = true;

  }

  bankPaymentMode(): void {
    this.bankMarker = false; this.detailsMarker = false; this.concessionMarker = true;

    this.receiptNoMarker = false; this.tellerDepositMarker = false; this.tellerDateMarker = false;
    this.tellerNoMarker = false;
    this.isTransfer = false;
  }

  // resetAllEntriesRequired(): void {
    // this.paymentModeMarker = false;
    // this.bankMarker = false; this.detailsMarker = false; this.concessionMarker = true;

    // this.receiptNoMarker = false; this.tellerDepositMarker = false; this.tellerDateMarker = false;
    // this.tellerNoMarker = false;
  // }

  errorCorrectionsMode(): void {
    this.bankMarker = true; this.detailsMarker = false; this.concessionMarker = true;

    this.receiptNoMarker = true; this.tellerDepositMarker = true; this.tellerDateMarker = true;
    this.tellerNoMarker = true;
    this.isTransfer = true;
  }

  concessionsMode(): void {
    this.bankMarker = true; this.detailsMarker = false; this.concessionMarker = false;

    this.receiptNoMarker = true; this.tellerDepositMarker = true; this.tellerDateMarker = true;
    this.tellerNoMarker = true;
    this.isTransfer = true;
  }

  checkDebOrCr(): void {
    console.log('TRANSACTION TYPE::', this.transactionType);
    if (this.transactionType === '1' ) {
      // this.selectedLedgerEntry.paymentMode='';
      this.paymentModeMarker = false;
      this.selectedLedgerEntry.paymentMode = undefined;
      this.bankMarker = true;  this.concessionMarker = true;

      this.receiptNoMarker = true; this.tellerDepositMarker = true; this.tellerDateMarker = true;
      this.tellerNoMarker = true;
      this.detailsMarker = true;
      this.debitMarker = true;
      // this.bankMarker = false;

      console.log('PAYMENT MODE FALSE', this.paymentModeMarker, this.detailsMarker);


      // setTimeout(()=>{
      // }, 200);

      // this.resetAllEntriesRequired();

    }

    else{
      this.debitMarker = false;
      this.paymentModeMarker = true;
      console.log('PAYMENT MODE FALSE', this.paymentModeMarker, this.detailsMarker);

    }


  }

  // chargesMode(): void {
  //   this.debitMarker = true;
  // }




  Pay() {
    // const answer: AsyncSubject<boolean> = new AsyncSubject<boolean>();
    if (this.transactionType === '2'){
      this.selectedLedgerEntry.cr = this.amount;
      this.selectedLedgerEntry.balance = this.amount + this.balance;
    }
    else {
      this.selectedLedgerEntry.dr = this.amount;
      this.selectedLedgerEntry.balance = this.balance - this.amount;

    }
    const answerLedger = this.selectedLedgerEntry as StudentLedgerEntry;
    answerLedger.balance = answerLedger.balance ? answerLedger.balance : 0.0  ;
    if (this.transactionType === '2'){
      answerLedger.cr = answerLedger.cr ? answerLedger.cr : 0.0  ;
    }
    else {
      answerLedger.dr = answerLedger.dr ? answerLedger.dr : 0.0  ;

    }
    answerLedger.staffIn = this.userService.getUser();
    // console.log('LEDGER INFO:::', this.selectedLedgerEntry);

    if (answerLedger.paymentMode === 'PayStack') {
                    const aList = this.payStackService.NewLedgerEntries.getValue();
                    aList.push(answerLedger);
                    console.log('COUNT OF FOUND LEDGERS', aList.length);
                    this.payStackService.NewLedgerEntries.next(aList);

                  }
    const multiControl = this.paymentsService.makePosting(this.childMessage,
    answerLedger);




    // this.paymentsService.getPostings(this.childMessage);
    // this.paymentsService.getBalance(this.childMessage);


    multiControl.subscribe(
        data => {
          if (data) {
            this.paymentsService.getPostings(this.childMessage);
            this.paymentsService.getBalance(this.childMessage);
          }
        });



    this.clearAll();
    this.disable2and3();
        // this.selectedLedgerEntry = {}
      }





  calcTotal(): void {
    this.selectedLedgerEntry.product = this.selectedProduct.prodCode;
    if (this.selectedProduct.price !== undefined && this.selectedLedgerEntry.qty !== undefined) {
      this.tempTotal = this.selectedProduct.price * this.selectedLedgerEntry.qty;
    }
  }

  checkProductSelection(): boolean {
      if (this.selectedLedgerEntry.product ) { return true; }
      else {return false; }
  }

  correctAnomalies(): void {
    this.selectedLedgerEntry = {};
    this.selectedLedgerEntry.datePosted = new Date();
    this.selectedLedgerEntry.session = undefined;
    this.selectedLedgerEntry.semester = undefined;
    this.selectedLedgerEntry.qty = 1;
    this.amount = 0.0;

    this.selectedProduct = {};
    this.selectedLedgerEntry.product = undefined;
    this.tempTotal = 0.0;
    this.validateQty();
    this.debitMarker = true;
  }

  displayFn(applicant: StudentProduct): string {
    console.log('THE INDEX::', applicant);
    // this.selectedApplication = applicant;
    console.log('THE APP::', this.selectedProduct);

    return applicant && applicant.prodCode ? applicant.prodCode : '';
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

}
