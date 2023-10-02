import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { AsyncSubject, AsyncSubject } from 'rxjs/internal/AsyncSubject';
import {BehaviorSubject, AsyncSubject, Observable, of} from 'rxjs';
import { NextKin, Applications } from '../interfaces/student';
import { KLoginService } from './klogin.service';
import * as XLSX from 'xlsx';
// @ts-ignore
import saveAs from 'save-as';
import { SettingsService } from './settings.service';
// import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  public userArray: Applications[] = [];
  public applicationList: AsyncSubject<Applications[]> = new AsyncSubject<Applications[]>();


  constructor(
    public angularS1: KLoginService,
    private http: HttpClient, private settingsService: SettingsService
  ) {
    // this.loadStudentNextOfKin2();
  }

  loadStudentApplication(source: number): AsyncSubject<boolean> {

    const answer: AsyncSubject<boolean> = new AsyncSubject<boolean>();

    const resource = source ?
      'https://api.topfaith.edu.ng/admin/admission/application/download-all' :
      '/assets/admissions_update.xlsx';

    this.http.get(resource, {
      // Any custom client side headers like Authorization
      observe: 'response',
      responseType: 'arraybuffer'
    })

      .subscribe((data) =>{

          if (this.readExcelFile(data.body)) {
            answer.next(true)
            answer.complete();
          }
          else {
            answer.next(false);
            answer.complete();
          }

        }, (error: any) => {
          console.log(error);
          answer.next(false);
          answer.complete();}

      );
    return answer;
  }

  loadStudentApplication_test(source: number): void {
    this.getApplications(source)

      .subscribe((data) =>{

        if (data) {
          console.log('this is applicationData::::',data)
          console.log('this is applicationDataBody::::',data.body)
          // console.log('this is applicationDataBody::::',data.body)


          source ? this.downloadFile(data,'admissions_update.xlsx') : '';
          this.readExcelFile(data.body);

        }

      });
  }

  getApplications(source: number): Observable<any> {
    const resource = source ?
      'https://api.topfaith.edu.ng/admin/admission/application/download-all' :
      '/assets/admissions_update.xlsx';
    return this.http.get<any>(resource, {})
      .pipe(
        tap(_ => console.log ('fetched the applications')),
        catchError(this.handleError<any>('getApplications', undefined))

      )
  }
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  readExcelFile(arrayBuffer:any): boolean {
    let answer = false;
    var data = new Uint8Array(arrayBuffer);
    // console.log('ARRAYB:::', data);
    var arr = new Array();
    for(var i = 0; i != data.length; ++i) {arr[i] = String.fromCharCode(data[i]);}
    var bstr = arr.join("");
    // console.log('bstr::', bstr);
    var workbook = XLSX.read(bstr, {type:"binary"});
    var first_sheet_name = workbook.SheetNames[0];
    var worksheet = workbook.Sheets[first_sheet_name];
    // console.log(XLSX.utils.sheet_to_json(worksheet,{raw:true}));
    var arraylist = XLSX.utils.sheet_to_json(worksheet,{raw:true});
    // this.filelist = [];
    // console.log(arraylist)
    this.loadProspectiveStudent(arraylist);
    if (arraylist.length > 0) {answer =  true;}
    return answer;


    // }
  }

  public downloadFile(response: any, fileName: string) {
    const blob = new Blob([response.body], { type: response.headers.get('content-type') });
    // fileName = fileName || response.headers.get('content-disposition').split(';')[0];
    // const file = new File([blob], fileName, { type: response.headers.get('content-type') });
    // saveAs(file);
    saveAs(blob, fileName);

  }

  loadProspectiveStudent(arrayFromApi: any[]): void {
    this.userArray = [];
    arrayFromApi.forEach(e => {
      const checkValidStudent =  (e['Jamb Registration number'] ? e['Jamb Registration number'] : '');
      if (checkValidStudent !== '' && !checkValidStudent.toString().toUpperCase().includes('NIL' ))
      {
        this.userArray.push(
          {
            applicationNo: e['Application Registration Number'] ? e['Application Registration Number'] : '',
            jambNo: e['Jamb Registration number'] ? e['Jamb Registration number'] : '',
            lastName: e['Last name'] ? e['Last name'] : '',
            firstName: e['First name'] ? e['First name'] : '',
            middleName: e['Middle name'] ? e['Middle name'] : '',
            dOB: new Date(e['Date of birth']) ? e['Date of birth'] : new Date(),
            gender: e['Gender'] === 'Male' ? 'M' : (e['Gender'] === 'Female' ? 'F': '' ),
            nationality: e['Nationality'] ? e['Nationality'] : '',
            state: e['State'] ? e['State'] : '',
            nin: e['NIN'] ? e['NIN'] : '',
            maritalStatus: e['Marital Status'] ? e['Marital Status'] : '',
            religion: e['Religion'] ? e['Religion'] : '',
            phone: e['Phone'] ? e['Phone'] : '',
            email: e['Email'] ? e['Email'] : '',
            address: e['Address'] ? e['Address'] : '',
            guardians1: e['Guardian One'] ?
              { fullName: ((e['Guardian One'].split(':'))[1] ) ?
                  ((e['Guardian One'].split(':'))[1] ).split('\"')[1] : "" as string,
                phone: ((e['Guardian One'].split(':'))[2] ) ? ((e['Guardian One'].split(':'))[2] ).split('\"')[1]: "" as string,
                email: ((e['Guardian One'].split(':'))[3] ) ? ((e['Guardian One'].split(':'))[3] ).split('\"')[1]: "" as string ,
              } as NextKin : {},

            guardians2: e['Guardian Two'] ? { fullName: ((e['Guardian Two'].split(':'))[1] ) ? ((e['Guardian Two'].split(':'))[1] ).split('\"')[1]: "" as string,
              phone: ((e['Guardian Two'].split(':'))[2] ) ? ((e['Guardian Two'].split(':'))[2] ).split('\"')[1]: "" as string,
              email: ((e['Guardian Two'].split(':'))[3] ) ? ((e['Guardian Two'].split(':'))[3] ).split('\"')[1]: "" as string ,
            } as NextKin : {},

            beginSession: e['Academic SessionController'] ? e['Academic SessionController'] : '',
            department1: e['First Choice Course'] ? this.check4Amphersand(e['First Choice Course']) : '',
            department2: e['Second Choice Course'] ? this.check4Amphersand(e['Second Choice Course']) : "",
            dateCreated: new Date(e['Date Created'])



          } as Applications

        );
      }

    });
    this.applicationList.next(this.userArray);
    this.applicationList.complete();

    // console.log( this.userArray);


  }

  check4Amphersand(aProgramme: string): string {
    let answer = aProgramme ? aProgramme.toLowerCase() : ''
    if (answer.includes(' and ')) {
      let tempA = answer.split(' and ').join(' & ')
      answer = tempA
    }
    return answer.toUpperCase()
  }


  loadStudentNextOfKin2_old(): void {
    // const factory = new ImporterFactory();
    // const importer = new Importer(workbook);

    this.http.get('/assets/admissions_update.csv', {responseType: 'text'})
      .subscribe(
        data => {
          let csvToRowArray = data.split("\n");
          let aa = data;
          let aString: string = "";
          this.userArray = [];
          // aString.
          // console.log("RAW DATA:::", data);
          for (let index = 1; index < csvToRowArray.length - 1; index++) {
            let row = csvToRowArray[index].split(",");
            let beginIndex = 14;
            let beginIndex2 = 17;
            let beginIndex3 = 17;


            let checkString = row[14].split(':')[0];
            if (!checkString.includes('name')){
              let marker = false;
              for (let a=0; a < row.length && !marker; a++) {
                // console.log("IN INNER FOR LOOP")
                try {
                  let tempCheckString = row[a].split(':')[0];
                  if (tempCheckString.includes('name')) {
                    marker = true;
                    beginIndex = a;
                  }
                } catch (error) {

                }

              }
            }

            let checkString2 = row[17].split(':')[0];
            if (!checkString.includes('name')){
              let marker = false;
              for (let a=beginIndex; a < row.length && !marker; a++) {
                // console.log("IN INNER FOR LOOP")
                try {
                  let tempCheckString = row[a].split(':')[0];
                  if (tempCheckString.includes('name')) {
                    marker = true;
                    beginIndex3 = a;
                  }
                } catch (error) {

                }

              }
            }

            let marker2 = false;
            for (let a=beginIndex; a < row.length && !marker2; a++) {
              // console.log("IN INNER FOR LOOP")
              try {
                let tempCheckString = row[a];
                if (tempCheckString.includes('2021/2022')) {
                  marker2 = true;
                  beginIndex2 = a;
                }
              } catch (error) {

              }

            }

            // console.log("GUARDIAN RAWW:::",checkString,row,
            //  ((row[beginIndex].split(':'))[1] )  ? ((row[beginIndex].split(':'))[1] ).split('"')[2]: undefined ,
            //  ((row[beginIndex].split(':'))[1] ) ? ((row[beginIndex].split(':'))) : undefined ,

            //  ((row[beginIndex + 1].split(':'))[1] )? ((row[beginIndex + 1].split(':'))[1] ).split('"')[2]: undefined ,
            //  ((row[beginIndex + 1].split(':'))[1] ) ? ((row[beginIndex + 1].split(':'))) : undefined ,

            //  row[beginIndex + 2].split(':'),

            //  ((row[beginIndex + 2].split(':'))[1] ) ? ((row[beginIndex + 2].split(':'))[1] ).replace("}", ""): undefined,
            //  ((row[beginIndex + 2].split(':'))[1] ) ? ((row[beginIndex + 2].split(':')) ): undefined
            //  ) ;

            // console.log("GUARDIAN 1:::", row.length,row[14],row[15],row[16], {
            //   fullName: ((row[beginIndex].split(':'))[1] ) ? ((row[beginIndex].split(':'))[1] ).split('"')[2]: "" as string,
            //   phone: ((row[beginIndex + 1].split(':'))[1] ) ? ((row[beginIndex + 1].split(':'))[1] ).split('"')[2]: "" as string,
            //   email: ((row[beginIndex + 2].split(':'))[1] ) ? ((row[beginIndex + 2].split(':'))[1] ).replace("}", "").split('"')[2]: "" as string ,



            // } as aNextKin);
            if (row.length > 30)
              this.userArray.push(
                {
                  jambNo: row[0],
                  lastName: row[1],
                  firstName: row[2],
                  middleName: row[3],
                  dOB: new Date(row[4]),
                  gender: row[5],
                  nationality: row[6],
                  state: row[7],
                  nin: row[8],
                  maritalStatus: row[9],
                  religion: row[10],
                  phone: row[11],
                  email: row[12],
                  address: (beginIndex === 14 ? row[13]: this.addStrings(row, beginIndex ) ),
                  guardians1: {                fullName: ((row[beginIndex].split(':'))[1] ) ? ((row[beginIndex].split(':'))[1] ).split('"')[2]: "" as string,
                    phone: ((row[beginIndex + 1].split(':'))[1] ) ? ((row[beginIndex + 1].split(':'))[1] ).split('"')[2]: "" as string,
                    email: ((row[beginIndex + 2].split(':'))[1] ) ? ((row[beginIndex + 2].split(':'))[1] ).replace("}", "").split('"')[2]: "" as string ,
                  } as NextKin,
                  guardians2:  {                fullName: ((row[beginIndex3].split(':'))[1] ) ? ((row[beginIndex3].split(':'))[1] ).split('"')[2]: "" as string,
                    phone: ((row[beginIndex3 + 1].split(':'))[1] ) ? ((row[beginIndex3 + 1].split(':'))[1] ).split('"')[2]: "" as string,
                    email: ((row[beginIndex3 + 2].split(':'))[1] ) ? ((row[beginIndex3 + 2].split(':'))[1] ).replace("}", "").split('"')[2]: "" as string ,
                  } as NextKin,
                  beginSession: row[beginIndex2],
                  department1: row[beginIndex2 + 1],
                  department2: row[beginIndex2 + 2] ? row[beginIndex2 + 2] : "",
                  dateCreated: new Date(row[row.length - 1])



                } as Applications

              );
          }
          this.applicationList.next(this.userArray);
          this.applicationList.complete();
          // console.log( this.userArray);
        },
        error => {
          console.log(error);
        }
      );
  }

  // this.sendConcat(string, begAud: string)
  addStrings(aList: string[], beginForKin: number) : string{
    let answer = "";
    for (let i = 13; i < beginForKin; i++) {
      answer = answer + (aList[i].replace('"', '')).replace(/\\/g, '');
    }



    return (answer.replace('"', '')).replace(/\\/g, '');
  }


  getNationalities(): BehaviorSubject<string[]> {
    //this.angularS1.doConnect();
    const Answer: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
    const myNList: string[] = [] ;
    const query = `MATCH (n:Nationality) return n.dName order by n.dName`;
      this.angularS1.queryDB(query, '0')
    .subscribe((data) => {
      if (data) {
        for (let i = 0; i < data.results.length; i++) {
          // console.log("Nationalities::", (data.results[i]))
          myNList.push(data.results[i][0]);
        }
        Answer.next(myNList);
      }

  });





    return Answer;
  }

  getNigeriaStates(): BehaviorSubject<string[]> {
    // this.angularS1.doConnect();
    const Answer: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
    const myNList: string[] = [] ;
    const query = `MATCH (n:NigeriaStates) return n.dName order by n.dName`;
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     myNList.push(r[0]);
    //   }

    //   });

    this.angularS1.queryDB(query, '0')
    .subscribe((data) => {
      if (data) {
        for (let i = 0; i < data.results.length; i++) {
          // console.log("Nationalities::", (data.results[i]))
          myNList.push(data.results[i][0]);

        }
        Answer.next(myNList);
      }

  });

    return Answer;

  }

  getProgrammes(): BehaviorSubject<string[]> {
    // this.angularS1.doConnect();
    const Answer:BehaviorSubject<string[]> = new BehaviorSubject([])
    const myNList: string[] = [] ;
    const query = `MATCH (n:Programme)-[]-(f:Faculty) return n.pName order by n.pName`;
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     myNList.push(r[0]);
    //   }

    //   });
    this.angularS1.queryDB(query, '0')
    .subscribe((data) => {
      if (data) {
        for (let i = 0; i < data.results.length; i++) {
          // console.log("Nationalities::", (data.results[i]))
          myNList.push(data.results[i][0]);

        }
      }

  });

    return Answer.next(myNList);

  }

  getFaculties(): BehaviorSubject<string[]> {
    // this.angularS1.doConnect();
    const Answer: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
    const myNList: string[] = [] ;
    const query = `MATCH (n:Faculty) return n.dCode order by n.dCode`;
    // this.angularS1.angularS.run(query).then((res: any) => {
    //   for (const r of res) {
    //     myNList.push(r[0]);
    //   }

    //   });
    this.angularS1.queryDB(query, '0')
    .subscribe((data) => {
      if (data) {
        for (let i = 0; i < data.results.length; i++) {
          // console.log("Nationalities::", (data.results[i]))
          myNList.push(data.results[i][0]);

        }
        Answer.next(myNList)
      }

  });
    return Answer;

  }
}
