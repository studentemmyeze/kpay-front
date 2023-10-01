import { Injectable } from '@angular/core';
import { AsyncSubject } from 'rxjs/internal/AsyncSubject';
import { KLoginService } from './klogin.service';

@Injectable({
  providedIn: 'root'
})
export class KpClientService {

  constructor(public angularS1: KLoginService) { }

  getEstablishDate(): Date {
    // this.angularS1.doConnect();
    let myEstDate = new Date() ;
    const query = 'MATCH (n:KorotePayClient) RETURN n.establishDate';
    // this.angularS1.angularS.run(query).then((res: Date[][]) => {
    //
    //   myEstDate = res[0][0];
    //
    // });


    this.angularS1.queryDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          // console.log('current session::', data.results[i][0])
          // answer.next(data.results[i][0]);
          myEstDate = data.results[0][0];
        }
        // answer.complete();
      });

    // this.angularS1.doDisConnect();
    return myEstDate;
  }

  getClient(): AsyncSubject<any[]> {
    const answer: AsyncSubject<any[]> = new AsyncSubject<any[]>();

    // this.angularS1.doConnect();
    const myLevelList: any[] = [] ;
    // const query = 'MATCH (n:Bank) RETURN n.shortName';
    const query = 'MATCH (n:KorotePayClient) RETURN n';

    this.angularS1.queryDB(query, '2')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          myLevelList.push(data.results[i]);
        }
        answer.next(myLevelList);
        answer.complete();
      });

    // this.angularS1.doDisConnect();
    return answer;
  }


  // getCurrentSemesterResumptionDate(): Date {

  // }
  getCurrentSession(): AsyncSubject<string> {

    const answer: AsyncSubject<string> = new AsyncSubject<string>();
    // let answer = '';
    // this.angularS1.doConnect();
    const myLevelList: any[] = [] ;
    // const query = 'MATCH (n:Bank) RETURN n.shortName';
    const query = 'MATCH (n:SessionInformation) where n.currentSession=true RETURN n.sName';
    this.angularS1.queryDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          // console.log('current session::', data.results[i][0])
          answer.next(data.results[i][0]);
        }
        answer.complete();
      });
    return answer;
  }


  saveCurrentSessionProducts(): AsyncSubject<number> {
    // let answer = 0
    // const b = sessionDate ? new Date(sessionDate).toLocaleDateString('en-GB').split('/') : null;

    const answer2: AsyncSubject<number> = new AsyncSubject<number>();
    // let answer = '';
    // this.angularS1.doConnect();
    const myLevelList: any[] = [] ;
    // const query = 'MATCH (n:Bank) RETURN n.shortName';
    const query = `
    MATCH (n:SessionInformation) where n.currentSession = true with n

    match (p:StudentProduct) create (npn:OldStudentProduct) set npn=p
    with npn, n
    Merge (npn)-[:SESSION_OLD_PRODUCTS_FOR]->(n)



    return 1
    `;

    // console.log('THIS SET CURRENT SESSION QUERY::', query);

    this.angularS1.queryDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          // console.log('current session::', data.results[i][0])
          answer2.next(data.results[i][0]);
        }
        answer2.complete();
      });
    // this.angularS1.doDisConnect();
    return answer2;
    //return answer;
  }

  setCurrentSession(newSession: string , sessionDate: Date): AsyncSubject<number> {
    // let answer = 0
    const b = sessionDate ? new Date(sessionDate).toLocaleDateString('en-GB').split('/') : null;

    const answer2: AsyncSubject<number> = new AsyncSubject<number>();
    // let answer = '';
    // this.angularS1.doConnect();
    const myLevelList: any[] = [] ;
    // const query = 'MATCH (n:Bank) RETURN n.shortName';
    const query = `

    MATCH (ns:SessionInformation) where ns.currentSession = true with ns

    set ns.currentSession= false
    merge (s:SessionInformation {sName: '${newSession}',
    matricStatus: 0, currentSession: true,
    startDate: Date({ year:${b![2]},
      month:${Number(b![1])}, day:${Number(b![0])}}),
    creationStamp: datetime({timezone:'+01:00'})})

    return 1
    `;

    // console.log('THIS SET CURRENT SESSION QUERY::', query);
    this.angularS1.writeDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          // tslint:disable-next-line:radix
          answer2.next(parseInt(data.results[i][0]));
          // tslint:disable-next-line:radix
          console.log('current session StatAura_new::', data.status, parseInt(data.results[i][0]));

          // answer = parseFloat(data.results[i][0]);
        }
        answer2.complete();
      });



    return answer2;
  }

  setCurrentSessionMatricStatus(matricDate: Date): AsyncSubject<number> {
    const b = matricDate ? new Date(matricDate).toLocaleDateString('en-GB').split('/') : null;

    const answer: AsyncSubject<number> = new AsyncSubject<number>();
    // let answer2 = 0;
    // this.angularS1.doConnect();

    // const query = 'MATCH (n:Bank) RETURN n.shortName';
    const query = `MATCH (n:SessionInformation) where n.currentSession=true
      set n.matricStatus = 1
      set n.matricDate = Date({ year:${b![2]},
        month:${Number(b![1])}, day:${Number(b![0])}})

      return 1`;

    this.angularS1.writeDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          console.log('current session MATStatAura::', data.results[i][0]);
          answer.next(data.results[i][0]);
          // answer = parseFloat(data.results[i][0]);
        }
        answer.complete();
      });




    // this.angularS1.doDisConnect();
    return answer;

    // return "2021/2022";
  }

  getCurrentSessionMatricStatus(): AsyncSubject<number> {

    const answer: AsyncSubject<number> = new AsyncSubject<number>();
    // let answer2 = 0;
    // this.angularS1.doConnect();

    // const query = 'MATCH (n:Bank) RETURN n.shortName';
    const query = 'MATCH (n:SessionInformation) where n.currentSession=true RETURN n.matricStatus';
    this.angularS1.queryDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          // console.log('current session matric status::', data.results[i][0], data.results[i], transform(data.results[i][0]) );

          // console.log('current session matric status::', data.results[i][0]);
          // console.log('current session matric status::',  data.results[i]);

          // tslint:disable-next-line:radix
          answer.next(parseInt(data.results[i][0]));
        }
        answer.complete();
      });


    // this.angularS1.doDisConnect();
    return answer;

    // return "2021/2022";
  }



  getNextSession(): string {

    return "2022/2023";

  }



  getCurrentSemester(): number {return 1;}


  getNextSessionResumptionDate(): AsyncSubject<Date> {
    // let answer = new Date();
    const answer2: AsyncSubject<Date> = new AsyncSubject<Date>();

    // this.angularS1.doConnect();
    const myLevelList: any[] = [] ;
    // const query = 'MATCH (n:Bank) RETURN n.shortName';
    const query = 'MATCH (n:SessionInformation) where n.currentSession=true RETURN n.startDate';

    this.angularS1.queryDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          // console.log('AURA_get next session resumption date::', data.results[i][0] , isDate(data.results[i][0]))
          answer2.next(new Date(isDate(data.results[i][0])));
        }
        answer2.complete();
      });


    // this.angularS1.doDisConnect();
    return answer2;
    // return new Date ("2021/11/13");

  }


  getMatriculationDate(): AsyncSubject<Date> {


    // let answer = new Date();
    const answer2: AsyncSubject<Date> = new AsyncSubject<Date>();

    // this.angularS1.doConnect();
    const myLevelList: any[] = [] ;
    // const query = 'MATCH (n:Bank) RETURN n.shortName';
    const query = 'MATCH (n:SessionInformation) where n.currentSession=true RETURN n.matricDate';
    this.angularS1.queryDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          // console.log('AURA_get next session resumption date::', data.results[i][0] , isDate(data.results[i][0]))
          answer2.next(new Date(isDate(data.results[i][0])));
        }
        answer2.complete();
      });


    // this.angularS1.doDisConnect();
    return answer2;
    // return new Date ("2021/11/13");

  }




  setCurrentSemesterResumptionDate(): void {
  }






}

function transform(object: any) {
  for (const property in object) {
    if (object.hasOwnProperty(property)) {
      const propertyValue = object[property];
      if (isInteger(propertyValue)) {
        object[property] = propertyValue.toString();
      } else if (typeof propertyValue === 'object') {
        transform(propertyValue);
      }
    }
  }
}

// tslint:disable-next-line:typedef no-bitwise
function isInteger(x: any) { return (x ^ 0) === x; }

// tslint:disable-next-line:typedef
function isDate(x: any) { return (`${x.year}-${x.month}-${x.day}`); }
