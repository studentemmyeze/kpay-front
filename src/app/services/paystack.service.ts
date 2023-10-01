import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {AsyncSubject, BehaviorSubject} from 'rxjs';
import { PaystackAndPayments, StudentLedgerEntry } from '../interfaces/student';
import { DataService } from './data.service';
import { KLoginService } from './klogin.service';
import {UtilityService} from "./utility.service";

@Injectable({
  providedIn: 'root'
})


export class PaystackService {
  PayStackPayments: BehaviorSubject<PaystackAndPayments[]> = new BehaviorSubject<PaystackAndPayments[]>([]);
  PayStackLastCheck: BehaviorSubject<Date> = new BehaviorSubject<Date>(new Date());
  NewLedgerEntries: BehaviorSubject<StudentLedgerEntry[]> = new BehaviorSubject<StudentLedgerEntry[]>([]);

  params1 = new HttpParams()
    // .set(
    //   'perPage', '100'
    //   )
      .set(
        'status', 'success'

        )
        .append(
          'perPage', '200'

            );


  httpOptions = {
    // responseType: 'json',
    'Content-Type':  'application/json',
    headers: new HttpHeaders({
      'Authorization': 'Bearer sk_live_c52affc6949dae8d00d66a6fc5d62383855c1b4a',
    }),
    params: this.params1

  };




//   sk_live_c52affc6949dae8d00d66a6fc5d62383855c1b4a
// pk_live_06897ab8a3f1a55edfb029f103dc840a27d5afac

  constructor(private https: HttpClient,
              public angularS1: KLoginService,
              private utils: UtilityService,
              private dataService: DataService) {

    // console.log("paramaters:::", this.httpOptions);


   }

   getLastChecked(): void {

    const aD: Date[] = [];

    // this.angularS1.doConnect();
    // const answer: BehaviorSubject<StudentLedgerEntry[]> = new BehaviorSubject <StudentLedgerEntry[]>([]);

    // const myQualificationList : StudentLedgerEntry[] = [] ;
    const query = `MATCH (n:PayStackDetails)  return n.lastCheck`;
    console.log("QUERY FOR PAYMENTS", query);
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     aD = new Date(r[0])
    //   }
    //   this.PayStackLastCheck.next(aD);
    //
    //   });

     this.angularS1.queryDB(query, '0')
       .subscribe((data) => {
         for (let i = 0; i < data.results.length; i++) {
           aD.push(new Date(this.utils.getStringDate(data.results[i][0])));
           console.log('AD::', aD[0], data.results, data.results[i], data.results[i][0]);
         }
         this.PayStackLastCheck.next(aD[0]);
       });
    console.log('AD::', aD[0]);
    // return (aList[1] - aList[0])

  }

   setLastChecked(): AsyncSubject<boolean> {
    let aD :boolean = false;

    // this.angularS1.doConnect();
    const answer: AsyncSubject<boolean> = new AsyncSubject <boolean>();

    // const myQualificationList : StudentLedgerEntry[] = [] ;
    const query = `MATCH (n:PayStackDetails) set n.lastCheck = datetime({ timezone:'+01:00' }) return true`;
    console.log("QUERY FOR PAYMENTS", query);
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     aD = (r[0])
    //   }
    //
    //   });

    this.angularS1.writeDB(query, '0')
       .subscribe((data) => {
         for (let i = 0; i < data.results.length; i++) {
           // aD = (data.results[i][0]);
            aD = true;


         }
         answer.next(aD);
         answer.complete();
       });

    return answer;
   }

   getPayStackPayments(): AsyncSubject<PaystackAndPayments[]> {
    let payStackFind = '';
    const answer: AsyncSubject<PaystackAndPayments[]> = new AsyncSubject<PaystackAndPayments[]>();
    const payStackPayments: PaystackAndPayments[] = [];
    this.https.get(`https://api.paystack.co/transaction/`, this.httpOptions)// {params: params1})
    .subscribe((data: any) => {
      console.log('PAYSTACK DATA', data);
      if (data) {
        for (const r of data.data) {
          // payStackFind = r.reference === 'T228458299353568' ? r.reference: '';
          payStackPayments.push({
            reference: r.reference,
              jambNo: (r.metadata.custom_fields[0]).value.trim().toUpperCase(),
              detail: r.metadata.referrer,
              amount: (r.requested_amount / 100) - 300,
              tellerDate: r.paidAt
            } as unknown as PaystackAndPayments);
            // if ((r.metadata.custom_fields[0]).value.trim().toUpperCase() === '10046696ED') {
            //   console.log("FOUND::: 10046696ED")
            // }
        }
        console.log('PayStack gotten:::', payStackPayments);
        // console.log('\nXXXXXXXXXXFOUND PAYMENTSXXXXXXXXXXXXX\n', payStackFind)
        this.PayStackPayments.next(payStackPayments);
        answer.next(payStackPayments);
        answer.complete();

      }
    });
    return answer;
   }

  // tslint:disable-next-line:typedef
   async getPayStackPayments2() {
    let payStackFind = '';
    const payStackPayments: PaystackAndPayments[] = [];
    this.https.get(`https://api.paystack.co/transaction/`, this.httpOptions)// {params: params1})
    .subscribe((data: any) => {
      console.log('PAYSTACK DATA', data);
      if (data) {
        console.log('paystack data::', data);
        for (const r of data.data) {
          // payStackFind = r.reference === 'T228458299353568' ? r.reference: '';
          payStackPayments.push({
            reference: r.reference,
              jambNo: (r.metadata.custom_fields[0]).value.trim().toUpperCase(),
              detail: r.metadata.referrer,
              amount: (r.requested_amount / 100) - 300,
              tellerDate: r.paidAt
            } as unknown as PaystackAndPayments);
            // if ((r.metadata.custom_fields[0]).value.trim().toUpperCase() === '10046696ED') {
            //   console.log("FOUND::: 10046696ED")
            // }
        }
        console.log('PayStack gotten:::', payStackPayments);
        // console.log('\nXXXXXXXXXXFOUND PAYMENTSXXXXXXXXXXXXX\n', payStackFind)
        this.PayStackPayments.next(payStackPayments);

      }
    });
   }



// this.https.request(options, res => {
//   let data = ''
//   res.on('data', (chunk) => {
//     data += chunk
//   });
//   res.on('end', () => {
//     console.log(JSON.parse(data))
//   })
// }).on('error', error => {
//   console.error(error)
// });

}

