import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AsyncSubject } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

import { Applications, NextKin } from '../interfaces/student';
import { KLoginService } from './klogin.service';
// import { upperCaseMapper, isEmpty, isFilled, isValue } from 'xlsx-import/lib/mappers';
import { concatAll } from 'rxjs/operators';
import { AbstractExtendedWebDriver } from 'protractor/built/browser';
import * as fs from 'fs';
import * as path from 'path';

@Injectable({
  providedIn: 'root'
})
export class NextkinService {

  constructor(
    public angularS1: KLoginService) {
    }

  getStudentNextOfKin(staffCode: string): BehaviorSubject<NextKin[]> {
    const answer: BehaviorSubject<NextKin[]> = new BehaviorSubject<NextKin[]>([]);

    const myQualificationList: NextKin[] = [] ;
    let query = '';

    query = `MATCH (n:Student{studentNo: "${staffCode}"})-[HAS_NEXTOFKIN]->(q:NextKin) return q`;

    this.angularS1.queryDB(query,'2')
      .subscribe((data) => {
        if (data) {
          for (var i = 0; i < data.results.length; i++) {
            // console.log('next of kin aura', data.results[i])
            myQualificationList.push(data.results[i] as NextKin);

            // myNList.push(data.results[i])
          }
          answer.next(myQualificationList);

        }


      });
    // console.log("AT GET NEXT OF KIN::", answer);
    return answer; // new BehaviorSubject(myQualificationList);
  }


  setStudentNextOfKin(staffCode: string, aNOK: NextKin): BehaviorSubject<number> {
    // this.angularS1.doConnect();
    // let responseQuali: BehaviorSubject<number> = new BehaviorSubject(null);

    // let response = false ;
    let aAnswer: string ="";
    let query = '';

      query = `MATCH (n:Student{studentNo: "${staffCode}"})
    MERGE (n)-[:HAS_NEXTOFKIN]->(q:NextKin
      {
        title: "${aNOK.title}",
        fullName: "${aNOK.fullName}",
        relationship: "${aNOK.relationship}",
    email: "${aNOK.email ? aNOK.email : ""}",
    phone: "${aNOK.phone}",
    occupation: "${aNOK.occupation}",
    address: "${aNOK.address}",
    creationStamp: toString(datetime({ timezone:'+01:00' }))
      }
      ) return "1"`;


    console.log('set query: ', query);
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     aAnswer = r[0];
    //     // console.log('r at the set staff kin:: ', r);
    //     // console.log('response at the set staff quali:: ', response);
    //   }
    //   // responseQuali.next(parseFloat(aAnswer));


    //   });

      this.angularS1.writeDB(query,'0')
          .subscribe((data) => {
            for (var i = 0; i < data.results.length; i++) {
              aAnswer = data.results[i][0];
            }
          });
      // console.log('response at the set staff quali:: ', response);
    // this.angularS1.doDisConnect();

    // responseQuali.complete();
    return new BehaviorSubject(parseFloat(aAnswer));
  }

  updateStudentNextOfKin(staffCode: string, aQuali: NextKin): BehaviorSubject<number> {
    let aAnswer: string = "";

    const query = `MATCH (n:Student{studentNo: "${staffCode}"})
    -[:HAS_NEXTOFKIN]->(q:NextKin
      {
        creationStamp: "${aQuali.creationStamp}"
      }
      )

      set q.title= "${aQuali.title}"
      set q.relationship= "${aQuali.relationship}"
      set q.fullName= "${aQuali.fullName}"
      set q.occupation= "${aQuali.occupation}"

      set q.phone= "${aQuali.phone}"

      set q.address= "${aQuali.address}"
      set q.email= "${aQuali.email ? aQuali.email : ""}"

      return "1"`;

      this.angularS1.writeDB(query,'0')
          .subscribe((data) => {
            for (var i = 0; i < data.results.length; i++) {
              aAnswer = data.results[i][0];
            }
          });

    return new BehaviorSubject(parseFloat(aAnswer));
  }

  deleteStudentNextOfKin(staffCode: string, aQuali: NextKin): BehaviorSubject<number> {
    // this.angularS1.doConnect();
    // let responseQuali3: BehaviorSubject<number> = new BehaviorSubject(null);


    let response = false ;
    let aAnswer: string ="";
    let query = '';


      query = `MATCH (n:Student{studentNo: "${staffCode}"})
      -[:HAS_NEXTOFKIN]->(q:NextKin
        {
          creationStamp: "${aQuali.creationStamp}"
        }
        ) detach delete q
        return "1"`;



      this.angularS1.writeDB(query,'0')
          .subscribe((data) => {
            for (var i = 0; i < data.results.length; i++) {
              aAnswer = data.results[i][0];
            }
          });

    return new BehaviorSubject(parseFloat(aAnswer));
  }
}


