import { Injectable } from '@angular/core';
import { AsyncSubject } from 'rxjs';
import { ApprovedBank } from '../interfaces/user';
import { KLoginService } from './klogin.service';


@Injectable({
  providedIn: 'root'
})


export class BankService {



  constructor(public angularS1: KLoginService) { }

  getAllBanks(): AsyncSubject<any[]> {
    // this.angularS1.doConnect();
    const Answer: AsyncSubject<any[]> = new AsyncSubject<any[]>();
    let myBankList: any[] = [] ;
    const query = 'MATCH (n:Bank) RETURN n order by n.longName ';

    this.angularS1.queryDB(query,'1')
    .subscribe((data) => {
      myBankList = data.results
      Answer.next(myBankList);
      Answer.complete()
    }

    )
    console.log('bankAura::', myBankList)

    return Answer;
  }

  getApprovedBanks(): ApprovedBank[] {
    this.angularS1.doConnect();
    const myBankList: ApprovedBank[] = [] ;
    // const query = 'MATCH (n:Bank) RETURN n.shortName';
    const query = `MATCH (n:Bank)-[:BANK_DETAILS]->(d) where d.status = true RETURN
    n.longName as longName, n.color as color,
    d.accountNo as accountNo order by n.longName `;

    this.angularS1.angularS.run(query).then((res: any) => {
      for (const r of res) {
        myBankList.push({
          longName: r[0],
          color: r[1],
          accountNo: r[2],

        } as ApprovedBank);
        console.log(r[0]);
      }
      console.log("BANK LIST_Service::", myBankList);


      });
    // this.angularS1.doDisConnect();
    return myBankList;
  }

  getLevel(): AsyncSubject<any[]> {
    this.angularS1.doConnect();
    let myLevelList: any[] = [] ;
    const Answer: AsyncSubject<any[]> = new AsyncSubject<any[]>();

    const query = 'MATCH (n:Level) RETURN n';

    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     myLevelList.push(r[0]);
    //   }

    //   });
    // this.angularS1.doDisConnect();

    this.angularS1.queryDB(query,'1')
    .subscribe((data) => {
      myLevelList = data.results
      Answer.next(myLevelList);
      Answer.complete()
    }

    )
    return Answer;
  }
}
