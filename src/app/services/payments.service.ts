import { Injectable } from '@angular/core';
import { AsyncSubject, BehaviorSubject } from 'rxjs';
import { AdvPostingInfo, Concession, LedgerInfo, OutstandingInfo, OutstandingInfoData, PaystackAndPayments,  Student, StudentLedgerEntry, StudentLedgerEntryMax, StudentLedgerEntryMax2, StudentProduct } from '../interfaces/student';
import { KLoginService } from './klogin.service';
import {UtilityService} from "./utility.service";

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {
  Postings: BehaviorSubject<StudentLedgerEntry[]> = new BehaviorSubject <StudentLedgerEntry[]>([]);
  PostingsExtra: BehaviorSubject<any[]> = new BehaviorSubject <any[]>([]);
  PayStackPostings: BehaviorSubject<string[]> = new BehaviorSubject <string[]>([]);

  Balance: BehaviorSubject<number[]> = new BehaviorSubject <number[]>([]);
  BalanceBulk: BehaviorSubject<any[]> = new BehaviorSubject <any[]>([]);





  constructor(public angularS1: KLoginService, private utils: UtilityService
              ) {
    this.PostingsExtra.next([]);
    this.getPayStackPostingsID();
  }

  makePosting(studentNo: any, anEntry: StudentLedgerEntry): AsyncSubject<number> {
    // this.angularS1.doConnect();
    const responseQuali: AsyncSubject<number> = new AsyncSubject<number>();
    // const a = new Date(anEntry.datePosted).toLocaleDateString('en-GB').split('/');
    const b = anEntry.tellerDate ? new Date(anEntry.tellerDate).toLocaleDateString('en-GB').split('/') : null;
    const bb = anEntry.tellerDate ? new Date(anEntry.tellerDate).toLocaleTimeString('en-GB').split(':'): null;
    let aAnswer: string;


    // const myQualificationList : StudentProduct[] = [] ;         studentNo: "${aStudent.studentNo ? aStudent.studentNo: ''}",
    let query = "";
    if (anEntry.paymentMode === 'PayStack') {
      query = `
      MATCH(q:Student {studentNo: "${studentNo}"})
    MERGE (n:StudentLedgerEntry
      {tellerNo: "${anEntry.tellerNo}"})-[:POSTINGS_FOR]->(q)
      set n.semester= "${anEntry.semester ? anEntry.semester : ''}"
      set n.session = "${anEntry.session ? anEntry.session : ''}"
      set n.product= "${anEntry.product ? anEntry.product : ''}"
      set n.details= "${anEntry.details ? anEntry.details : ''}"
      set n.paymentMode = "${anEntry.paymentMode ? anEntry.paymentMode : ''}"
      set n.bank = "${anEntry.bank ? anEntry.bank : ''}"
      set n.receiptNo= "${anEntry.receiptNo ? anEntry.receiptNo : ''}"
      set n.depositor = "${anEntry.depositor ? anEntry.depositor : ''}"
      set n.datePosted = datetime({ timezone:'+01:00' })
      set n.staffIn = "${anEntry.staffIn ? anEntry.staffIn : ''}"
      set n.qty = ${anEntry?.qty || 1}
      set n.cr =  ${anEntry.cr}
      set n.balance =  ${anEntry.balance}
      set n.tellerDate = datetime({ year:${Number(b![2])},
        month:${Number(b![1])}, day:${Number(b![0])},

    hour:${Number(bb![0])},
    minute:${Number(bb![1])}, second:${Number(bb![2])},
        timezone:'+01:00' })

      `;
      console.log("IN THE PAYSTACK OPTION::", query)
    }
    else {
      query = `
    MATCH(q:Student {studentNo: "${studentNo}"})
    MERGE (n:StudentLedgerEntry
      {
        semester: "${anEntry.semester ? anEntry.semester : ''}",
        session: "${anEntry.session ? anEntry.session : ''}",
        product: "${anEntry.product ? anEntry.product : ''}",
        details: "${anEntry.details ? anEntry.details : ''}",
        paymentMode: "${anEntry.paymentMode ? anEntry.paymentMode : ''}",
        bank: "${anEntry.bank ? anEntry.bank : ''}",
        receiptNo: "${anEntry.receiptNo ? anEntry.receiptNo : ''}",
        tellerNo: "${anEntry.tellerNo ? anEntry.tellerNo : ''}",
        depositor: "${anEntry.depositor ? anEntry.depositor : ''}",
        datePosted: datetime({ timezone:'+01:00' }),
          staffIn: "${anEntry.staffIn ? anEntry.staffIn : ''}",
        qty: ${anEntry?.qty || 1}`;

      query += (anEntry.dr ? ` , dr: ${anEntry.dr} ` : '');
      query += (anEntry.cr ? ` , cr: ${anEntry.cr} ` : '');
      query += (anEntry.balance ? ` , balance: ${anEntry.balance} ` : '');
      query += (anEntry.tellerDate ? `, tellerDate: datetime({ year:${b![2]},
          month:${Number(b![1])}, day:${Number(b![0])},

      hour:${Number(bb![0])},
      minute:${Number(bb![1])}, second:${Number(bb![2])},
          timezone:'+01:00' })` : '');

      query += `})-[:POSTINGS_FOR]->(q) return 1`;
    }





    this.angularS1.writeDB(query, '0')
          .subscribe((data) => {
            for (let i = 0; i < data.results.length; i++) {
              aAnswer = data.results[i][0];
            }
            responseQuali.next(parseFloat(aAnswer));
            responseQuali.complete();

          });


    return responseQuali;
  }

  // tslint:disable-next-line:typedef
  async makePosting2(studentNo: any, anEntry: StudentLedgerEntry) {
    // this.angularS1.doConnect();
    let responseQuali: AsyncSubject<number> = new AsyncSubject<number>();
    // const a = new Date(anEntry.datePosted).toLocaleDateString('en-GB').split('/');
    const b = anEntry.tellerDate ? new Date(anEntry.tellerDate).toLocaleDateString('en-GB').split('/') : null;
    const bb = anEntry.tellerDate ? new Date(anEntry.tellerDate).toLocaleTimeString('en-GB').split(':'): null;
    let aAnswer= 0;


    // const myQualificationList : StudentProduct[] = [] ;         studentNo: "${aStudent.studentNo ? aStudent.studentNo: ''}",
    let query = "";
    if (anEntry.paymentMode === 'PayStack') {
      query = `
      MATCH(q:Student {studentNo: "${studentNo}"})
    MERGE (n:StudentLedgerEntry
      {tellerNo: "${anEntry.tellerNo}"})
      with q, n
      MERGE (n)-[:POSTINGS_FOR]->(q)
      set n.semester= "${anEntry.semester ? anEntry.semester : ''}"
      set n.session = "${anEntry.session ? anEntry.session : ''}"
      set n.product= "${anEntry.product ? anEntry.product : ''}"
      set n.details= "${anEntry.details ? anEntry.details : ''}"
      set n.paymentMode = "${anEntry.paymentMode ? anEntry.paymentMode : ''}"
      set n.bank = "${anEntry.bank ? anEntry.bank : ''}"
      set n.receiptNo= "${anEntry.receiptNo ? anEntry.receiptNo : ''}"
      set n.depositor = "${anEntry.depositor ? anEntry.depositor : ''}"
      set n.datePosted = datetime({ timezone:'+01:00' })
      set n.staffIn = "${anEntry.staffIn ? anEntry.staffIn : ''}"
      set n.qty = ${anEntry?.qty || 1}
      set n.cr =  ${anEntry.cr}
      set n.balance =  ${anEntry.balance}
      set n.tellerDate = datetime({ year:${Number(b![2])},
        month:${Number(b![1])}, day:${Number(b![0])},

    hour:${Number(bb![0])},
    minute:${Number(bb![1])}, second:${Number(bb![2])},
        timezone:'+01:00' })

      `;
      // console.log("IN THE PAYSTACK OPTION::", query)
    }
    else {
      query = `
    MATCH(q:Student {studentNo: "${studentNo}"}) with q
    MERGE (n:StudentLedgerEntry
      {
        semester: "${anEntry.semester ? anEntry.semester : ''}",
        session: "${anEntry.session ? anEntry.session : ''}",
        product: "${anEntry.product ? anEntry.product : ''}",
        details: "${anEntry.details ? anEntry.details : ''}",
        paymentMode: "${anEntry.paymentMode ? anEntry.paymentMode : ''}",
        bank: "${anEntry.bank ? anEntry.bank : ''}",
        receiptNo: "${anEntry.receiptNo ? anEntry.receiptNo : ''}",
        tellerNo: "${anEntry.tellerNo ? anEntry.tellerNo : ''}",
        depositor: "${anEntry.depositor ? anEntry.depositor : ''}",
        datePosted: datetime({ timezone:'+01:00' }),
          staffIn: "${anEntry.staffIn ? anEntry.staffIn : ''}",
        qty: ${anEntry?.qty || 1}`;

      query += (anEntry.dr ? ` , dr: ${anEntry.dr} ` : '');
      query += (anEntry.cr ? ` , cr: ${anEntry.cr} ` : '');
      query += (anEntry.balance ? ` , balance: ${anEntry.balance} ` : '');
      query += (anEntry.tellerDate ? `, tellerDate: datetime({ year:${b![2]},
          month:${Number(b![1])}, day:${Number(b![0])},

      hour:${Number(bb![0])},
      minute:${Number(bb![1])}, second:${Number(bb![2])},
          timezone:'+01:00' })` : '');

      query += `}) with n, q MERGE (n)-[:POSTINGS_FOR]->(q) return 1`;
    }




    console.log("QUERY FOR POSTING", query);
    let tempAnswer = ""

    await this.angularS1.writeDB(query, '0')
          .subscribe((data) => {
            for (let i = 0; i < data.results.length; i++) {
              aAnswer = parseFloat(data.results[i][0]);
            }
            // responseQuali.next(parseFloat(aAnswer));
            // responseQuali.complete();

          });


    return aAnswer;
  }
  getProductList(): BehaviorSubject<StudentProduct[]> {
    // this.angularS1.doConnect();
    const answer: BehaviorSubject<StudentProduct[]> = new BehaviorSubject <StudentProduct[]>([]);

    const myQualificationList: StudentProduct[] = [] ;
    const query = `MATCH (n:StudentProduct)  return n order by n.prodCode`;

    this.angularS1.queryDB(query, '2')
      .subscribe((data) => {
        if (data) {
          for (let i = 0; i < data.results.length; i++) {
            myQualificationList.push(data.results[i] as StudentProduct);
          }
          answer.next(myQualificationList);

        }
      });



    return answer;
  }



  getPostings(studentNo: any): void {
    // this.angularS1.doConnect();
    // const answer: BehaviorSubject<StudentLedgerEntry[]> = new BehaviorSubject <StudentLedgerEntry[]>([]);

    const myQualificationList : StudentLedgerEntry[] = [] ;
    const query = `MATCH (n:Student {studentNo: "${studentNo}"})<-[:POSTINGS_FOR]-(l:StudentLedgerEntry)
      return l order by l.datePosted`;
    console.log("QUERY FOR PAYMENTS", query);
    this.angularS1.queryDB(query, '2')
      .subscribe((data) => {
        if (data) {
          for (let i = 0; i < data.results.length; i++) {
            console.log('data from posting::', data.results[i] );
            myQualificationList.push(data.results[i] as StudentLedgerEntry);
          }
          console.log('ledger entries found::', myQualificationList);
          this.Postings.next(myQualificationList);

        }
      });




    // return answer;
  }

  checkQuery(aQuery: string, searchString: string): boolean {
    let answer = false;
    if (searchString === aQuery) {
      answer = true;
    }

    return answer;
  }

  getPostingsInfo(searchInfo: LedgerInfo): AsyncSubject<StudentLedgerEntryMax[]> {
    // this.angularS1.doConnect();
    const answer: AsyncSubject<StudentLedgerEntryMax[]> = new AsyncSubject <StudentLedgerEntryMax[]>();

    const myQualificationList : any[] = [] ;
    const myQualificationList2 : any[] = [] ;

    const a = searchInfo.datePostedList && searchInfo.datePostedList.length > 0 ? new Date(searchInfo.datePostedList[0]).toLocaleDateString('en-GB').split('/') : null;
    const b = searchInfo.datePostedList && searchInfo.datePostedList.length > 0 ? new Date(searchInfo.datePostedList[1]).toLocaleDateString('en-GB').split('/') : null;

    const aa = searchInfo.tellerDateList && searchInfo.tellerDateList.length > 0 ? new Date(searchInfo.tellerDateList[0]).toLocaleDateString('en-GB').split('/') : null;
    const bb = searchInfo.tellerDateList && searchInfo.tellerDateList.length > 0 ? new Date(searchInfo.tellerDateList[1]).toLocaleDateString('en-GB').split('/') : null;

    let queryWhere = true;

    let query = `MATCH (s:Study)<-[:COMMENCED_STUDY]-(n:Student)<-[:POSTINGS_FOR]-(l:StudentLedgerEntry) `;
    const queryTemp = query;

    query += searchInfo.studentNo && queryWhere ? ` where n.studentNo = "${searchInfo.studentNo}" ` : '';
    query += searchInfo.studentNo && !queryWhere ? ` and n.studentNo = "${searchInfo.studentNo}" ` : '';
    queryWhere = this.checkQuery(query, queryTemp);

    query += searchInfo.level && queryWhere ? ` where n.level = ${searchInfo.level} ` : '';
    query += searchInfo.level && !queryWhere ? ` and n.level = ${searchInfo.level} ` : '';
    queryWhere = this.checkQuery(query, queryTemp);

    query += searchInfo.gender && queryWhere ? ` where n.gender = "${searchInfo.gender}" ` : '';
    query += searchInfo.gender && !queryWhere ? ` and n.gender = "${searchInfo.gender}" ` : '';
    queryWhere = this.checkQuery(query, queryTemp);

    query += searchInfo.studyStatus && queryWhere ? ` where s.status = "${searchInfo.studyStatus}" ` : '';
    query += searchInfo.studyStatus && !queryWhere ? ` and s.status = "${searchInfo.studyStatus}" ` : '';
    queryWhere = this.checkQuery(query, queryTemp);

    query += searchInfo.bank && queryWhere ? ` where l.bank = "${searchInfo.bank}" ` : '';
    query += searchInfo.bank && !queryWhere ? ` and l.bank = "${searchInfo.bank}" ` : '';
    queryWhere = this.checkQuery(query, queryTemp);


    query += searchInfo.session && queryWhere ? ` where l.session = "${searchInfo.session}" ` : '';
    query += searchInfo.session && !queryWhere ? ` and l.session = "${searchInfo.session}" ` : '';
    queryWhere = this.checkQuery(query, queryTemp);

    // tellerDate: datetime({ year:${b![2]},
    //   month:${Number(b![1])}, day:${Number(b![0])}})

    query += searchInfo.datePostedList && searchInfo.datePostedList.length && queryWhere ? ` where l.datePosted >= datetime({ year:${a![2]},
      month:${Number(a![1])}, day:${Number(a![0])}})
      and l.datePosted <= datetime({ year:${b![2]},
        month:${Number(b![1])}, day:${Number(b![0])}})
      ` : '';
    query += searchInfo.datePostedList && searchInfo.datePostedList.length > 0 && !queryWhere ? ` and l.datePosted >= datetime({ year:${a![2]},
      month:${Number(a![1])}, day:${Number(a![0])}})
      and l.datePosted <= datetime({ year:${b![2]},
        month:${Number(b![1])}, day:${Number(b![0])}}) ` : '';
    queryWhere = this.checkQuery(query, queryTemp);

    query += searchInfo.tellerDateList && searchInfo.tellerDateList.length > 0 && queryWhere ? ` where l.tellerDate >= datetime({ year:${aa![2]},
      month:${Number(aa![1])}, day:${Number(aa![0])}})
      and l.tellerDate <= datetime({ year:${bb![2]},
        month:${Number(bb![1])}, day:${Number(bb![0])}})
      ` : '';
    query += searchInfo.tellerDateList && searchInfo.tellerDateList.length > 0 && !queryWhere ? ` and l.tellerDate >= datetime({ year:${aa![2]},
      month:${Number(aa![1])}, day:${Number(aa![0])}})
      and l.tellerDate <= datetime({ year:${bb![2]},
        month:${Number(bb![1])}, day:${Number(bb![0])}}) ` : '';
    queryWhere = this.checkQuery(query, queryTemp);


    query += searchInfo.transacType === '2' && queryWhere ? ` where l.cr is not null ` : '';
    query += searchInfo.transacType === '2' && !queryWhere ? ` and l.cr is not null ` : '';
    queryWhere = this.checkQuery(query, queryTemp);

    query += searchInfo.transacType === '1' && queryWhere ? ` where l.dr is not null` : '';
    query += searchInfo.transacType === '1' && !queryWhere ? ` and l.dr is not null` : '';
    queryWhere = this.checkQuery(query, queryTemp);

    if (searchInfo.amount){
      if (queryWhere) {query += ' where '}
      else { query += " and ";}

      if ( searchInfo.transacType === '1') {

        query += searchInfo.paidSign=== '>'  ? ` l.dr > ${searchInfo.amount} ` : '';
        query += searchInfo.paidSign=== '<'  ? ` l.dr < ${searchInfo.amount} ` : '';
        query += searchInfo.paidSign=== '='  ? ` l.dr = ${searchInfo.amount} ` : '';

      } //debit

      else if (searchInfo.transacType === '2') {
        query += searchInfo.paidSign=== '>'  ? `l.cr > ${searchInfo.amount}` : '';
        query += searchInfo.paidSign=== '<'  ? `l.cr < ${searchInfo.amount}` : '';
        query += searchInfo.paidSign=== '='  ? `l.cr = ${searchInfo.amount}` : '';
      } //credit

      else {
        query += searchInfo.paidSign === '>'  ? `l.dr > ${searchInfo.amount} or l.cr > ${searchInfo.amount}` : '';
        query += searchInfo.paidSign=== '<'  ? `l.dr < ${searchInfo.amount} or l.cr < ${searchInfo.amount}` : '';
        query += searchInfo.paidSign=== '='  ? `l.dr = ${searchInfo.amount} or l.cr = ${searchInfo.amount}` : '';

      }


    }
    queryWhere = this.checkQuery(query, queryTemp);



    query += searchInfo.semester  && queryWhere ? ` where l.semester = '${searchInfo.semester}' ` : '';
    query += searchInfo.semester  && !queryWhere ? ` and l.semester = '${searchInfo.semester}' ` : '';
    queryWhere = this.checkQuery(query, queryTemp);



    query += searchInfo.paymentMode && queryWhere ? ` where l.paymentMode = "${searchInfo.paymentMode}" ` : '';
    query += searchInfo.paymentMode && !queryWhere ? ` and l.paymentMode = "${searchInfo.paymentMode}" ` : '';
    queryWhere = this.checkQuery(query, queryTemp);

    query += searchInfo.receiptNo && queryWhere ? ` where l.receiptNo = "${searchInfo.receiptNo}" ` : '';
    query += searchInfo.receiptNo && !queryWhere ? ` and l.receiptNo = "${searchInfo.receiptNo}" ` : '';
    queryWhere = this.checkQuery(query, queryTemp);

    query += searchInfo.product && queryWhere ? ` where l.product = "${searchInfo.product}" ` : '';
    query += searchInfo.product && !queryWhere ? ` and l.product = "${searchInfo.product}" ` : '';
    queryWhere = this.checkQuery(query, queryTemp);

    query += searchInfo.staffIn && queryWhere ? ` where l.staffIn = "${searchInfo.staffIn}" ` : '';
    query += searchInfo.staffIn && !queryWhere ? ` and l.staffIn = "${searchInfo.staffIn}" ` : '';
    queryWhere = this.checkQuery(query, queryTemp);




    query += ` return l, n order by l.datePosted`;
    console.log("QUERY FOR PAYMENTS INFO", query);
    this.angularS1.queryDB(query, '2')
      .subscribe((data) => {
        if (data) {
          console.log('payments::', data.results);
          for (let i = 0; i < data.results.length; i++) {
            // myQualificationList.push(data.results[i] as StudentLedgerEntry);
            myQualificationList.push(
              {
                  datePosted: new Date(this.utils.getStringDate(data.results[i][0].datePosted)),
                  session: data.results[i][0].session,
                  semester: data.results[i][0].semester,
                  product: data.results[i][0].product,
                  qty: data.results[i][0].qty,

                  dr: data.results[i][0].dr,
                  cr: data.results[i][0].cr,
                  balance: data.results[i][0].balance,
                  details: data.results[i][0].details,

                  paymentMode: data.results[i][0].paymentMode,
                  bank: data.results[i][0].bank,
                  tellerDate: data.results[i][0].tellerDate ? new Date(this.utils.getStringDate(data.results[i][0].tellerDate)) : null,
                  tellerNo: data.results[i][0].tellerNo,
                  receiptNo: data.results[i][0].receiptNo,
                  depositor: data.results[i][0].depositor,
                  staffIn: data.results[i][0].staffIn,
                  studentNo: data.results[i][1].studentNo,
              firstName: data.results[i][1].firstName,
              middleName: data.results[i][1].middleName,
              lastName: data.results[i][1].lastName,
              gender: data.results[i][1].gender,
              level: data.results[i][1].level,

              activeStatus: data.results[i][1].activeStatus,
              studentType: data.results[i][1].studentType,
              programme: data.results[i][1].programme
            } as StudentLedgerEntryMax

              );
          }
          this.PostingsExtra.next(myQualificationList);
          answer.next(myQualificationList);
          answer.complete();

        }
      });
      // console.log("QUERY FOR R", myQualificationList2);

    return answer;
    }

  // to speed up new payments detections
  getPayStackPostingsID(): void {
      // debit, credit list
      const aList: any[] = [];
      // get credit
      // get debit


      // this.angularS1.doConnect();
      // const answer: AsyncSubject<string[]> = new AsyncSubject <string[]>();

      // const myQualificationList : StudentLedgerEntry[] = [] ;
      const query = `MATCH (n:StudentLedgerEntry)
      where n.paymentMode = "PayStack" RETURN distinct(n.tellerNo)`;
      // console.log("QUERY FOR PAYMENTS", query);
      // this.angularS1.angularS.run(query).then((res: any) => {
      //   for (const r of res) {
      //     aList.push(r[0]);
      //     // console.log('PaystackPayment', r);

      //   }
      //   // console.log("QUERY FOR PAystack payments already done", aList);

      //   this.PayStackPostings.next(aList);
      //   // answer.complete();

      //   });


      this.angularS1.queryDB(query, '0')
          .subscribe((data) => {
            for (let i = 0; i < data.results.length; i++) {
              // console.log('AURA_get next session resumption date::', data.results[i][0] , isDate(data.results[i][0]))
              aList.push(data.results[i][0]);
            }
            this.PayStackPostings.next(aList);
          });

      // return answer;

    }

  async getPayStackPostingsID2() {
      // debit, credit list
      const aList: any[] = [];

      // this.angularS1.doConnect();

      const query = `MATCH (n:StudentLedgerEntry)
      where n.paymentMode = "PayStack" RETURN distinct(n.tellerNo)`;
      // await this.angularS1.angularS.run(query).then((res: any) => {
      //   for (const r of res) {
      //     aList.push(r[0]);
      //
      //   }
      //
      //
      //   });


      await this.angularS1.queryDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          aList.push(data.results[i][0]);
        }

      });

      return aList;

    }


  getPostingsInfo_WithIndex(searchInfo: LedgerInfo): AsyncSubject<StudentLedgerEntryMax2[]> {
     // this.angularS1.doConnect();
      const answer: AsyncSubject<StudentLedgerEntryMax2[]> = new AsyncSubject <StudentLedgerEntryMax2[]>();

      const myQualificationList: any[] = [] ;
      const myQualificationList2: any[] = [] ;

      const a = searchInfo.datePostedList ? new Date(searchInfo.datePostedList[0]).toLocaleDateString('en-GB').split('/') : null;
      const b = searchInfo.datePostedList ? new Date(searchInfo.datePostedList[1]).toLocaleDateString('en-GB').split('/') : null;
      let queryWhere = true;

      let query = `MATCH (n:Student)<-[:POSTINGS_FOR]-(l:StudentLedgerEntry) `;
      const queryTemp = query;

      query += searchInfo.studentNo && queryWhere ? ` where n.studentNo = "${searchInfo.studentNo}" ` : '';
      query += searchInfo.studentNo && !queryWhere ? ` and n.studentNo = "${searchInfo.studentNo}" ` : '';
      queryWhere = this.checkQuery(query, queryTemp);

      query += searchInfo.level && queryWhere ? ` where n.level = ${searchInfo.level} ` : '';
      query += searchInfo.level && !queryWhere ? ` and n.level = ${searchInfo.level} ` : '';
      queryWhere = this.checkQuery(query, queryTemp);

      query += searchInfo.gender && queryWhere ? ` where n.gender = "${searchInfo.gender}" ` : '';
      query += searchInfo.gender && !queryWhere ? ` and n.gender = "${searchInfo.gender}" ` : '';
      queryWhere = this.checkQuery(query, queryTemp);

      query += searchInfo.bank && queryWhere ? ` where l.bank = "${searchInfo.bank}" ` : '';
      query += searchInfo.bank && !queryWhere ? ` and l.bank = "${searchInfo.bank}" ` : '';
      queryWhere = this.checkQuery(query, queryTemp);


      query += searchInfo.session && queryWhere ? ` where l.session = "${searchInfo.session}" ` : '';
      query += searchInfo.session && !queryWhere ? ` and l.session = "${searchInfo.session}" ` : '';
      queryWhere = this.checkQuery(query, queryTemp);

      // tellerDate: datetime({ year:${b![2]},
      //   month:${Number(b![1])}, day:${Number(b![0])}})

      query += searchInfo.datePostedList && queryWhere ? ` where l.datePosted >= datetime({ year:${a![2]},
        month:${Number(a![1])}, day:${Number(a![0])}})
        and l.datePosted <= datetime({ year:${b![2]},
          month:${Number(b![1])}, day:${Number(b![0])}})
        ` : '';
      query += searchInfo.datePostedList && !queryWhere ? ` and l.datePosted >= datetime({ year:${a![2]},
        month:${Number(a![1])}, day:${Number(a![0])}})
        and l.datePosted <= datetime({ year:${b![2]},
          month:${Number(b![1])}, day:${Number(b![0])}}) ` : '';
      queryWhere = this.checkQuery(query, queryTemp);

      query += searchInfo.transacType === '2' && queryWhere ? ` where l.cr is not null ` : '';
      query += searchInfo.transacType === '2' && !queryWhere ? ` and l.cr is not null ` : '';
      queryWhere = this.checkQuery(query, queryTemp);

      query += searchInfo.transacType === '1' && queryWhere ? ` where l.dr is not null` : '';
      query += searchInfo.transacType === '1' && !queryWhere ? ` and l.dr is not null` : '';
      queryWhere = this.checkQuery(query, queryTemp);

      if (searchInfo.amount){
        if (queryWhere) {query += ' where '; }
          else { query += ' and '; }

        if ( searchInfo.transacType === '1') {

          query += searchInfo.paidSign === '>'  ? ` l.dr > ${searchInfo.amount} ` : '';
          query += searchInfo.paidSign === '<'  ? ` l.dr < ${searchInfo.amount} ` : '';
          query += searchInfo.paidSign === '='  ? ` l.dr = ${searchInfo.amount} ` : '';

        } // debit

        else if (searchInfo.transacType === '2') {
          query += searchInfo.paidSign === '>'  ? `l.cr > ${searchInfo.amount}` : '';
          query += searchInfo.paidSign === '<'  ? `l.cr < ${searchInfo.amount}` : '';
          query += searchInfo.paidSign === '='  ? `l.cr = ${searchInfo.amount}` : '';
        } // credit

        else {
          query += searchInfo.paidSign === '>'  ? `l.dr > ${searchInfo.amount} or l.cr > ${searchInfo.amount}` : '';
          query += searchInfo.paidSign === '<'  ? `l.dr < ${searchInfo.amount} or l.cr < ${searchInfo.amount}` : '';
          query += searchInfo.paidSign === '='  ? `l.dr = ${searchInfo.amount} or l.cr = ${searchInfo.amount}` : '';

        }


      }
      queryWhere = this.checkQuery(query, queryTemp);



      query += searchInfo.semester  && queryWhere ? ` where l.semester = ${searchInfo.semester} ` : '';
      query += searchInfo.semester  && !queryWhere ? ` and l.semester = ${searchInfo.semester} ` : '';
      queryWhere = this.checkQuery(query, queryTemp);



      query += searchInfo.paymentMode && queryWhere ? ` where l.paymentMode = "${searchInfo.paymentMode}" ` : '';
      query += searchInfo.paymentMode && !queryWhere ? ` and l.paymentMode = "${searchInfo.paymentMode}" ` : '';
      queryWhere = this.checkQuery(query, queryTemp);

      query += searchInfo.receiptNo && queryWhere ? ` where l.receiptNo = "${searchInfo.receiptNo}" ` : '';
      query += searchInfo.receiptNo && !queryWhere ? ` and l.receiptNo = "${searchInfo.receiptNo}" ` : '';
      queryWhere = this.checkQuery(query, queryTemp);

      query += searchInfo.product && queryWhere ? ` where l.product = "${searchInfo.product}" ` : '';
      query += searchInfo.product && !queryWhere ? ` and l.product = "${searchInfo.product}" ` : '';
      queryWhere = this.checkQuery(query, queryTemp);



      query += ` return l, n, id(l) order by l.datePosted`;
      console.log('QUERY FOR PAYMENTS', query);
      // this.angularS1.angularS.run(query).then((res: any) => {
      //   for (const r of res) {
      //
      //     // myQualificationList.push(
      //     //   {
      //     //     ledger: r[0].properties as StudentLedgerEntry,
      //     //     student: r[1].properties as Student }
      //
      //     //   );
      //       myQualificationList.push(
      //         {
      //           // ledger: r[0].properties as StudentLedgerEntry,
      //           // export interface StudentLedgerEntryMax {
      //             datePosted:  r[0].properties.datePosted,
      //             session: r[0].properties.session,
      //             semester: r[0].properties.semester,
      //             product: r[0].properties.product,
      //             qty: r[0].properties.qty,
      //
      //             dr: r[0].properties.dr,
      //             cr: r[0].properties.cr,
      //             balance: r[0].properties.balance,
      //             details: r[0].properties.details,
      //
      //             paymentMode: r[0].properties.paymentMode,
      //             bank: r[0].properties.bank,
      //             tellerDate: r[0].properties.tellerDate,
      //             tellerNo: r[0].properties.tellerNo,
      //             receiptNo: r[0].properties.receiptNo,
      //             depositor: r[0].properties.depositor,
      //             staffIn: r[0].properties.staffIn,
      //             studentNo: r[1].properties.studentNo,
      //         firstName: r[1].properties.firstName,
      //         middleName: r[1].properties.middleName,
      //         lastName: r[1].properties.lastName,
      //         gender: r[1].properties.gender,
      //         level: r[1].properties.level,
      //
      //         activeStatus: r[0].properties.activeStatus,
      //         studentType: r[0].properties.studentType,
      //         department: r[0].properties.department,
      //         id: r[2]
      //       } as StudentLedgerEntryMax2
      //
      //         );
      //
      //
      //
      //
      //
      //
      //
      //   }
      //   answer.next(myQualificationList);
      //   answer.complete();
      //
      //   });

      this.angularS1.queryDB(query, '2')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          // aList.push(data.results[i][0]);
          myQualificationList.push(
            {
              // ledger: r[0].properties as StudentLedgerEntry,
              // export interface StudentLedgerEntryMax {
              datePosted: data.results[i][0].datePosted,
              session: data.results[i][0].session,
              semester: data.results[i][0].semester,
              product: data.results[i][0].product,
              qty: data.results[i][0].qty,

              dr: data.results[i][0].dr,
              cr: data.results[i][0].cr,
              balance: data.results[i][0].balance,
              details: data.results[i][0].details,

              paymentMode: data.results[i][0].paymentMode,
              bank: data.results[i][0].bank,
              tellerDate: data.results[i][0].tellerDate,
              tellerNo: data.results[i][0].tellerNo,
              receiptNo: data.results[i][0].receiptNo,
              depositor: data.results[i][0].depositor,
              staffIn: data.results[i][0].staffIn,
              studentNo: data.results[i][1].studentNo,
              firstName: data.results[i][1].firstName,
              middleName: data.results[i][1].middleName,
              lastName: data.results[i][1].lastName,
              gender: data.results[i][1].gender,
              level: data.results[i][1].level,

              activeStatus: data.results[i][0].activeStatus,
              studentType: data.results[i][0].studentType,
              programme: data.results[i][0].programme,
              id: data.results[i][2]
            } as unknown as StudentLedgerEntryMax2

          );
        }
        answer.next(myQualificationList);
        answer.complete();
      });
      return answer;
      }

  reOrderPostings(idNo: number, aDate: Date, aBalance: number, detail: string): boolean {
    // this.angularS1.doConnect();
    let answer = false;
    const a = aDate ? new Date(aDate).toLocaleDateString('en-GB').split('/') : null;
    const bb = aDate ? new Date(aDate).toLocaleTimeString('en-GB').split(':') : null;

    const myQualificationList: StudentProduct[] = [] ;
    const query = `MATCH (l:StudentLedgerEntry) where id(l)= ${idNo} set

    l.datePosted = datetime({ year:${a![2]},
      month:${Number(a![1])}, day:${Number(a![0])},

      hour:${Number(bb![0])},
      minute:${Number(bb![1])}, second:${Number(bb![2])},
      timezone:'+01:00'
    })

    set
    l.balance = ${aBalance}
    set
    l.details = '${detail}'
    RETURN true`;

    // console.log('the query at reorder::', query)
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     answer = r[0];
    //   }
    //   // answer.next(myQualificationList);
    //
    //   });

    this.angularS1.queryDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          answer = (data.results[i][0]);
        }
      });

    return answer;
  }

  getBalance(studentNo: any): void {
    // debit, credit list
    const aList: number[] = [];
    // get credit
    // get debit

    // this.angularS1.doConnect();
    // const answer: BehaviorSubject<StudentLedgerEntry[]> = new BehaviorSubject <StudentLedgerEntry[]>([]);

    const myQualificationList: StudentLedgerEntry[] = [] ;
    const query = `MATCH (n:Student {studentNo: "${studentNo}"})<-[:POSTINGS_FOR]-(l:StudentLedgerEntry)
    return toFloat(sum(toFloat(l.cr))- sum(toFloat(l.dr)))`;
    console.log('QUERY FOR PAYMENTS', query);
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     aList.push(r[0]);
    //   }
    //   this.Balance.next(aList);

    //   });

    this.angularS1.queryDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          // console.log('AURA_get next session resumption date::', data.results[i][0] , isDate(data.results[i][0]))
          aList.push(data.results[i][0]);
        }
        this.Balance.next(aList);
      });


    // return (aList[1] - aList[0])

  }
  getBalance_auto(studentNo: any): AsyncSubject<number> {
    // debit, credit list
    const aList: number[] = [];
    // get credit
    // get debit

    // this.angularS1.doConnect();
    const answer: AsyncSubject<number> = new AsyncSubject <number>();

    const myQualificationList: StudentLedgerEntry[] = [] ;
    const query = `MATCH (n:Student {studentNo: "${studentNo}"})<-[:POSTINGS_FOR]-(l:StudentLedgerEntry)
    return sum(toFloat(l.cr))- sum(toFloat(l.dr))`;
    console.log('QUERY FOR PAYMENTS', query);
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     aList.push(r[0]);
    //   }
    //   console.log("the balance:::",aList[0]);
    //   answer.next(aList[0]);
    //   answer.complete();
    //   });

    this.angularS1.queryDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          // console.log('AURA_get next session resumption date::', data.results[i][0] , isDate(data.results[i][0]))
          aList.push(data.results[i][0]);
        }
        console.log('the balance:::', aList[0]);
        answer.next(aList[0]);
        answer.complete();
      });

    return answer;

  }

  async getBalance_auto2(studentNo: any) {
    // debit, credit list
    const aList: number[] = [];
    // get credit
    // get debit

    // this.angularS1.doConnect();
    // const answer: AsyncSubject<number> = new AsyncSubject <number>();

    const myQualificationList: StudentLedgerEntry[] = [] ;
    const query = `MATCH (n:Student {studentNo: "${studentNo}"})<-[:POSTINGS_FOR]-(l:StudentLedgerEntry)
    return sum(toFloat(l.cr))- sum(toFloat(l.dr))`;
    console.log('QUERY FOR PAYMENTS', query);
    // await this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     aList.push(r[0]);
    //   }
    //   console.log("the balance:::",aList[0]);
    //   //answer.next(aList[0]);
    //   //answer.complete();
    //   });

    await this.angularS1.queryDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          // console.log('AURA_get next session resumption date::', data.results[i][0] , isDate(data.results[i][0]))
          aList.push(data.results[i][0]);
        }
        console.log('the balance:::', aList[0]);

      });

    return aList[0];

  }

  getBalanceAdvanced(postingInfo: AdvPostingInfo): AsyncSubject<any[]> {
    // debit, credit list
    const answer: AsyncSubject<any[]> = new AsyncSubject <any[]>();
    const aList: any[] = [];
    // get credit
    // get debit


    // this.angularS1.doConnect();
    // const answer: BehaviorSubject<StudentLedgerEntry[]> = new BehaviorSubject <StudentLedgerEntry[]>([]);

    // const myQualificationList : StudentLedgerEntry[] = [] ;
    let query = `MATCH (f:Faculty)<-[:IN_FACULTY]-(p:Programme)<-[:A_STUDENT_OF]-(n:Student)<-[:POSTINGS_FOR]-(l:StudentLedgerEntry)
     where (n)-[:COMMENCED_STUDY]->(:Study{status:"Ongoing"})
    `;
    query += postingInfo.level ?  ` and (n)-[:IN_LEVEL]->(:Level{lCode:${postingInfo.level}})` : '';
    query += postingInfo.faculty ? ` and f.dCode = '${postingInfo.faculty}' ` : '';
    query += postingInfo.programme ? ` and p.dName = '${postingInfo.programme}' ` : '';


    query += ` return (sum(toFloat(l.cr))- sum(toFloat(l.dr))) as balance, n.studentNo as studentNo order by n.studentNo`;
    console.log('QUERY FOR get balance adv', query);
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     aList.push(r);
    //     // console.log("QUERY FOR BALANCE", r);

    //   }
    //   // console.log("the balance:::",aList[0]);
    //   answer.next(aList);
    //   answer.complete();
    //   // this.BalanceBulk.next(aList);

    //   });

    this.angularS1.queryDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          // console.log('AURA_get next session resumption date::', data.results[i][0] , isDate(data.results[i][0]))
          aList.push(data.results[i]);
        }
        console.log('the balance adv:::', aList[0]);
        answer.next(aList);
        answer.complete();
      });

    return answer;

  }
  getBalanceBulk(): void {
    // debit, credit list
    const aList: any[] = [];
    // get credit
    // get debit


    // this.angularS1.doConnect();
    // const answer: BehaviorSubject<StudentLedgerEntry[]> = new BehaviorSubject <StudentLedgerEntry[]>([]);

    // const myQualificationList : StudentLedgerEntry[] = [] ;
    const query = `MATCH (n:Student)<-[:POSTINGS_FOR]-(l:StudentLedgerEntry)
    return (sum(toFloat(l.cr))- sum(toFloat(l.dr))) as balance, n.studentNo as studentNo`;
    console.log('QUERY FOR PAYMENTS', query);
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     aList.push(r);
    //     console.log("QUERY FOR BALANCE", r);
    //
    //   }
    //   // this.BalanceBulk.next(aList);
    //
    //   });



    // return (aList[1] - aList[0])

  }



  getBalanceBulkClearance(searchInfo: OutstandingInfo): void {
    // debit, credit list
    const aList: any[] = [];
    let queryWhere = true;
    // get credit
    // get debit


    // this.angularS1.doConnect();
    // const answer: BehaviorSubject<StudentLedgerEntry[]> = new BehaviorSubject <StudentLedgerEntry[]>([]);

    // const myQualificationList : StudentLedgerEntry[] = [] ;
    const b = searchInfo.dateToLookAt ? new Date(searchInfo.dateToLookAt).toLocaleDateString('en-GB').split('/') : null;

    let query = `MATCH (n:Student)-[]-(d:Programme)-[]-(f:Faculty) with n,d,f
    MATCH(s:Study)-[]-(n)<-[:POSTINGS_FOR]-(l:StudentLedgerEntry)`;
    const queryTemp = query;

    // query += searchInfo.amount && queryWhere ? `
    // with  (sum(toFloat(l.cr))- sum(toFloat(l.dr))) ${searchInfo.paidSign} -${searchInfo.amount} as outstanding , n, l,s
    // where outstanding = true ` : '';

    // queryWhere = this.checkQuery(query, queryTemp);

    query += searchInfo.gender && queryWhere ? ` where n.gender = "${searchInfo.gender}" ` : '';
    query += searchInfo.gender && !queryWhere ? ` and n.gender = "${searchInfo.gender}" ` : '';
    queryWhere = this.checkQuery(query, queryTemp);

    query += searchInfo.programme && queryWhere ? ` where n.programme = "${searchInfo.programme}" ` : '';
    query += searchInfo.programme && !queryWhere ? ` and n.programme = "${searchInfo.programme}" ` : '';
    queryWhere = this.checkQuery(query, queryTemp);

    query += searchInfo.faculty && queryWhere ? ` where f.dCode = "${searchInfo.faculty}" ` : '';
    query += searchInfo.faculty && !queryWhere ? ` and f.dCode = "${searchInfo.faculty}" ` : '';
    queryWhere = this.checkQuery(query, queryTemp);

    query += searchInfo.status && queryWhere ? ` where s.status = "${searchInfo.status}" ` : '';
    query += searchInfo.status && !queryWhere ? ` and s.status = "${searchInfo.status}" ` : '';
    queryWhere = this.checkQuery(query, queryTemp);

    query += searchInfo.level && queryWhere ? ` where n.level = ${searchInfo.level} ` : '';
    query += searchInfo.level && !queryWhere ? ` and n.level = ${searchInfo.level} ` : '';
    queryWhere = this.checkQuery(query, queryTemp);

    query += searchInfo.dateToLookAt && queryWhere ? ` where l.datePosted <= datetime({ year:${b![2]},
      month:${Number(b![1])}, day:${Number(b![0])}})

      ` : '';
    query += searchInfo.dateToLookAt && !queryWhere ? ` and l.datePosted <= datetime({ year:${b![2]},
      month:${Number(b![1])}, day:${Number(b![0])}})
       ` : '';
    queryWhere = this.checkQuery(query, queryTemp);



    query += `return n.studentNo as studentNo,s.status as status, n.lastName as lastName,
     n.firstName as firstName, n.middleName as middleName, n.gender as gender, (sum(toFloat(l.cr))- sum(toFloat(l.dr))) as balance,
    n.programme as programme, n.level as level order by balance`;
    console.log('QUERY FOR PAYMENTS', query);
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     aList.push(
    //
    //       {
    //         studentNo: r[0],
    //         status: r[1],
    //         lastName: r[2], firstName:r[3], middleName: r[4], gender: r[5], balance: r[6],
    //         department: r[7], level: r[8]
    //       } as OutstandingInfoData);
    //     console.log("QUERY FOR BALANCE", r);
    //
    //   }
    //   this.BalanceBulk.next(aList);
    //
    //
    //   });


    this.angularS1.queryDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          aList.push(
            {
              studentNo: data.results[i][0],
              status: data.results[i][1],
              lastName: data.results[i][2], firstName: data.results[i][3], middleName: data.results[i][4],
              gender: data.results[i][5], balance: data.results[i][6],
              programme: data.results[i][7], level: data.results[i][8]
            } as OutstandingInfoData);
          console.log('QUERY FOR BALANCE', data.results[i]);
        }
        this.BalanceBulk.next(aList);
      });

    // return (aList[1] - aList[0])

  }

  checkLedgerEntry(aPayStackEntry: PaystackAndPayments): AsyncSubject<boolean> {
    let answer = false;
    const answerSubject: AsyncSubject<boolean> = new AsyncSubject <boolean>();

    const query = `MATCH (n:StudentLedgerEntry{tellerNo: "${aPayStackEntry.reference}"})  return count(n)`;
    console.log('Student ledger check::', query);
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     console.log("R[0]:::", parseInt(r[0]? r[0]: '0'));
    //     if ( parseInt(r[0]? r[0]: '0') === 0 ){ answer = false;}
    //     else {answer = true;}
    //     answerSubject.next(answer);
    //     // answer = r[0] && r[0] > 0 ? true : false;
    //   }
    //   answerSubject.complete();
    //
    //
    //   });


    this.angularS1.queryDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          console.log('R[0]:::', parseInt(data.results[i][0] ? data.results[i][0] : '0'));
          if ( parseInt(data.results[i][0] ? data.results[i][0] : '0') === 0 ){ answer = false; }
          else {answer = true; }
          answerSubject.next(answer);
        }
      });




    console.log('check ledger answer', answer);

    return answerSubject;
  }

  doLedgerEntry(aPayStackEntry: PaystackAndPayments): boolean {
    let answer = true;
    const query = `MATCH (n:StudentLedgerEntry{tellerNo: "${aPayStackEntry}""})  return count(n)`;
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     answer = r[0] ? true : false;
    //   }


    //   });

    this.angularS1.queryDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          // console.log('AURA_get next session resumption date::', data.results[i][0] , isDate(data.results[i][0]))
          answer = data.results[i][0] ? true : false;
        }
        // console.log("the balance:::",aList[0]);

      });

    return answer;
  }

  // doLedgerEntry(aPa)
  getConcessionList(): BehaviorSubject<Concession[]> {
    // this.angularS1.doConnect();
    const answer: BehaviorSubject<Concession[]> = new BehaviorSubject <Concession[]>([]);

    const myQualificationList: Concession[] = [] ;
    const query = `MATCH (n:Concession)  return n order by n.sCode`;
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     myQualificationList.push(r[0].properties as Concession);
    //   }
    //   answer.next(myQualificationList);

    //   });


    this.angularS1.queryDB(query, '2')
      .subscribe((data) => {
        if (data) {
          for (let i = 0; i < data.results.length; i++) {
            myQualificationList.push(data.results[i] as Concession);
          }
          answer.next(myQualificationList);

        }
      });

    return answer;
  }
}
