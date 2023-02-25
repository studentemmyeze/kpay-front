import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PaystackAndPayments } from '../interfaces/student';

@Injectable({
  providedIn: 'root'
})
export class ReconcilationService {
  ReconcilationPaymentsList: BehaviorSubject<PaystackAndPayments[]> = new BehaviorSubject<PaystackAndPayments[]>([]);
  userArray: PaystackAndPayments[] = [];


  


//   sk_live_c52affc6949dae8d00d66a6fc5d62383855c1b4a
// pk_live_06897ab8a3f1a55edfb029f103dc840a27d5afac

  constructor(private https: HttpClient) {


    
   }

   loadReconcilationPayments(): void {

    // const factory = new ImporterFactory();
    // const importer = new Importer(workbook);

    this.https.get('/assets/RECONCILATION PAYMENTS.csv', {responseType: 'text'})
    .subscribe(
        data => {
            let csvToRowArray = data.split("\n");
            let aa = data;
            let aString: string = "";
            // this.userArray = [];
            // aString.
            console.log("RAW DATA:::", data);
            for (let index = 1; index < csvToRowArray.length - 1; index++) {
              let row = csvToRowArray[index].split(",");
              console.log('A ROW OF THE CSV', row);
              this.userArray.push(
                {
                  tellerDate: new Date(row[1]),
                  reference: row[2],
                  amount: parseFloat(row[3]),
                  detail: row[4],
                  jambNo: row[5].trim().toUpperCase(),
                  receiptNo: row[7],
                  transactionType: row[8]
                } as unknown as PaystackAndPayments
                
                );
            }
            this.ReconcilationPaymentsList.next(this.userArray);
            // this.applicationList.complete();
            console.log( this.userArray);
        },
        error => {
            console.log(error);
        }
    );

    
    
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

