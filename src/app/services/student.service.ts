import { Injectable } from '@angular/core';
import { AsyncSubject } from 'rxjs/internal/AsyncSubject';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { NextKin, SearchPara, SponsorDetails, Student, StudentType, Study, TempStudent } from '../interfaces/student';
import { KLoginService } from './klogin.service';
@Injectable({
  providedIn: 'root'
})
export class StudentService {

  public newStudentMarker: BehaviorSubject<number> = new BehaviorSubject <number>(1);

  constructor(public angularS1: KLoginService) { }


  getStudentsList(searchPara?: SearchPara ): BehaviorSubject<Student[]> {
    // try {
    //   this.angularS1.doConnect();
    // } catch (error) {
    //   console.log('issues with connectingto DB',error)
    // }
    const answer: BehaviorSubject<Student[]> = new BehaviorSubject <Student[]>([]);

    const myQualificationList : Student[] = [] ;
    let query = `MATCH (f:Faculty)<-[:IN_FACULTY]-(p:Programme)<-[:A_STUDENT_OF]-(n:Student)-[:COMMENCED_STUDY]->(st:Study) `;
    let tempquery = "" ; // `MATCH (f:Faculty)<-[:IN_FACULTY]-(p:Programme)<-[:A_STUDENT_OF]-(n:Student)-[:COMMENCED_STUDY]->(st:Study) `;
    // console.log("serch para::", searchPara)

    // tslint:disable-next-line:max-line-length
    if (searchPara && (searchPara.fName || searchPara.lName || searchPara.programme || searchPara.level || searchPara.faculty || searchPara.gender || searchPara.studyStatus || (searchPara.status !== undefined)   )) {
      query += ' where ';
      tempquery = query;

      query += searchPara.programme ? `p.pName = '${searchPara.programme}' ` : ''

      query += searchPara.level ? (query.trimEnd() !== tempquery.trimEnd() ? ` and n.level = ${searchPara.level} ` : ` n.level = ${searchPara.level} `) : '' ;

      query += searchPara.faculty ? (query.trimEnd() !== tempquery.trimEnd() ? ` and f.dCode = '${searchPara.faculty}' ` : ` f.dCode = '${searchPara.faculty}' `) : '' ;

      query += searchPara.fName ? (query.trimEnd() !== tempquery.trimEnd() ? ` and toUpper(n.firstName = '${searchPara.fName}') ` : ` n.firstName = '${searchPara.fName}' `) : '' ;

      query += searchPara.lName ? (query.trimEnd() !== tempquery.trimEnd() ? ` and toUpper(n.lastName = '${searchPara.lName}') ` : ` n.lastName = '${searchPara.lName}' `) : '' ;

      query += searchPara.status !== undefined ? (query.trimEnd() !== tempquery.trimEnd() ? ` and n.activeStatus = ${searchPara.status} ` : ` n.activeStatus = ${searchPara.status} `) : '' ;

      query += searchPara.gender ? ((query.trimEnd() !== tempquery.trimEnd()) ? ` and n.gender = '${searchPara.gender}' ` : ` n.gender = '${searchPara.gender}' `) : '' ;

      query += searchPara.studyStatus ? (query.trimEnd() !== tempquery.trimEnd() ? ` and st.status = '${searchPara.studyStatus}' ` : ` st.status = '${searchPara.studyStatus}' `) : '' ;


    }


    query += ` return distinct(n)  order by n.studentNo`;

    console.log('QUERY get student::', query);

    this.angularS1.queryDB(query, '2')
      .subscribe((data) => {
        console.log('stuuddata', data);
        if (data.results) {
          let count = 0;
          for (let i = 0; i < data.results.length; i++) {
            const tempStudent = data.results[i];
            console.log('studemts::', tempStudent);
            const dateObject = tempStudent.dOB ? this.getStringDate(tempStudent.dOB) : null;

            tempStudent.dOB = dateObject ? (dateObject) : null;
            if (count === 0) {
              console.log('tempstudent::', tempStudent);

            }
            // console.log('tempstudent::',tempStudent )
            myQualificationList.push(
              tempStudent as Student
              // data.results[i] as Student

              );

            count ++;

            // myNList.push(data.results[i])
          }

        }

        answer.next(myQualificationList);
      });

    return answer;
  }

  getStringDigits(aNo: number): string {
    let answer = aNo.toString();
    if (answer.length < 2) {
      answer = '0' + answer;
    }
    return answer;
  }

  getStringDate(items: {year: number, month: number, day: number, hour: number, minute: number, second: number, nanosecond: number, timeZoneOffsetSeconds: number}): string{

    const dateObject = new Date(Date.UTC(items.year, (items.month - 1), items.day, items.hour, items.minute, items.second, items.nanosecond / 1000000));

    const timeZoneOffsetSeconds = 3600;
    dateObject.setUTCMinutes(dateObject.getUTCMinutes() - timeZoneOffsetSeconds / 60);
    // console.log('this dateobject::', dateObject)
    return dateObject.toString();

}


  // this is a temp function

  getSponsor(aStudentNo: string): AsyncSubject<SponsorDetails> {
    // this.angularS1.doConnect();
    const answer: AsyncSubject<SponsorDetails> = new AsyncSubject <SponsorDetails>();

    let myQualificationList : SponsorDetails ;
    const query = `MATCH (n: Student{studentNo: "${aStudentNo}"})-[:HAS_SPONSOR]->(sp) return sp`;
    // console.log("AT GET SPONSOR::", query);
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     myQualificationList = (r[0].properties as SponsorDetails);
    //   }
    //   //console.log("AT GET SPONSOR::", query, myQualificationList);

    //   answer.next(myQualificationList);
    //   answer.complete();

    //   });

    this.angularS1.queryDB(query, '2')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          myQualificationList = data.results[i] as SponsorDetails;

          // myNList.push(data.results[i])
        }
        answer.next(myQualificationList);
        answer.complete();
      });



    return answer;
  }

  getSponsorList(): AsyncSubject<any[]> {
    const answer: AsyncSubject<any[]> = new AsyncSubject <any[]>();

    const myQualificationList : any[] = [];
    const query = `MATCH (n:Student) with n
    OPTIONAL MATCH (s:Sponsor)- []-(n) with n, s
    OPTIONAL MATCH (n)-[]-(nk:NextKin)
    with  n.studentNo as studentNo, collect({phone:nk.phone, email:nk.email, address:nk.address, relationship:nk.relationship, name:nk.fullName}) as gd, {address:s.address, relationship:s.relationship, phone:s.phone, email:s.email, name:s.fullName} as spons

    return  studentNo, gd, spons`;
    // console.log("AT GET SPONSOR::", query);

    this.angularS1.queryDB(query, '0')
          .subscribe((data) => {
            for (let i = 0; i < data.results.length; i++) {
              // console.log('AURA_get next session resumption date::', data.results[i][0] , isDate(data.results[i][0]))
              myQualificationList.push(data.results[i]);
            }
            // answer.next(new Date(isDate(data.results[i][0])));

            answer.next(myQualificationList);
            answer.complete();
          });


    return answer;
  }

  setStudent(aStudent: Student, aStudy: Study, aNOKList: NextKin[],
             aSponsorDetail?: SponsorDetails): BehaviorSubject<number> {
    // this.angularS1.doConnect();
    let responseQuali: BehaviorSubject<number> = new BehaviorSubject<number>(0);

    let response = false ;
    let aAnswer: string;

    const a = aStudent.dOB ?
      new Date(aStudent.dOB).toLocaleDateString('en-GB').split('/') :
      null;
    const b = aStudy.beginDate ? new Date(aStudy.beginDate).toLocaleDateString('en-GB').split('/')  : null;
    //           null;
    // try {

    //   const tempDate = new Date(aStudy.beginDate);
    //   console.log('Study date before split new date::', tempDate );
    //   b = tempDate.toLocaleDateString('en-GB').split('/')

    // } catch (error) {
    //   b = aStudy.beginDate.toLocaleDateString('en-GB').split('/')

    // }
    // console.log('Study date before split::', aStudy.beginDate );
    // console.log('robo::', aStudy.beginDate.toLocaleDateString('en-GB').split('/'))
    // console.log('split time DOB::', a)
    // console.log('split time StudyBegin::', b)
    let query0 = ['','', '','','',''];
    let query ="";
    let query2 = "";
    query0[0] = `MERGE (n:Student
      {studentNo: "${aStudent.studentNo}"})

      set n.title= "${aStudent.title ? aStudent.title : ''}"
      set n.lastName = toUpper(trim("${aStudent.lastName ? aStudent.lastName : ''}"))
      set n.firstName= toUpper(trim("${aStudent.firstName ? aStudent.firstName : ''}"))
      set n.middleName = toUpper(trim("${aStudent.middleName ? aStudent.middleName : ''}"))
      set n.email= toLower(trim("${aStudent.email ? aStudent.email : ""}"))
      set n.phone= "${aStudent.phone ? aStudent.phone : ''}"
      set n.gender= "${aStudent.gender ? aStudent.gender : ''}"
      set n.address= toUpper(trim("${aStudent.address ? aStudent.address : ''}"))
      set n.level= ${aStudent.level ? aStudent.level : null}
      set n.nin= "${aStudent.nin ? aStudent.nin : ''}"
      set n.activeStatus= ${aStudent.activeStatus}
      set n.studentType= ${aStudent.studentType}
      set n.programme= "${aStudent.programme ? aStudent.programme : ''}"

      set n.maritalStatus= "${aStudent.maritalStatus}"
      set n.state= "${aStudent.state}"
      set n.nationality= "${aStudent.nationality}"
      set n.religion= "${aStudent.religion}"
      set n.staffIn= "${aStudent.staffIn}"
      set n.creationStamp= toString(datetime({ timezone:"+01:00" }))
        `
    if (a && a !== undefined && a !== null && a[0] !== 'Invalid Date') {
      query += `set n.dOB = datetime({ year:${Number(a![2])},
            month:${Number(a![1])}, day:${Number(a![0])}, timezone:"+01:00" })`
    }






    query2 = `MERGE (n:Student
      {
        title: "${aStudent.title ? aStudent.title : ''}",
        lastName: toUpper(trim("${aStudent.lastName ? aStudent.lastName : ''}")),
        studentNo: "${aStudent.studentNo ? aStudent.studentNo: ''}",
        firstName: toUpper(trim("${aStudent.firstName ? aStudent.firstName : ''}")),
        middleName: toUpper(trim("${aStudent.middleName ? aStudent.middleName : ''}")),
        email: toLower(trim("${aStudent.email ? aStudent.email : ""}")),
        phone: "${aStudent.phone ? aStudent.phone : ''}",
        gender: "${aStudent.gender ? aStudent.gender : ''}",
        address: toUpper(trim("${aStudent.address ? aStudent.address : ''}")),
        level: ${aStudent.level ? aStudent.level : null},
        nin: "${aStudent.nin ? aStudent.nin : ''}",
        activeStatus: ${aStudent.activeStatus},
        studentType: ${aStudent.studentType},
        programme: "${aStudent.programme ? aStudent.programme : ''}",

        maritalStatus: "${aStudent.maritalStatus}",
        state: "${aStudent.state}",
        nationality: "${aStudent.nationality}",
        religion: "${aStudent.religion}",







        staffIn: "${aStudent.staffIn}", `;
    // console.log('THIS IS A::', a);


    query2 +=
      ` creationStamp: toString(datetime({ timezone:"+01:00" })) })`;

    // query0[0] += `return n`
    // query += ` with n MERGE (n)`
    // query0[1] += ` with n MERGE (q:Study{jambNo: toUpper(trim("${aStudy.jambNo}"))}) with n, q`
    query0[1] += ` with n MERGE (q:Study{jambNo: toUpper(trim("${aStudy.jambNo}"))}) `

    query0[2]+= ` with n, q MERGE (n)-[:COMMENCED_STUDY]->(q) `;
    query0[2] += `set q.beginDate= datetime({ year:${Number(b![2])},
            month:${Number(b![1])}, day:${Number(b![0])}, timezone:"+01:00" })
            set q.beginSession= "${aStudy.beginSession ? aStudy.beginSession : ''}"
            set q.studentType= ${aStudy.studentType}
            set q.programme= "${aStudy.programme ? aStudy.programme : ''}"
            set q.status= "${aStudy.status ? aStudy.status : ''}"
            set q.staffIn= "${aStudy.staffIn ? aStudy.staffIn : ''}"

            set q.applicationNo= "${aStudy.applicationNo ? aStudy.applicationNo : ''}"
            set q.creationStamp= toString(datetime({ timezone:"+01:00" }))
            set q.isDeleted= false
        `;
    if (aNOKList.length > 0) {

      if (aNOKList[0].fullName && aNOKList[0].fullName !== 'phone') {
        query0[3] += ` with n MERGE (n)-[:HAS_NEXTOFKIN]->(qk:NextKin {
          creationStamp: toString(datetime({ timezone:"+01:00" })-duration("PT60S"))
        })
        set qk.title= "${aNOKList[0].title ? aNOKList[0].title : ''}"
      set qk.relationship= "${aNOKList[0].relationship ? aNOKList[0].relationship : ''}"
      set qk.fullName= toUpper(trim("${aNOKList[0].fullName && aNOKList[0].fullName !== 'phone'  ? aNOKList[0].fullName: ''}"))
      set qk.occupation= toUpper(trim("${aNOKList[0].occupation ? aNOKList[0].occupation : '' }"))

      set qk.phone= "${aNOKList[0].phone && aNOKList[0].phone !== 'email' ? aNOKList[0].phone : ''}"

      set qk.address= "${aNOKList[0].address ?aNOKList[0].address  : '' }"
      set qk.email= toLower(trim("${aNOKList[0].email ? aNOKList[0].email : ""}"))

        `;
      }

      else {
        query += ''
      }


      if (aNOKList.length > 1) {
        if (aNOKList[1].fullName && aNOKList[1].fullName !== 'phone') {
          query0[3] += ` with n MERGE (n)-[:HAS_NEXTOFKIN]->(q2:NextKin {
            creationStamp: toString(datetime({ timezone:"+01:00" }))
          })
          set q2.title= "${aNOKList[1].title ? aNOKList[1].title : ''}"
        set q2.relationship= "${aNOKList[1].relationship ? aNOKList[1].relationship : ''}"
        set q2.fullName= toUpper(trim("${aNOKList[1].fullName && aNOKList[1].fullName !== 'phone'  ? aNOKList[1].fullName: ''}"))
      set q2.occupation= toUpper(trim("${aNOKList[1].occupation ? aNOKList[1].occupation : '' }"))


        set q2.phone= "${aNOKList[1].phone && aNOKList[1].phone !== 'email' ? aNOKList[1].phone : ''}"

        set q2.address= toUpper(trim("${aNOKList[1].address ?aNOKList[1].address  : ''}"))
        set q2.email= toLower(trim("${aNOKList[1].email ? aNOKList[1].email : ""}"))

  `;
        }
        else {
          query += ''
        }

      }

      // query0[3] += `return n`;
    }

    if (aSponsorDetail) {
      query0[4] += `
      with n MERGE (n)-[:HAS_SPONSOR]->(sp: Sponsor{
        creationStamp: toString(datetime({ timezone:"+01:00" }))
      })
    set sp.relationship= "${aSponsorDetail?.relationship}"
    set sp.fullName= toUpper(trim("${aSponsorDetail.fullName ? aSponsorDetail.fullName: ''}"))
  set sp.bank= toUpper(trim("${aSponsorDetail.bank ? aSponsorDetail.bank : '' }"))
  set sp.accountNumber= toUpper(trim("${aSponsorDetail.accountNumber ? aSponsorDetail.accountNumber : '' }"))
  set sp.accountName= toUpper(trim("${aSponsorDetail.accountName ? aSponsorDetail.accountName : '' }"))

  `;
    }

    if (aStudent.programme)
    {
      query0[5] +=
        `
      with n
      optional match (n)-[p:A_STUDENT_OF]-(qq) with n, p
      delete p
      with n
      MERGE (d: Programme{pName:"${aStudent.programme}"}) with n, d
      MERGE (n)-[:A_STUDENT_OF]-> (d)
      with n
      MERGE (ll:Level{lCode:n.level}) with n, ll
      MATCH (ses:SessionInformation{currentSession:true}) with n,ll, ses
      MERGE (n)-[r:IN_LEVEL {datePromoted:datetime({ timezone:"+01:00" }), activeStatus: 1, session: ses.sName}]->(ll)

      `;


    }


    query0[5] += ` return 1`;
//     let query00 =  `CALL apoc.periodic.iterate(`
// for (let i=0; i < 6; i++) {
//   query00 += query0[i] != '' ? `'${query0[i]}',` : '';
// }
// query00 += ` {batchSize:100,parallel:true}
// )`;

    let query01 = '';
    for (let i = 0; i < 6; i++) {
      query01 += query0[i] !== '' ? query0[i] : '';
    }

    //   let query00 = `CALL apoc.periodic.iterate(
    //     '${query0[0]}','${query0[1]}', '${query0[2]}','${query0[3]}','${query0[4]}', '${query0[5]}',
    //     ,{batchSize:100,parallel:false}
    // )`

    console.log("THIS IS QUERY AT SETSTUDENT::", query01);
    this.angularS1.writeDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          aAnswer = (data.results[i][0]);
        }
        responseQuali.next(parseFloat(aAnswer));
        responseQuali.complete();

      });

    return responseQuali;
  }

  async setStudent2(aStudent: Student, aStudy: Study, aNOKList: NextKin[],
                    aSponsorDetail?: SponsorDetails) {
    // this.angularS1.doConnect();
    let responseQuali: BehaviorSubject<number> = new BehaviorSubject<number>(0);

    let response = false ;
    let aAnswer: string;
    let aAnswer2: number = 0;

    const a = aStudent.dOB ?
      new Date(aStudent.dOB).toLocaleDateString('en-GB').split('/') :
      null;
    const b = aStudy.beginDate ? new Date(aStudy.beginDate).toLocaleDateString('en-GB').split('/')  : null;

    // console.log('split time StudyBegin::', b)
    let query0 = ['','', '','','',''];

    let query ="";
    let query2 = "";
    query0[0] = `MERGE (n:Student
      {studentNo: "${aStudent.studentNo}"})

      set n.title= "${aStudent.title ? aStudent.title : ''}"
      set n.lastName = toUpper(trim("${aStudent.lastName ? aStudent.lastName : ''}"))
      set n.firstName= toUpper(trim("${aStudent.firstName ? aStudent.firstName : ''}"))
      set n.middleName = toUpper(trim("${aStudent.middleName ? aStudent.middleName : ''}"))
      set n.email= toLower(trim("${aStudent.email ? aStudent.email : ""}"))
      set n.phone= "${aStudent.phone ? aStudent.phone : ''}"
      set n.gender= "${aStudent.gender ? aStudent.gender : ''}"
      set n.address= toUpper(trim("${aStudent.address ? aStudent.address : ''}"))
      set n.level= ${aStudent.level ? aStudent.level : null}
      set n.nin= "${aStudent.nin ? aStudent.nin : ''}"
      set n.activeStatus= ${aStudent.activeStatus}
      set n.studentType= ${aStudent.studentType}
      set n.programme= "${aStudent.programme ? aStudent.programme : ''}"

      set n.maritalStatus= "${aStudent.maritalStatus}"
      set n.state= "${aStudent.state}"
      set n.nationality= "${aStudent.nationality}"
      set n.religion= "${aStudent.religion}"
      set n.staffIn= "${aStudent.staffIn}"
      set n.creationStamp= toString(datetime({ timezone:"+01:00" }))
        `
    if (a && a !== undefined && a !== null && a[0] !== 'Invalid Date') {
      query0[0] += `set n.dOB = datetime({ year:${Number(a![2])},
            month:${Number(a![1])}, day:${Number(a![0])}, timezone:"+01:00" })`
    }

    // query0[0] += `return n`




    query2 = `MERGE (n:Student
      {
        title: "${aStudent.title ? aStudent.title : ''}",
        lastName: toUpper(trim("${aStudent.lastName ? aStudent.lastName : ''}")),
        studentNo: "${aStudent.studentNo ? aStudent.studentNo: ''}",
        firstName: toUpper(trim("${aStudent.firstName ? aStudent.firstName : ''}")),
        middleName: toUpper(trim("${aStudent.middleName ? aStudent.middleName : ''}")),
        email: toLower(trim("${aStudent.email ? aStudent.email : ""}")),
        phone: "${aStudent.phone ? aStudent.phone : ''}",
        gender: "${aStudent.gender ? aStudent.gender : ''}",
        address: toUpper(trim("${aStudent.address ? aStudent.address : ''}")),
        level: ${aStudent.level ? aStudent.level : null},
        nin: "${aStudent.nin ? aStudent.nin : ''}",
        activeStatus: ${aStudent.activeStatus},
        studentType: ${aStudent.studentType},
        programme: "${aStudent.programme ? aStudent.programme : ''}",

        maritalStatus: "${aStudent.maritalStatus}",
        state: "${aStudent.state}",
        nationality: "${aStudent.nationality}",
        religion: "${aStudent.religion}",







        staffIn: "${aStudent.staffIn}", `;
    // console.log('THIS IS A::', a);


    query2 +=
      ` creationStamp: toString(datetime({ timezone:"+01:00" })) })`;


    // query += ` with n MERGE (n)`
    query0[1] += ` with n MERGE (q:Study{jambNo: toUpper(trim("${aStudy.jambNo}"))})  `
    query0[2] += ` with n,q MERGE (n)-[:COMMENCED_STUDY]->(q) `;
    query0[2] += `set q.beginDate= datetime({ year:${Number(b![2])},
            month:${Number(b![1])}, day:${Number(b![0])}, timezone:"+01:00" })
            set q.beginSession= "${aStudy.beginSession ? aStudy.beginSession : ''}"
            set q.studentType= ${aStudy.studentType}
            set q.programme= "${aStudy.programme ? aStudy.programme : ''}"
            set q.status= "${aStudy.status ? aStudy.status : ''}"
            set q.staffIn= "${aStudy.staffIn ? aStudy.staffIn : ''}"

            set q.applicationNo= "${aStudy.applicationNo ? aStudy.applicationNo : ''}"
            set q.creationStamp= toString(datetime({ timezone:"+01:00" }))
            set q.isDeleted= false
        `;
    if (aNOKList.length > 0) {

      if (aNOKList[0].fullName && aNOKList[0].fullName !== 'phone') {
        query0[3] += ` with n MERGE (n)-[:HAS_NEXTOFKIN]->(qk:NextKin {
          creationStamp: toString(datetime({ timezone:"+01:00" })-duration("PT60S"))
        })
        set qk.title= "${aNOKList[0].title ? aNOKList[0].title : ''}"
      set qk.relationship= "${aNOKList[0].relationship ? aNOKList[0].relationship : ''}"
      set qk.fullName= toUpper(trim("${aNOKList[0].fullName && aNOKList[0].fullName !== 'phone'  ? aNOKList[0].fullName: ''}"))
      set qk.occupation= toUpper(trim("${aNOKList[0].occupation ? aNOKList[0].occupation : '' }"))

      set qk.phone= "${aNOKList[0].phone && aNOKList[0].phone !== 'email' ? aNOKList[0].phone : ''}"

      set qk.address= "${aNOKList[0].address ?aNOKList[0].address  : '' }"
      set qk.email= toLower(trim("${aNOKList[0].email ? aNOKList[0].email : ""}"))

        `;
      }

      else {
        query += ''
      }


      if (aNOKList.length > 1) {
        if (aNOKList[1].fullName && aNOKList[1].fullName !== 'phone') {
          query0[3] += ` with n MERGE (n)-[:HAS_NEXTOFKIN]->(q2:NextKin {
            creationStamp: toString(datetime({ timezone:"+01:00" }))
          })
          set q2.title= "${aNOKList[1].title ? aNOKList[1].title : ''}"
        set q2.relationship= "${aNOKList[1].relationship ? aNOKList[1].relationship : ''}"
        set q2.fullName= toUpper(trim("${aNOKList[1].fullName && aNOKList[1].fullName !== 'phone'  ? aNOKList[1].fullName: ''}"))
      set q2.occupation= toUpper(trim("${aNOKList[1].occupation ? aNOKList[1].occupation : '' }"))


        set q2.phone= "${aNOKList[1].phone && aNOKList[1].phone !== 'email' ? aNOKList[1].phone : ''}"

        set q2.address= toUpper(trim("${aNOKList[1].address ?aNOKList[1].address  : ''}"))
        set q2.email= toLower(trim("${aNOKList[1].email ? aNOKList[1].email : ""}"))

  `;
        }
        else {
          query += ''
        }

      }

      query0[3] += ` `
    }

    if (aSponsorDetail) {
      query0[4] += `
      with n MERGE (n)-[:HAS_SPONSOR]->(sp: Sponsor{
        creationStamp: toString(datetime({ timezone:"+01:00" }))
      })
    set sp.relationship= "${aSponsorDetail?.relationship}"
    set sp.fullName= toUpper(trim("${aSponsorDetail.fullName ? aSponsorDetail.fullName: ''}"))
  set sp.bank= toUpper(trim("${aSponsorDetail.bank ? aSponsorDetail.bank : '' }"))
  set sp.accountNumber= toUpper(trim("${aSponsorDetail.accountNumber ? aSponsorDetail.accountNumber : '' }"))
  set sp.accountName= toUpper(trim("${aSponsorDetail.accountName ? aSponsorDetail.accountName : '' }"))
  `;
    }

    if (aStudent.programme)
    {
      query0[5] +=
        `
      with n
      optional match (n)-[p:A_STUDENT_OF]-(qq) with n, p
      delete p
      with n
      MERGE (d: Programme{pName:"${aStudent.programme}"}) with n, d
      MERGE (n)-[:A_STUDENT_OF]-> (d)
      with n
      MERGE (ll:Level{lCode:n.level}) with n, ll
      MATCH (ses:SessionInformation{currentSession:true}) with n,ll, ses
      MERGE (n)-[r:IN_LEVEL {datePromoted:datetime({ timezone:"+01:00" }), activeStatus: 1, session: ses.sName}]->(ll)

      `;


    }


    query0[5] += ` return 1`;
    let query01 = ''
    // let query00 =  `CALL apoc.periodic.iterate('${query0[0]}',`
    for (let i=0; i < 6; i++) {
      query01 += query0[i] != '' ? query0[i] : '';
    }
// query00 = query00 + query01+ `,{batchSize:100,parallel:false})`;
// query00 = `CALL apoc.periodic.iterate(
//       '${query0[0]}','${query0[1]}', '${query0[2]}','${query0[3]}','${query0[4]}', '${query0[5]}',
//       ,{batchSize:100,parallel:false}
//   )`

    console.log("THIS IS QUERY AT SETSTUDENT::", query01);
    await this.angularS1.writeDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          aAnswer = (data.results[i][0]);
        }
        aAnswer2 = parseFloat(aAnswer);
        responseQuali.next((aAnswer2));

      });

    return aAnswer2;
    // return responseQuali;
  }

  setTempStudent(aStudent: TempStudent): BehaviorSubject<number> {
    // this.angularS1.doConnect();
    const responseQuali: BehaviorSubject<number> = new BehaviorSubject<number>(0);

    let aAnswer: string;

    const query = `MERGE (n:TempStudent
      {

        studentNo: "${aStudent.studentNo}",


        creationStamp: toString(datetime({ timezone:'+01:00' }))
      }) return "1"`;

    // console.log('set TEMPSTUDENT query:: ', query);
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     aAnswer = r[0];
    //     // console.log('r at the set temp student:: ', r[0]);
    //     // console.log('response at the set staff quali:: ', response);
    //   }
    //   // console.log('r at the set temp student:: ', aAnswer);
    //
    //   responseQuali.next(parseFloat(aAnswer));
    //
    //
    //   });


    this.angularS1.writeDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          aAnswer = (data.results[i][0]);
        }
        // aAnswer2 = parseFloat(aAnswer);
        responseQuali.next(parseFloat(aAnswer));

      });

    // console.log('response at the set temp student:: ', responseQuali);

    return responseQuali;
  }

  async setStudentGender(gender: string, studentNo: string) {
    // this.angularS1.doConnect();
    // const responseQuali: BehaviorSubject<number> = new BehaviorSubject<number>(0);

    let aAnswer = '0';

    const query = `MATCH (n:Student)
    where  n.studentNo = trim("${studentNo}") set n.gender = '${gender}'
    set n.title = '${gender === 'M' ? 'MR' : (gender === 'F' ? 'MS' : '')}'
     return "1"`;

    // console.log('set GENDER query:: ', query);
    // await this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     aAnswer = r[0];
    //     // console.log('r at the set temp student:: ', r[0]);
    //     // console.log('response at the set staff quali:: ', response);
    //   }
    //   // console.log('r at the set temp student:: ', aAnswer);
    //
    //
    //
    //   });


    await this.angularS1.writeDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          aAnswer = (data.results[i][0]);
        }
        // aAnswer2 = parseFloat(aAnswer);
        // responseQuali.next(parseFloat(aAnswer));

      });

    // console.log('response at the set temp student:: ', responseQuali);

    return (parseFloat(aAnswer));
  }

  promoteStudent(): AsyncSubject<number> {
    // this.angularS1.doConnect();
    const responseQuali: AsyncSubject<number> = new AsyncSubject<number>();

    let aAnswer: string;

    const query = `
    MATCH (st:Study{status: 'Ongoing'})<-[:COMMENCED_STUDY]-(n:Student)-[r:IN_LEVEL]->()
    set r.activeStatus = 0 with distinct(n) as nn

    with nn
    MERGE (ll:Level{lCode:nn.level+100}) with nn, ll
    MATCH (ses:SessionInformation{currentSession:true}) with nn,ll, ses
    MERGE (nn)-[rr:IN_LEVEL {datePromoted:datetime({ timezone:"+01:00" }), activeStatus: 1, session: ses.sName}]->(ll)
    set nn.level = ll.lCode
      return "1"`;


    this.angularS1.writeDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          aAnswer = (data.results[i][0]);
        }
        // aAnswer2 = parseFloat(aAnswer);
        responseQuali.next(parseFloat(aAnswer));

      });

    return responseQuali;
  }


  async updateStudy(aStudy: Study, aStudentNo: string): Promise<AsyncSubject<number> > {
    // this.angularS1.doConnect();
    let responseQuali2: AsyncSubject<number> = new AsyncSubject();
    let aAnswer: string;

    const b = new Date(aStudy.beginDate).toLocaleDateString('en-GB').split('/');
    const bb = aStudy.finishDate ? new Date(aStudy.finishDate).toLocaleDateString('en-GB' ).split('/'): null;
    let query = `match (s:Student{studentNo: '${aStudentNo}'})`;
    query += `with s
    merge (s)-[:COMMENCED_STUDY]->(q:Study{jambNo: '${aStudy.jambNo}'}) `;

    query += `set q.beginDate= datetime({ year:${Number(b![2])},
            month:${Number(b![1])}, day:${Number(b![0])}, timezone:"+01:00" })
            set q.beginSession= "${aStudy.beginSession ? aStudy.beginSession : ''}"
            set q.studentType= ${aStudy.studentType}
            set q.programme= "${aStudy.programme ? aStudy.programme : ''}"
            set q.status= "${aStudy.status ? aStudy.status : ''}"
            set q.staffIn= "${aStudy.staffIn ? aStudy.staffIn : ''}"

            set q.applicationNo= "${aStudy.applicationNo ? aStudy.applicationNo : ''}"
            set q.isDeleted= ${aStudy.IsDeleted ? true : false}
        `;
    if (!aStudy.creationStamp) {query += `  set q.creationStamp = toString(datetime({ timezone:"+01:00" })) `}
    if (aStudy.finishDate) {query += ` set q.finishDate = datetime({ year:${Number(bb![2])},
  month:${Number(bb![1])}, day:${Number(bb![0])}, timezone:"+01:00" })`;}
    query += ` return "1"`;

    // console.log("AT UPDATE STUDY:::", query);

    this.angularS1.writeDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          aAnswer = (data.results[i][0]);
        }
        // aAnswer2 = parseFloat(aAnswer);
        responseQuali2.next(parseFloat(aAnswer));

      });

    return responseQuali2;

  }


  updateStudent(aStudent: Student, aSponsorDetail?: SponsorDetails): AsyncSubject<number> {
    // this.angularS1.doConnect();
    const responseQuali2: AsyncSubject<number> = new AsyncSubject();

    const a = new Date(aStudent.dOB).toLocaleDateString('en-GB').split('/');
    // const b =  new Date(aStudy.beginDate).toLocaleDateString('en-GB').split('/');
    // let response = false ;
    let aAnswer: string;

    let query = `MATCH (n:Student{studentNo: "${aStudent.studentNo}"})


      set n.title = "${aStudent.title}"
      set n.lastName= toUpper(trim("${aStudent.lastName}"))
      set n.firstName= toUpper(trim("${aStudent.firstName}"))
      set n.middleName= toUpper(trim("${aStudent.middleName}"))
      set n.email= toLower(trim("${aStudent.email ? aStudent.email : ''}"))
      set n.phone= "${aStudent.phone}"
      set n.gender= "${aStudent.gender}"
      set n.address= toUpper(trim("${aStudent.address}"))
      set n.level= ${aStudent.level}
      set n.nin= "${aStudent.nin}"
      set n.activeStatus= ${aStudent.activeStatus}
      set n.studentType= ${aStudent.studentType}
      set n.programme= "${aStudent.programme}"
      set n.dOB= datetime({ year:${a[2]},
          month:${Number(a[1])}, day:${Number(a[0])}, timezone:"+01:00" })

      set n.maritalStatus = "${aStudent.maritalStatus}"
      set n.state= "${aStudent.state}"
      set n.nationality = "${aStudent.nationality}"
      set n.religion = "${aStudent.religion}" `;

    if (aSponsorDetail) {
      query += aSponsorDetail.creationStamp ? `
        with n MERGE (n)-
        [:HAS_SPONSOR]->(sp:Sponsor{creationStamp:
          "${aSponsorDetail.creationStamp }"}) ` :
        `
        with n MERGE (n)-
        [:HAS_SPONSOR]->(sp:Sponsor{creationStamp:
            toString(datetime({ timezone:"+01:00" }))})`;

      query += `
      set sp.relationship= "${aSponsorDetail?.relationship}"
      set sp.fullName= toUpper(trim("${aSponsorDetail.fullName ? aSponsorDetail.fullName: ''}"))
    set sp.bank= toUpper(trim("${aSponsorDetail.bank ? aSponsorDetail.bank : '' }"))
    set sp.accountNumber= toUpper(trim("${aSponsorDetail.accountNumber ? aSponsorDetail.accountNumber : '' }"))
    set sp.accountName= toUpper(trim("${aSponsorDetail.accountName ? aSponsorDetail.accountName : '' }"))

    set sp.title= toUpper(trim("${aSponsorDetail.title ? aSponsorDetail.title : '' }"))
    set sp.occupation= toUpper(trim("${aSponsorDetail.occupation ? aSponsorDetail.occupation : '' }"))
    set sp.email= toLower(trim("${aSponsorDetail.email ? aSponsorDetail.email : '' }"))
    set sp.phone= toUpper(trim("${aSponsorDetail.phone ? aSponsorDetail.phone : '' }"))
    set sp.address= toUpper(trim("${aSponsorDetail.address ? aSponsorDetail.address : '' }"))


    `;
    }

    if (aStudent.programme)
    {
      query +=
        `
        with n
        optional match (n)-[p:A_STUDENT_OF]-(q) with n, p
        delete p
        with n
        MERGE (d: Programme{pName:"${aStudent.programme}"}) with n, d
        MERGE (n)-[:A_STUDENT_OF]-> (d)




        `;

    }

    // with n
    //   match (n)-[pp:IN_LEVEL]->(qq:Level{lCode: n.level}) with n,pp
    //   set pp.activeStatus = 0
    // with n
    // MERGE (ll:Level{lCode:n.level}) with n, ll


    // MATCH (ses:SessionInformation{currentSession:true}) with n,ll, ses
    // MERGE (n)-[r:IN_LEVEL {datePromoted:datetime({ timezone:'+01:00' }), activeStatus: 1, session: ses.sName}]->(ll)


    query += ` return "1"`;

    // console.log("AT UPDATE STUDENT:::", query, aStudent,aSponsorDetail);


    this.angularS1.writeDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          aAnswer = (data.results[i][0]);
        }
        // aAnswer2 = parseFloat(aAnswer);
        responseQuali2.next(parseFloat(aAnswer));
        responseQuali2.complete();

      });

    return responseQuali2;
  }

  checkIfStudentExists(jambNo: string): AsyncSubject<string> {
    // this.angularS1.doConnect();
    const responseQuali2: AsyncSubject<string> = new AsyncSubject<string>();

    const response = false ;
    let aAnswer = '';

    const query = `MATCH (n:Student)-[]-(s:Study{jambNo: "${jambNo}"})
      return n.studentNo`;

    // console.log('update query checkIfStudentExists:*', query);
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     aAnswer = r[0];
    //     // console.log('r at the check exsint:: ', r, r[0]);
    //     // console.log('response at the set staff quali:: ', response);
    //   }
    //   responseQuali2.next(aAnswer);
    //   responseQuali2.complete();
    //
    //   });

    this.angularS1.queryDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          aAnswer = data.results[i][0];
        }
        responseQuali2.next(aAnswer);
        responseQuali2.complete();
      });


    return responseQuali2;
  }

  // tslint:disable-next-line:typedef
  async checkIfStudentExists2(jambNo: string) {
    // this.angularS1.doConnect();
    // let responseQuali2: AsyncSubject<string> = new AsyncSubject<string>();

    const response = false ;
    let aAnswer = '';

    const query = `MATCH (n:Student)-[]-(s:Study{jambNo: "${jambNo}"})
      return n.studentNo`;

    // console.log('update query checkIfStudentExists:*', query);
    // await this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     aAnswer = r[0];
    //     // console.log('r at the check exsint:: ', r, r[0]);
    //     // console.log('response at the set staff quali:: ', response);
    //   }
    //   // responseQuali2.next(aAnswer);
    //   // responseQuali2.complete();
    //
    //   });

    await this.angularS1.queryDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          aAnswer = data.results[i][0];
        }
        // responseQuali2.next(aAnswer);
        // responseQuali2.complete();
      });


    return aAnswer;
  }

  checkIfStudentExistsRegNo(jambNo: string): AsyncSubject<string> {
    // this.angularS1.doConnect();
    const responseQuali2: AsyncSubject<string> = new AsyncSubject<string>();

    const response = false ;
    let aAnswer = '';

    const query = `MATCH (n:Student{studentNo: "${jambNo}"})
      return n.studentNo`;

    // console.log('update query checkIfStudentExists:*', query);
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     aAnswer = r[0];
    //     // console.log('r at the check exsint:: ', r, r[0]);
    //     // console.log('response at the set staff quali:: ', response);
    //   }
    //   responseQuali2.next(aAnswer);
    //   responseQuali2.complete();
    //
    //   });


    this.angularS1.queryDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          aAnswer = data.results[i][0];
        }
        responseQuali2.next(aAnswer);
        responseQuali2.complete();
      });


    return responseQuali2;
  }

  // tslint:disable-next-line:typedef
  async checkIfStudentExistsRegNo2(jambNo: string)  {
    // this.angularS1.doConnect();
    const responseQuali2: AsyncSubject<string> = new AsyncSubject<string>();

    const response = false ;
    let aAnswer = '' ;

    const query = `MATCH (n:Student{studentNo: "${jambNo}"})
      return n.studentNo`;

    // console.log('update query checkIfStudentExists:*', query);
    // await this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     aAnswer = r[0];
    //     // console.log('r at the check exsint:: ', r, r[0]);
    //     // console.log('response at the set staff quali:: ', response);
    //   }
    //   responseQuali2.next(aAnswer);
    //   responseQuali2.complete();
    //
    //   });

    await this.angularS1.queryDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          aAnswer = data.results[i][0];
        }
        responseQuali2.next(aAnswer);
        responseQuali2.complete();
      });


    return aAnswer;
  }

  deleteStudent(aStudent: Student): AsyncSubject<number> {
    // this.angularS1.doConnect();
    const responseQuali3: AsyncSubject<number> = new AsyncSubject();


    const response = false ;
    let aAnswer: string;

    const query = `MATCH (n:Student{studentNo: "${aStudent.studentNo}"})
    set n.isDeleted = true
      return "1"`;

    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     aAnswer = r[0];
    //
    //   }
    //   responseQuali3.next(parseFloat(aAnswer));
    //
    //
    //   });

    this.angularS1.queryDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          aAnswer = data.results[i][0];
        }
        responseQuali3.next(parseFloat(aAnswer));
      });
    responseQuali3.complete();

    return responseQuali3;
  }

  deleteTempStudent(aStudent: TempStudent): AsyncSubject<number> {
    // this.angularS1.doConnect();
    const responseQuali3: AsyncSubject<number> = new AsyncSubject();


    const response = false ;
    let aAnswer: string;

    const query = `MATCH (n:TempStudent{studentNo: "${aStudent.studentNo}"})
    detach delete n
      return "1"`;

    // console.log('delete query: ', query);
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     aAnswer = r[0];
    //     // console.log('r at the delete staff kin:: ', r);
    //     // console.log('response at the set staff quali:: ', response);
    //   }
    //   responseQuali3.next(parseFloat(aAnswer));
    //
    //
    //   });

    this.angularS1.writeDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          aAnswer = data.results[i][0];
        }
        responseQuali3.next(parseFloat(aAnswer));
      });
    responseQuali3.complete();

    return responseQuali3;
  }

  getStudentType(): BehaviorSubject<StudentType[]> {
    // this.angularS1.doConnect();
    const answer: BehaviorSubject<[]> = new BehaviorSubject([]);

    const myQualificationList: StudentType[] = [] ;
    const query = `MATCH (n:StudentType) return n`;
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     myQualificationList.push(r[0].properties as StudentType);
    //   }


    //   });

    this.angularS1.queryDB(query, '2')
      .subscribe((data) => {
        if (data) {
          for (let i = 0; i < data.results.length; i++) {
            myQualificationList.push(data.results[i] as StudentType);
          }
          // answer.next(myQualificationList);

        }
      });
    return (new BehaviorSubject(myQualificationList));

  }

  getStudentNumber(): AsyncSubject<string> {
    // this.angularS1.doConnect();
    const responseQuali3: AsyncSubject<string> = new AsyncSubject();


    // let response = false ;
    let aAnswer: string = '';

    const query = `MATCH (n) WHERE EXISTS(n.studentNo) RETURN CASE max(n.studentNo) WHEN null THEN '0' ELSE
    max(n.studentNo) END`;
    this.angularS1.queryDB(query, '0')
      .subscribe((data) => {
        if (data) {
          for (let i = 0; i < data.results.length; i++) {
            aAnswer = data.results[i][0];
            console.log('student number found::', data.results[i]);
          }
          responseQuali3.next((aAnswer));
          responseQuali3.complete();
        }
      });

    return responseQuali3;
  }

  async getStudentNumber2(): Promise<string>  {
    // this.angularS1.doConnect();
    const responseQuali3: AsyncSubject<string> = new AsyncSubject();


    // let response = false ;
    let aAnswer: string = '' ;

    const query = `MATCH (n) WHERE EXISTS(n.studentNo) RETURN CASE max(n.studentNo) WHEN null THEN '0' ELSE
    max(n.studentNo) END`;
    await this.angularS1.queryDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          console.log('student no gotten::', data.results[i][0] );
          console.log('student no gotten::', data.results[i] );
          aAnswer = data.results[i][0];
        }
        // responseQuali3.next((aAnswer));
        // responseQuali3.complete();

      });




    return aAnswer;


  }

  async getStudentNumber22(): Promise<string>  {
    // this.angularS1.doConnect();
    const responseQuali3: AsyncSubject<string> = new AsyncSubject();


    const response = false ;
    let aAnswer = '' ;

    const query = `MATCH (n) WHERE n.studentNo is not null RETURN CASE max(n.studentNo) WHEN null THEN '0' ELSE
    max(n.studentNo) END`;

    // await this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     aAnswer = r[0];
    //
    //   }
    //   // responseQuali3.next(aAnswer);
    //   // responseQuali3.complete();
    //
    //
    //   });

    await this.angularS1.queryDB(query, '0')
      .subscribe((data) => {
        for (let i = 0; i < data.results.length; i++) {
          console.log('student no gotten::', data.results[i][0] );
          console.log('student no gotten::', data.results[i] );
          aAnswer = data.results[i][0];
        }
        // responseQuali3.next((aAnswer));
        // responseQuali3.complete();

      });




    return aAnswer;


  }


  // async getStudentNumber3(): Promise<string> {
  //   return from ((async () =>
  //   {
  //     // let aAnswer: string = '' ;
  //     const query = `MATCH (n) WHERE n.studentNo is not null RETURN CASE max(n.studentNo) WHEN null THEN '0' ELSE
  //   max(n.studentNo) END`;
  //     await this.angularS1.queryDB(query, '0')
  //       .subscribe((data) => {
  //         for (let i = 0; i < data.results.length; i++) {
  //           console.log('student no gotten::', data.results[i][0] );
  //           console.log('student no gotten::', data.results[i] );
  //           aAnswer = data.results[i][0];
  //         }
  //
  //       });
  //
  //
  //
  //
  //     return aAnswer;
  //   }
  //   )());
  //
  // }


}
