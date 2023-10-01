import { Injectable } from '@angular/core';
import { ApprovedBank } from '../interfaces/user';
import { KLoginService } from './klogin.service';
import {AsyncSubject} from "rxjs";


@Injectable({
  providedIn: 'root'
})


export class BankService {



  constructor(public angularS1: KLoginService) { }

  getAllBanks(): AsyncSubject<string[]> {
    // this.angularS1.doConnect();
    const Answer: AsyncSubject<any[]> = new AsyncSubject<any[]>();

    let myBankList: any[] = [] ;
    // const query = 'MATCH (n:Bank) RETURN n.shortName';
    const query = 'MATCH (n:Bank) RETURN n order by n.longName ';

    this.angularS1.queryDB(query, '1')
    .subscribe((data) => {
      if (data) {
        myBankList = data.results;
        Answer.next(myBankList);
        Answer.complete();
      }
    }

    );
    console.log('bankAura::', myBankList);

    return Answer;
  }

  getAllBanks_old(): string[] {
    // this.angularS1.doConnect();
    let myBankList: any[] = [] ;
    // const query = 'MATCH (n:Bank) RETURN n.shortName';
    const query = 'MATCH (n:Bank) RETURN n order by n.longName ';

    this.angularS1.queryDB(query, '1')
      .subscribe((data) => {
          myBankList = data.results;
          // Answer.next(myBankList);
          // Answer.complete();
        }

      )
    console.log('bankAura::', myBankList);

    return myBankList;
  }

  getApprovedBanks(): ApprovedBank[] {
    // this.angularS1.doConnect();
    const myBankList: ApprovedBank[] = [] ;
    // const query = 'MATCH (n:Bank) RETURN n.shortName';
    const query = `MATCH (n:Bank)-[:BANK_DETAILS]->(d) where d.status = true RETURN
    n.longName as longName, n.color as color,
    d.accountNo as accountNo order by n.longName `;

    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     myBankList.push({
    //       longName: r[0],
    //       color: r[1],
    //       accountNo: r[2],
    //
    //     } as ApprovedBank);
    //     console.log(r[0]);
    //   }
    //   console.log("BANK LIST_Service::", myBankList);
    //
    //
    //   });

    this.angularS1.queryDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {

          myBankList.push({
            longName: data.results[i][0],
            color: data.results[i][1],
            accountNo: data.results[i][2]
          } as ApprovedBank);
        }
        console.log('BANK LIST_Service::', myBankList);

      });

    // this.angularS1.doDisConnect();
    return myBankList;
  }

  getLevel(): AsyncSubject<any[]> {
    // this.angularS1.doConnect();
    let myLevelList: any[] = [] ;
    const Answer: AsyncSubject<any[]> = new AsyncSubject<any[]>();

    const query = 'MATCH (n:Level) RETURN n';

    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     myLevelList.push(r[0]);
    //   }

    //   });
    // this.angularS1.doDisConnect();

    this.angularS1.queryDB(query, '1')
    .subscribe((data) => {
      myLevelList = data.results;
      Answer.next(myLevelList);
      Answer.complete();
    }

    )
    return Answer;
  }
}
