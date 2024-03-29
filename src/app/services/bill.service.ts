import { Injectable } from '@angular/core';
import { AsyncSubject, BehaviorSubject } from 'rxjs';
import { BillInfo, BillInfoData, StudentLedgerEntry } from '../interfaces/student';
import { KLoginService } from './klogin.service';
import { ScriptService } from './script.service';
// import pdfMake from 'pdfmake/build/pdfmake';
// import pdfFonts from 'pdfmake/build/vfs_fonts';
// pdfMake.vfs = pdfFonts.pdfMake.vfs;


@Injectable({
  providedIn: 'root'
})
export class BillService {
  BillBulk: BehaviorSubject<any[]> = new BehaviorSubject <any[]>([]);


  constructor(
    public angularS1: KLoginService,
  ) {
  }






  getBill(searchInfo: BillInfo): AsyncSubject<BillInfoData[]> {
    // debit, credit list

    const aList: BillInfoData[] = []
    let queryWhere = true;
    let queryWhere2 = true;
    //get credit
    // get debit


    // this.angularS1.doConnect();
    const answer: AsyncSubject<BillInfoData[]> = new AsyncSubject <BillInfoData[]>();

    // const myQualificationList : StudentLedgerEntry[] = [] ;
    const b = searchInfo.dateToLookAt ? new Date(searchInfo.dateToLookAt).toLocaleDateString('en-GB').split('/') : null;


    let query = `MATCH (s:Study)-[]-(n:Student)-[]-(p:Programme)-[:IN_FACULTY]->(f:Faculty)
    `
    query += searchInfo.faculty  ? `where f.dCode = '${searchInfo.faculty}' ` : '';
    const queryTemp1 = query;
    query += searchInfo.gender && queryWhere ? ` where n.gender = "${searchInfo.gender}" ` : '';
    query += searchInfo.gender && !queryWhere ? ` and n.gender = "${searchInfo.gender}" ` : '';
    queryWhere = this.checkQuery(query, queryTemp1);

    query += searchInfo.programme && queryWhere ? ` where n.programme = "${searchInfo.programme}" ` : '';
    query += searchInfo.programme && !queryWhere ? ` and n.programme = "${searchInfo.programme}" ` : '';
    queryWhere = this.checkQuery(query, queryTemp1);

    query += searchInfo.level && queryWhere ? ` where n.level = ${searchInfo.level} ` : '';
    query += searchInfo.level && !queryWhere ? ` and n.level = ${searchInfo.level} ` : '';
    queryWhere = this.checkQuery(query, queryTemp1);

    query += `with n,s
    MATCH (n)<-[:POSTINGS_FOR]-(l:StudentLedgerEntry)`



    const queryTemp2 = query;

    // query += searchInfo.amount && queryWhere ? `
    // with  (sum(toFloat(l.cr))- sum(toFloat(l.dr))) ${searchInfo.paidSign} -${searchInfo.amount} as outstanding , n, l,s
    // where outstanding = true ` : '';

    // queryWhere = this.checkQuery(query, queryTemp);



    query += searchInfo.studentNo && queryWhere2 ? ` where n.studentNo = "${searchInfo.studentNo}" ` : '';
    query += searchInfo.studentNo && !queryWhere2 ? ` and n.studentNo = "${searchInfo.studentNo}" ` : '';
    queryWhere2 = this.checkQuery(query, queryTemp2);

    query += searchInfo.status && queryWhere2 ? ` where s.status = "${searchInfo.status}" ` : '';
    query += searchInfo.status && !queryWhere2 ? ` and s.status = "${searchInfo.status}" ` : '';
    queryWhere2 = this.checkQuery(query, queryTemp2);

    query += searchInfo.dateToLookAt && queryWhere2 ? ` where l.datePosted > datetime({ year:${b![2]},
      month:${Number(b![1])}, day:${Number(b![0])}})

      ` : '';
    query += searchInfo.dateToLookAt && !queryWhere2 ? ` and l.datePosted > datetime({ year:${b![2]},
      month:${Number(b![1])}, day:${Number(b![0])}})
       ` : '';
    queryWhere2 = this.checkQuery(query, queryTemp2);



    query += `return l.datePosted as datePosted, n.studentNo as studentNo,
    s.status as status, n.lastName as lastName,
     n.firstName as firstName, n.middleName as middleName, l.balance as balance,
     l.cr as cr,
     l.dr as dr , n.programme as programme, n.level as level, l.details as details order by l.datePosted`;
    this.angularS1.queryDB(query, '1')
      .subscribe((data) => {
        if (data) {
          for (let i = 0; i < data.results.length; i++) {
            const r = data.results[i];

            aList.push(

              {
                datePosted: r[0],
                studentNo: r[1],
                status: r[2],
                lastName: r[3], firstName: r[4], middleName: r[5], balance: r[6], cr: r[7],
                dr: r[8], programme: r[9], level: r[10], details: r[11]
              } as unknown as BillInfoData);
          }
        }

        answer.next(aList);
        answer.complete();
      });


    return answer;

  }


  getBilledPeopleEmail(searchInfo: BillInfo): AsyncSubject<any[]> {

    const aList: any[] = [];
    let queryWhere = true;
    //get credit
    // get debit


    // this.angularS1.doConnect();
    const answer: AsyncSubject<any[]> = new AsyncSubject <any[]>();

    // const myQualificationList : StudentLedgerEntry[] = [] ;
    const b = searchInfo.dateToLookAt ? new Date(searchInfo.dateToLookAt).toLocaleDateString('en-GB').split('/') : null;

    let query = `MATCH (s:Study)-[]-(n:Student)-[]-(p:Programme)-[:IN_FACULTY]->(f:Faculty)
    `
    const queryTemp = query;

    // query += searchInfo.amount && queryWhere ? `
    // with  (sum(toFloat(l.cr))- sum(toFloat(l.dr))) ${searchInfo.paidSign} -${searchInfo.amount} as outstanding , n, l,s
    // where outstanding = true ` : '';

    // queryWhere = this.checkQuery(query, queryTemp);

    // const queryTemp = query;
    query += searchInfo.faculty  ? `where f.dCode = '${searchInfo.faculty}' ` : '';
    queryWhere = this.checkQuery(query, queryTemp);

    query += searchInfo.gender && queryWhere ? ` where n.gender = "${searchInfo.gender}" ` : '';
    query += searchInfo.gender && !queryWhere ? ` and n.gender = "${searchInfo.gender}" ` : '';
    queryWhere = this.checkQuery(query, queryTemp);

    query += searchInfo.programme && queryWhere ? ` where n.programme = "${searchInfo.programme}" ` : '';
    query += searchInfo.programme && !queryWhere ? ` and n.programme = "${searchInfo.programme}" ` : '';
    queryWhere = this.checkQuery(query, queryTemp);

    query += searchInfo.level && queryWhere ? ` where n.level = ${searchInfo.level} ` : '';
    query += searchInfo.level && !queryWhere ? ` and n.level = ${searchInfo.level} ` : '';
    queryWhere = this.checkQuery(query, queryTemp);

    query += searchInfo.studentNo && queryWhere ? ` where n.studentNo = "${searchInfo.studentNo}" ` : '';
    query += searchInfo.studentNo && !queryWhere ? ` and n.studentNo = "${searchInfo.studentNo}" ` : '';
    queryWhere = this.checkQuery(query, queryTemp);

    query += searchInfo.status && queryWhere ? ` where s.status = "${searchInfo.status}" ` : '';
    query += searchInfo.status && !queryWhere ? ` and s.status = "${searchInfo.status}" ` : '';
    queryWhere = this.checkQuery(query, queryTemp);

    query += `with n,s
    OPTIONAL MATCH (n)<-[:POSTINGS_FOR]-(l:StudentLedgerEntry)
    where l.datePosted >= datetime({ year:${b![2]},
      month:${Number(b![1])}, day:${Number(b![0])}})`;

    // query += searchInfo.dateToLookAt && queryWhere ? ` where l.datePosted <= datetime({ year:${b![2]},
    //   month:${Number(b![1])}, day:${Number(b![0])}})

    //   ` : '';
    // query += searchInfo.dateToLookAt && !queryWhere ? ` and l.datePosted <= datetime({ year:${b![2]},
    //   month:${Number(b![1])}, day:${Number(b![0])}})
    //    ` : '';

    // query += searchInfo.dateToLookAt && queryWhere ? ` where l.datePosted > datetime({ year:${b![2]},
    //   month:${Number(b![1])}, day:${Number(b![0])}})

    //   ` : '';
    // query += searchInfo.dateToLookAt && !queryWhere ? ` and l.datePosted > datetime({ year:${b![2]},
    //   month:${Number(b![1])}, day:${Number(b![0])}})
    //    ` : '';
    // queryWhere = this.checkQuery(query, queryTemp);

    query += ` with distinct(n) as nn
optional match (nn)-[:HAS_NEXTOFKIN]-(k) with nn , k
optional match (nn)-[:HAS_SPONSOR]->(sp) with nn,k,sp `;

    query += `return  nn.studentNo as studentNo, nn.lastName as lastName, nn.firstName as firstName,
    nn.programme as programme,
    collect(distinct(toLower(k.email))) as emailList, collect(distinct(toLower(sp.email))) as sponsorEmail`;
    console.log("QUERY FOR NOK", query);


    this.angularS1.queryDB(query, '1')
      .subscribe((data) => {
        if (data) {
          for (let i = 0; i < data.results.length; i++) {
            const r = data.results[i];

            aList.push({
                studentNo: r[0], lastName: r[1], firstName: r[2], programme: r[3],
                session: searchInfo.session, emailList: r[4], sponsorList: r[5]
              }

            );
          }
        }

        answer.next(aList);
        answer.complete();
      });


    return answer;

  }

  getBalanceBF(searchInfo: BillInfo): AsyncSubject<any[]> {
    // debit, credit list
    const aList: any[] = [];
    // get credit const
    // get debit
    const BillBF: AsyncSubject<any[]> = new AsyncSubject <any[]>();

    const b = searchInfo.dateToLookAt ? new Date(searchInfo.dateToLookAt).toLocaleDateString('en-GB').split('/') : null;

    // this.angularS1.doConnect();
    // const answer: BehaviorSubject<StudentLedgerEntry[]> = new BehaviorSubject <StudentLedgerEntry[]>([]);

    // const myQualificationList : StudentLedgerEntry[] = [] ;
    let queryWhere = true;
    let query = `MATCH (s:Study)-[]-(n:Student)-[]-(p:Programme)-[:IN_FACULTY]->(f:Faculty)
    `
    const queryTemp = query;
    query += searchInfo.faculty  ? `where f.dCode = '${searchInfo.faculty}' ` : '';
    queryWhere = this.checkQuery(query, queryTemp);

    query += searchInfo.gender && queryWhere ? ` where n.gender = "${searchInfo.gender}" ` : '';
    query += searchInfo.gender && !queryWhere ? ` and n.gender = "${searchInfo.gender}" ` : '';
    queryWhere = this.checkQuery(query, queryTemp);

    query += searchInfo.programme && queryWhere ? ` where n.programme = "${searchInfo.programme}" ` : '';
    query += searchInfo.programme && !queryWhere ? ` and n.programme = "${searchInfo.programme}" ` : '';
    queryWhere = this.checkQuery(query, queryTemp);

    query += searchInfo.studentNo && queryWhere ? ` where n.studentNo = "${searchInfo.studentNo}" ` : '';
    query += searchInfo.studentNo && !queryWhere ? ` and n.studentNo = "${searchInfo.studentNo}" ` : '';
    queryWhere = this.checkQuery(query, queryTemp);

    query += searchInfo.level && queryWhere ? ` where n.level = ${searchInfo.level} ` : '';
    query += searchInfo.level && !queryWhere ? ` and n.level = ${searchInfo.level} ` : '';
    queryWhere = this.checkQuery(query, queryTemp);

    query += searchInfo.status && queryWhere ? ` where s.status = "${searchInfo.status}" ` : '';
    query += searchInfo.status && !queryWhere ? ` and s.status = "${searchInfo.status}" ` : '';
    queryWhere = this.checkQuery(query, queryTemp);

    query += `with n
    OPTIONAL MATCH (n)<-[:POSTINGS_FOR]-(l:StudentLedgerEntry)
    where l.datePosted <= datetime({ year:${b![2]},
      month:${Number(b![1])}, day:${Number(b![0])}})`;




    query +=
      ` return toFloat(sum(toFloat(l.cr))- sum(toFloat(l.dr))) as balance, n.studentNo as studentNo,
    n.lastName as lastName, n.firstName as firstName, n.middleName as middleName, n.programme as programme`;
    console.log("QUERY FOR BF", query);





    this.angularS1.queryDB(query, '0')
    .subscribe((data) => {
      for (let i = 0; i < data.results.length; i++) {
        console.log("QUERY FOR BALANCE BF_NEW", (data.results[i]));
        aList.push(data.results[i]);

      }

  // });












      if (!aList || aList.length < 1) {
        console.log("IN IF BF")
        let queryWhere = true;

        query = `MATCH (s:Study)-[]-(n:Student)
                `;
        const queryTemp = query;

        query += searchInfo.gender && queryWhere ? ` where n.gender = "${searchInfo.gender}" ` : '';
        query += searchInfo.gender && !queryWhere ? ` and n.gender = "${searchInfo.gender}" ` : '';
        queryWhere = this.checkQuery(query, queryTemp);

        query += searchInfo.status && queryWhere ? ` where s.status = "${searchInfo.status}" ` : '';
        query += searchInfo.status && !queryWhere ? ` and s.status = "${searchInfo.status}" ` : '';
        queryWhere = this.checkQuery(query, queryTemp);

        query += searchInfo.programme && queryWhere ? ` where n.programme = "${searchInfo.programme}" ` : '';
        query += searchInfo.programme && !queryWhere ? ` and n.programme = "${searchInfo.programme}" ` : '';
        queryWhere = this.checkQuery(query, queryTemp);

        query += searchInfo.studentNo && queryWhere ? ` where n.studentNo = "${searchInfo.studentNo}" ` : '';
        query += searchInfo.studentNo && !queryWhere ? ` and n.studentNo = "${searchInfo.studentNo}" ` : '';
        queryWhere = this.checkQuery(query, queryTemp);



        query +=
          ` return 0.0 as balance, (n.studentNo) as studentNo,
          n.lastName as lastName, n.firstName as firstName, n.middleName as middleName`;
        // console.log("QUERY FOR BF2", query);






        this.angularS1.queryDB(query, '0')
          .subscribe((data2) => {
              for (let i = 0; i < data2.results.length; i++) {
              console.log("QUERY FOR BALANCE BF_NEW", (data2.results[i]));
              aList.push(data2.results[i]);
            }
              BillBF.next(aList);
              BillBF.complete();
          });

        }

        else {
          BillBF.next(aList);
          BillBF.complete();
        }
      });
      console.log("\n\nQUERY FOR BALANCE BF\n\n", aList);



    return BillBF;

  }

  checkQuery(aQuery: string, searchString: string): boolean {
    let answer = false;
    if (searchString === aQuery)
    {answer = true;
    }

    return answer;
  }
}
