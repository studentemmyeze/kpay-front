import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Student } from '../interfaces/student';
import { environment } from 'src/environments/environment';
import { AsyncSubject, BehaviorSubject, Observable, Subscription } from 'rxjs';
import { threadId } from 'worker_threads';
import { I } from '@angular/cdk/keycodes';


@Injectable({
  providedIn: 'root'
})
export class EmailService {
  apiUrl = environment.apiUrl;
  emailSentStatus :any[]= []
  emailGroupStatus: any[] = []
  StudentData: Student[] = []
  emailAlreadyCreated: string[] = [];
  subscriptionCheckStatus: Subscription;
  subscriptionCreateEmail: Subscription;
  subscriptionJoinGroup: Subscription;
  emailDone= false;
  groupDoing = false
  groupDone= false;
  billsDone = false;

  responseEmail: BehaviorSubject<{emailSentStatus: any[],emailGroupStatus: any[], emailDone: boolean, groupDone: boolean }>
  = new BehaviorSubject<{emailSentStatus: number[],emailGroupStatus: number[], emailDone: boolean, groupDone: boolean }>
  ({emailSentStatus: [], emailGroupStatus: [], emailDone: false, groupDone: false});

  responseEmailAnswer:AsyncSubject<{emailSentStatus: number[],emailGroupStatus: number[] }>
  = new AsyncSubject<{emailSentStatus: number[],emailGroupStatus: number[] }>
  ();
  id: any;

  constructor(private https: HttpClient, private http: HttpClient, private http2: HttpClient
    ) {
      // this.id = setInterval(() => {
      //   this.checkStatus();
      // }, 50000);


      // this.checkStatus();

      // this.checkStatus();

      // this.responseEmail.subscribe((response) => {
      //   if (response.emailDone && response.groupDone) {

      //         this.responseEmailAnswer.next({emailSentStatus: response.emailSentStatus, emailGroupStatus: response.emailGroupStatus});
      //         this.responseEmailAnswer.complete();
      //         this.subscriptionCheckStatus.unsubscribe();
      //         this.subscriptionCreateEmail.unsubscribe();
      //         this.subscriptionJoinGroup.unsubscribe();

      //   }else
      //   if (response.emailDone) {
      //     this.sendNewStudentDataForGroup(this.StudentData);
      //   }
      // })


   }


ngOnInit(): void {

}

resetEverything(): void {
  this.emailDone= false;
  this.groupDoing = false
  this.groupDone= false
  this.emailSentStatus = []
  this.emailGroupStatus = []
  this.StudentData = []
  this.responseEmail.next(
    {emailSentStatus: this.emailSentStatus,
      emailGroupStatus:this.emailGroupStatus,
      emailDone: this.emailDone,
      groupDone: this.groupDone}
    );
    // this.id = setInterval(() => {
    //   this.checkStatus();
    // }, 50000);
}


// to be removed
getEmailStatus(): BehaviorSubject<any[]> {
  const BS: BehaviorSubject<any[]> = new BehaviorSubject <any[]>([]);

  let answer = []
  this.http.get<{status_message: string,
    time_taken: string,
    sent: number,
    errors: number,
    total:number}>(`${this.apiUrl}/api/status-send-bills`)
  .subscribe((data) => {
    answer = []
    console.log('@BillStatus::Received data from API', data)
    answer.push(data)
    BS.next(answer);
    BS.complete();
  });

  return BS;
}



  checkStatus(): void {

// to be removed
this.getEmailStatus()



    if (!this.groupDone || !this.emailDone) {
      this.subscriptionCheckStatus = this.http2.get<{message: string, status: number, data: any[]}>(`${this.apiUrl}/api/progressing`).subscribe((statusResponse) => {
        console.log('This is status response', statusResponse)
        const emailDoneList = statusResponse.data[0];
        const groupDoneList = statusResponse.data[1];
        // const emailAlreadyCreated = [];
        if (statusResponse.data && emailDoneList.length > 0 && !this.emailDone) {
          this.emailAlreadyCreated = []
          // console.log('CHECKSTATUS:::the value of Email created', statusResponse.data[0])
            for (let a of this.StudentData) {
              if (emailDoneList.includes(a.studentNo)) {
                this.emailAlreadyCreated.push(a.studentNo);
                // console.log('CHECKSTATUS:::Found IT', a)

              }
            }

        if (this.emailAlreadyCreated.length > 0) {
          this.emailDone = true;
        this.responseEmail.next(
          {emailSentStatus: this.emailAlreadyCreated, emailGroupStatus:[], emailDone: this.emailDone, groupDone: this.groupDone}
          )
        }

      }
        // const emailAlreadyCreated = statusResponse.data && statusResponse.data[0].length > 0 ?
        // this.StudentData.filter(sd => sd.studentNo = emailDone[0].includes(sd.studentNo)) : []
        else {
          if ( this.emailAlreadyCreated.length > 0 && groupDoneList.length < 1 && !this.groupDoing) {


          // console.log('INSIDE EMAIL LIST  > 0')
          // setTimeout(() => {

            this.groupDoing = true;
            this.sendNewStudentDataForGroup2(this.StudentData)
            .then((data) => {
              console.log('finished result for group',data)})
            .catch((err) => {console.log('Send New Student for email Promise rejected');})

          // }, 5000)


        }

        else if (groupDoneList.length > 0 && !this.groupDone) {
          this.groupDone = true;
          //this.emailDone = true;
          console.log('IT IS DONE', groupDoneList)
          this.responseEmail.next(
            {emailSentStatus: this.emailAlreadyCreated, emailGroupStatus:groupDoneList, emailDone: this.emailDone, groupDone: this.groupDone})

        }}

    });
    }
    // else {
    //   this.id = setInterval(() => {
    //     this.checkStatus();
    //   }, 50000);
    // }


}

  ngOnDestroy(){
    if (this.subscriptionCheckStatus) {this.subscriptionCheckStatus.unsubscribe();}
    // this.subscriptionCheckStatus.unsubscribe();
    if (this.subscriptionCheckStatus){ this.subscriptionCreateEmail.unsubscribe();}
    if (this.subscriptionCheckStatus) {this.subscriptionJoinGroup.unsubscribe(); }
    if (this.id) {
      clearInterval(this.id);
    }
 }

 async sendNewStudentData(studentData:Student[]) {
  //this.resetEverything();
  this.StudentData = studentData;
  // this.id = setInterval(() => {
  //   this.checkStatus();
  // }, 10000);



  await this.sendNewStudentData2(studentData)

  .then((data) => {
    console.log('finished result',data)
    this.responseEmail.next(
      {emailSentStatus: [1], emailGroupStatus:[], emailDone: true, groupDone: this.groupDone}
      )

    // setTimeout(() => {this.checkStatus();}, 3000)

  })
  .catch((err) => {console.log('Send New Student for email Promise rejected')})
 }

  sendNewStudentData_old(studentData: Student[]): void {
    // this.postUser(studentData);
    // const responseQuali: BehaviorSubject<any[][]> = new BehaviorSubject<any[][]>([][]);
    // for (let i = 0; i < studentData.length; i++) {
    //   this.emailGroupStatus.push(0);
    //   this.emailGroupStatus.push(0);
    // }
    // this.subscriptionCheckStatus.unsubscribe();
    this.responseEmail.next ({emailSentStatus: [], emailGroupStatus: [], emailDone: false, groupDone: false});

    this.StudentData = studentData;
    //this.responseEmail.next(new Array(this.emailSentStatus, this.emailGroupStatus));

    this.subscriptionCreateEmail = this.http.post<{message: string, status: number, data: any[]}>(`${this.apiUrl}/api/actions_gen_email`, studentData)
    .subscribe((data) => {
      console.log('Student data successfuly  sent to the API', data);
      this.checkStatus();
      // if (data.data.length > 0) {
        // this.emailSentStatus =  (data.data)
        // this.responseEmail.next(new Array(this.emailSentStatus, this.emailGroupStatus));
        // setTimeout(() => {
          // this.checkStatus();

        //   this.sendNewStudentDataForGroup(studentData);
        // }, 5000)

      // }


    });


    // return responseQuali

  }

  async sendNewStudentData2(studentData:Student[]) {
    return  this.http.post<{message: string, status: number, data: any[]}>(`${this.apiUrl}/api/actions_gen_email`, studentData)
    .toPromise()
    .then();
  }

  sendNewStudentDataForGroup2(studentData:Student[]) {
    return  this.http.post<{message: string, status: number, data: any[]}>(`${this.apiUrl}/api/actions_add_2group`, studentData)
    .toPromise();
  }

  sendNewStudentDataForGroup(studentData: Student[]): void {
    // this.postUser(studentData);
    console.log('IN sendNewStudentDataForGroup')
    this.subscriptionJoinGroup = this.http.post<{message: string, status: number, data: any[]}>(`${this.apiUrl}/api/actions_add_2group`, studentData)
    .subscribe((data) => {
      console.log('Student data successfuly  sent to the API for group', data);
      // setTimeout(() => {
      // this.checkStatus();
      // },5000);
      // if (data.data && data.data.length > 0) {
        // this.emailGroupStatus =  (data.data);
        // this.responseEmail.next({emailSentStatus:this.emailSentStatus, emailGroupStatus: this.emailGroupStatus});
        //console.log('Student data for Group successfuly  sent to the API', data)

      // }



    });
  }

  // getHeroes(): Observable<{message: string, status: number, data: any[]}> {
  //   return this.http.get<{message: string, status: number, data: any[]}>(`${this.apiUrl}/api/progressing`)
  // }



}

