import { Injectable } from '@angular/core';
import { AsyncSubject, BehaviorSubject } from 'rxjs';
import { Study } from '../interfaces/student';
import { KLoginService } from './klogin.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root'
})
export class StudyService {

  constructor(public angularS1: KLoginService, private utils: UtilityService) { }

  checkIfAStudyExists(ApplicationNo?: string, JambNo?: string): boolean {
    // console.log("IN CHECK IF A STUDY EXISTS");
    let answer = false;
    const answerList: Study[] = [];
    // if (ApplicationNo !== undefined || JambNo !== undefined||ApplicationNo !== null || JambNo !== null)
    if (ApplicationNo || JambNo)
    {

      const query = (ApplicationNo ? `Match (n:Study) where n.applicationNo = "${ApplicationNo}" return n` : `Match (n:Study) where n.jambNo = "${JambNo}"  return n`);
      // console.log("CHECK IF STUDY EXISTS:::", query);
      // this.angularS1.angularS.run(query).then((res: any) => {
      //   for (const r of res) {
      //     // console.log("CHECK IF STUDY EXISTS:::", r);
      //     answerList.push(r[0].properties as Study);

      //   }
      //   // answer.next(myQualificationList);
      //   answer = (answerList ? true: answer);

      //   });

      this.angularS1.queryDB(query, '2')
      .subscribe((data) => {
      if (data) {
        for (let i = 0; i < data.results.length; i++) {
          const aStudy = data.results[i];
          aStudy.beginDate = aStudy.beginDate ? this.utils.getStringDate(aStudy.beginDate) : null;
          aStudy.finishDate = aStudy.finishDate ? this.utils.getStringDate(aStudy.finishDate) : null;
          answerList.push(aStudy as Study);

        }
        answer = (answerList ? true : answer);
      }});

    }



    return answer;
  }


  getStudentStudy(studentNo: string): BehaviorSubject<Study[]> {
    // this.angularS1.doConnect();
    const answer: BehaviorSubject<Study[]> = new BehaviorSubject<Study[]>([]);

    const myQualificationList: Study[] = [] ;
    const query = `MATCH (n:Student{studentNo: "${studentNo}"})-[:COMMENCED_STUDY]->(q:Study) return q`;
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     myQualificationList.push(r[0].properties as Study);
    //     // console.log(r[0]);
    //   }
    //   answer.next(myQualificationList);

    //   });

    this.angularS1.queryDB(query, '2')
      .subscribe((data) => {
      if (data) {
        for (let i = 0; i < data.results.length; i++) {
          // console.log('AURA_get study::', data.results[i])
          const aStudy = data.results[i];
          aStudy.beginDate = aStudy.beginDate ? this.utils.getStringDate(aStudy.beginDate) : null;
          aStudy.finishDate = aStudy.finishDate ? this.utils.getStringDate(aStudy.finishDate) : null;
          myQualificationList.push(aStudy as Study);
        }
        answer.next(myQualificationList);
      }
    });

    // this.angularS1.doDisConnect();
    return answer;
  }

  getStudyJAMBNo(): BehaviorSubject<Study[]> {
    // this.angularS1.doConnect();
    const answer: BehaviorSubject<Study[]> = new BehaviorSubject<Study[]>([]);

    const myQualificationList: Study[] = [] ;
    const query = `MATCH (n:Student)-[:COMMENCED_STUDY]->(q:Study) return q`;
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     myQualificationList.push(r[0].properties as Study);
    //     // console.log(r[0]);
    //   }
    //   answer.next(myQualificationList);
    //     // console.log(r[0]);

    //   });

    this.angularS1.queryDB(query, '2')
      .subscribe((data) => {
      if (data) {
        for (let i = 0; i < data.results.length; i++) {
          const aStudy = data.results[i];
          aStudy.beginDate = aStudy.beginDate ? this.utils.getStringDate(aStudy.beginDate) : null;
          aStudy.finishDate = aStudy.finishDate ? this.utils.getStringDate(aStudy.finishDate) : null;
          myQualificationList.push(aStudy as Study);
          // myQualificationList.push(data.results[i] as Study);
        }
        answer.next(myQualificationList);
      }
    });



    // this.angularS1.doDisConnect();
    return answer;
  }

  getStudyStatus(): AsyncSubject<string[]> {
    // this.angularS1.doConnect();
    const answer: AsyncSubject<string[]> = new AsyncSubject<string[]>();

    const myQualificationList: string[] = [] ;
    const query = `MATCH (n:Student)-[:COMMENCED_STUDY]->(q:Study) return distinct(q.status) as status`;
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     myQualificationList.push(r[0]);
    //     // console.log(r);
    //   }
    //   answer.next(myQualificationList);
    //   answer.complete();

    //   });


    this.angularS1.queryDB(query, '0')
          .subscribe((data) => {
            for (let i = 0; i < data.results.length; i++) {
              // console.log('AURA_get study::', data.results[i][0]);
              myQualificationList.push(data.results[i][0]);
            }
            answer.next(myQualificationList);
            answer.complete();
          });

    // this.angularS1.doDisConnect();
    return answer;
  }


  setStudentStudy(studentNo: string, aStudy: Study): BehaviorSubject<number> {
    // this.angularS1.doConnect();
    const responseQuali: BehaviorSubject<number> = new BehaviorSubject<number>(0);

    // const a = new Date(aQuali.sDate).toLocaleDateString('en-GB').split('/');
    const b = new Date(aStudy.beginDate).toLocaleDateString('en-GB').split('/');

    // const c = new Date(aQuali.dateIssued).toLocaleDateString('en-GB').split('/');

    const response = false ;
    let aAnswer: string;

    const query = `MATCH (n:Student{studentNo: "${studentNo}"})
    MERGE (n)-[:COMMENCED_STUDY]->(q:Study{
      beginDate: datetime({ year:${b[2]},
        month:${Number(b[1])}, day:${Number(b[0])}, timezone:'+01:00' }),
        beginSession: "${aStudy.beginSession ? aStudy.beginSession : ''}",
        studentType: ${aStudy.studentType},
        department: "${aStudy.department ? aStudy.department : ''}",
        status: "${aStudy.status ? aStudy.status : ''}",
        jambNo: "${aStudy.jambNo ? aStudy.jambNo : ''}",
        staffIn: "${aStudy.staffIn ? aStudy.staffIn : ''}",

      applicationNo: "${aStudy.applicationNo ? aStudy.applicationNo : ''}",
      creationStamp: toString(datetime({ timezone:'+01:00' })),
        isDeleted: false
    }) return 1`;



    // console.log('set query: ', query);
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     aAnswer = r[0];
    //     // console.log('r at the set staff quali:: ', r);
    //     // console.log('response at the set staff quali:: ', response);
    //   }
    //   responseQuali.next(parseFloat(aAnswer));


    //   });


    this.angularS1.writeDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          aAnswer = (data.results[i][0]);
        }
        responseQuali.next(parseFloat(aAnswer));

      });




      // console.log('response at the set staff quali:: ', response);
    // this.angularS1.doDisConnect();

    // responseQuali.complete();
    return responseQuali;
  }

  updateStudentStudy(studentNo: string, aStudy: Study): BehaviorSubject<number> {
    // this.angularS1.doConnect();
    const responseQuali2: BehaviorSubject<number> = new BehaviorSubject<number>(0);

    // const a = new Date(aQuali.sDate).toLocaleDateString('en-GB').split('/');
    const b = new Date(aStudy.beginDate).toLocaleDateString('en-GB').split('/');

    // const c = new Date(aQuali.dateIssued).toLocaleDateString('en-GB').split('/');


    const response = false ;
    let aAnswer: string ;

    let query = `MATCH (n:Student{studentNo: "${studentNo}"})-
    [:COMMENCED_STUDY]->(q:Study
      {
        creationStamp: "${aStudy.creationStamp}"
      }
      )

      set q.beginDate = datetime({ year:${b[2]},
        month:${Number(b[1])}, day:${Number(b[0])}, timezone:'+01:00' })
      set q.beginSession= "${aStudy.beginSession ? aStudy.beginSession : ''}"
        set q.studentType = ${aStudy.studentType}
        set q.department = "${aStudy.department ? aStudy.department : ''}"
        set q.status= "${aStudy.status ? aStudy.status : ''}"
        set q.jambNo= "${aStudy.jambNo ? aStudy.jambNo : ''}"

        `;
    query += aStudy.status === 'Ongoing' ? `
with n
match (n)-[r:A_STUDENT_OF]-(p) where p.dName <> "${aStudy.department ? aStudy.department : ''}"
 delete r with n
  match (pp: Programme) where pp.dName = "${aStudy.department ? aStudy.department : ''}"
   merge (n)-[:A_STUDENT_OF]->(pp)


` : '';
    query += ` return "1"`;

    console.log('at edit student query: ', query);
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     aAnswer = r[0];
    //     // console.log('r at the set staff quali:: ', r);
    //     // console.log('response at the set staff quali:: ', response);
    //   }
    //   responseQuali2.next(parseFloat(aAnswer));


    //   });

    this.angularS1.writeDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          aAnswer = (data.results[i][0]);
        }
        responseQuali2.next(parseFloat(aAnswer));

      });

      // console.log('response at the set staff quali:: ', response);
    // this.angularS1.doDisConnect();

    // responseQuali.complete();
    return responseQuali2;
  }

  deleteStudentStudy(studentNo: string, aStudy: Study): BehaviorSubject<number> {
    // this.angularS1.doConnect();
    const responseQuali3: BehaviorSubject<number> = new BehaviorSubject<number>(0);

    const response = false ;
    let aAnswer: string;

    const query = `MATCH (n:Student{studentNo: "${studentNo}"})
    -[:COMMENCED_STUDY]->(q:Study
      {
        creationStamp: "${aStudy.creationStamp}"
      }
      ) detach delete q
      return "1"`;

    // console.log('delete query: ', query);
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     aAnswer = r[0];
    //     // console.log('r at the delete staff quali:: ', r);
    //     // console.log('response at the set staff quali:: ', response);
    //   }
    //   responseQuali3.next(parseFloat(aAnswer));


    //   });

    this.angularS1.writeDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          aAnswer = (data.results[i][0]);
        }
        responseQuali3.next(parseFloat(aAnswer));

      });

    return responseQuali3;
  }
}
