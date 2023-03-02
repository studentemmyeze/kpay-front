import { Injectable } from '@angular/core';
import { AsyncSubject } from 'rxjs';
import { KLoginService } from './klogin.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(public angularS1: KLoginService) {
    // angularS1.doConnect();
  }

  getAPILastDownload() : AsyncSubject<Date> {
    const answer: AsyncSubject<Date> = new AsyncSubject<Date>();

    let myDeptList: Date ;
    const query = `MATCH (n:Settings)  RETURN CASE n.apiLastDownload WHEN null THEN
    (datetime({timezone:'+01:00'}) - Duration({months: 1})) ELSE
    n.apiLastDownload END`;
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     myDeptList = (r[0]);
    //     console.log('API LAST:::', r[0], r, myDeptList);
    //   }
    //   answer.next(myDeptList);
    //   answer.complete();
    //
    //
    //   });

    this.angularS1.queryDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          // console.log('AURA_get next session resumption date::', data.results[i][0] , isDate(data.results[i][0]))
          myDeptList = (data.results[i][0]);
          console.log('API LAST:::', data.results[i][0], data.results[i], myDeptList);
        }
        // console.log('the balance adv:::', aList[0]);
        answer.next(myDeptList);
        answer.complete();
      });

    return answer;
  }

  setAPILastDownload(): AsyncSubject<boolean> {
    console.log("AT SET DATE LAST DOWNLOADED")
    const answer: AsyncSubject<boolean> = new AsyncSubject<boolean>();

    let myDeptList: boolean ;
    const query = `MERGE (n:Settings)  set n.apiLastDownload =   datetime({timezone:'+01:00'}) return true`;
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     myDeptList = (r[0]);
    //
    //   }
    //   answer.next(myDeptList);
    //   answer.complete();
    //
    //
    //   });

    this.angularS1.writeDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          // console.log('AURA_get next session resumption date::', data.results[i][0] , isDate(data.results[i][0]))
          myDeptList = (data.results[i][0]);
          console.log('SET API LAST:::', data.results[i][0], data.results[i], myDeptList);
        }
        // console.log('the balance adv:::', aList[0]);
        answer.next(myDeptList);
        answer.complete();
      });

    return answer;
  }

  getDownloadName(): AsyncSubject<string> {
    const answer: AsyncSubject<string> = new AsyncSubject<string>();

    let myDeptList: string ;
    const query = `MATCH (n:Settings)  RETURN CASE n.downloadName WHEN null THEN
    'admissions_update' ELSE
    n.downloadName END`;
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     myDeptList = (r[0]);
    //     console.log('API LASTNAME:::', r[0], r, myDeptList);
    //   }
    //   answer.next(myDeptList);
    //   answer.complete();
    //
    //
    //   });

    this.angularS1.queryDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          // console.log('AURA_get next session resumption date::', data.results[i][0] , isDate(data.results[i][0]))
          myDeptList = (data.results[i][0]);
          console.log('API LAST:::', data.results[i][0], data.results[i], myDeptList);
        }
        // console.log('the balance adv:::', aList[0]);
        answer.next(myDeptList);
        answer.complete();
      });

    return answer;
  }

  setDownloadName(aName: string) : AsyncSubject<boolean> {
    console.log("AT SET LAST DOWNLOADED NAME")
    const answer: AsyncSubject<boolean> = new AsyncSubject<boolean>();

    let myDeptList: boolean ;
    const query = `MERGE (n:Settings)  set n.downloadName =   '${aName}' return true`;
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     myDeptList = (r[0]);
    //
    //   }
    //   answer.next(myDeptList);
    //   answer.complete();
    //
    //
    //   });

    this.angularS1.writeDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          // console.log('AURA_get next session resumption date::', data.results[i][0] , isDate(data.results[i][0]))
          myDeptList = (data.results[i][0]);
          console.log('set download name:::', data.results[i][0], data.results[i], myDeptList);
        }
        // console.log('the balance adv:::', aList[0]);
        answer.next(myDeptList);
        answer.complete();
      });
    return answer;
  }


}
