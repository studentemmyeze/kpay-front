import { Injectable } from '@angular/core';
import { AsyncSubject } from 'rxjs';
import { Faculty, Programme, ProgrammeFaculty } from '../interfaces/product';
import { KLoginService } from './klogin.service';

@Injectable({
  providedIn: 'root'
})
export class DepartmentalService {

  constructor(
    public angularS1: KLoginService,
    ) { }

  getProgrammes(): AsyncSubject<Programme[]> {
    let responseQuali2: AsyncSubject<Programme[]> = new AsyncSubject();

    // this.angularS1.doConnect();

    const myNList: ProgrammeFaculty[] = [] ;
    const query = `MATCH (n:Programme)-[]-(f:Faculty) return n.dName as dName, f.dCode as facultyDCode  order by dName`;
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     myNList.push({
    //       dName: r[0],

    //       facultyDCode: r[1]} as ProgrammeFaculty)
    //   }
    //   responseQuali2.next(myNList);
    //   responseQuali2.complete()

    //   });

      this.angularS1.queryDB(query,'0')
      .subscribe((data) => {
        for (var i = 0; i < data.results.length; i++) {

          myNList.push({
            dName: data.results[i][0],

            facultyDCode: data.results[i][1]} as ProgrammeFaculty)


        }
        responseQuali2.next(myNList);
        responseQuali2.complete()

      });
    return responseQuali2;

  }

  setProgramme(
    aUser: ProgrammeFaculty): AsyncSubject<number> {

    let responseQuali2: AsyncSubject<number> = new AsyncSubject();
    let answer = 0
    const query = `merge (n:Programme{dName: toUpper("${aUser.dName}")})
    with n
    MATCH (f:Faculty) where f.dCode = "${aUser.facultyDCode}" with f,n
    MERGE (f)<-[:IN_FACULTY]-(n)
    return 1
    `;

    this.angularS1.writeDB(query,'0')
      .subscribe((data) => {
        for (var i = 0; i < data.results.length; i++) {
          answer = parseFloat(data.results[i][0]);
        }

      });


      responseQuali2.next(answer);
      responseQuali2.complete()

      return responseQuali2;
    }

  getFaculties(): AsyncSubject<Faculty[]> {
    this.angularS1.doConnect();
    let responseQuali2: AsyncSubject<Faculty[]> = new AsyncSubject();

    const myNList: Faculty[] = [] ;
    const query = `MATCH (n:Faculty) return n order by n.dCode`;
    this.angularS1.queryDB(query,'2')
      .subscribe((data) => {
        for (var i = 0; i < data.results.length; i++) {
          myNList.push(data.results[i])
        }
        responseQuali2.next(myNList);
        responseQuali2.complete()
      });

    return responseQuali2;

  }

  setFaculties(
    aFaculty: Faculty): AsyncSubject<number> {

    let responseQuali2: AsyncSubject<number> = new AsyncSubject();
    let answer = 0
    const query = `MERGE (n:Faculty{dCode:toUpper("${aFaculty.dCode}")})
    set n.dName = "${aFaculty.dName}"

    return 1
    `;

    // // console.log('CREATE USER: ', query);
    // this.angularS1.doConnect();


    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     answer = parseFloat(r[0]);
    //   }
    //   });

      this.angularS1.writeDB(query,'0')
      .subscribe((data) => {
        for (var i = 0; i < data.results.length; i++) {
          answer = parseFloat(data.results[i][0]);
        }

      });


      responseQuali2.next(answer);
      responseQuali2.complete()

      return responseQuali2;
    }


}
