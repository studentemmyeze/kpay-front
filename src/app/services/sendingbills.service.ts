import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import {sendMail} from 'src/assets/js/server.js';

import { GoogleApis } from 'googleapis';
import { ScriptService } from './script.service';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';

export interface EmailSendingStatus {
  current: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})


export class SendingbillsService {
  apiUrl = environment.apiUrl;
  aStatus: EmailSendingStatus = {
    current: 0,
    total: 0
  }
  constructor(
    private http: HttpClient
  ) {
    // sendMail();

   }


  sendEmailData(emailData: any[]): void {
    this.aStatus.current = 0
    this.aStatus.total = 0


    this.http.post<{message: string}>(`${this.apiUrl}/api/send-bills`, emailData)

    // this.http.post<{message: string}>(`${this.apiUrl}/api/post`, emailData)
    .subscribe((data) => {
      console.log('Received data from API', data)


    });
  }

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
      console.log('Received data from API', data)
      answer.push(data)
      BS.next(answer);
      BS.complete();
    });

    return BS;
  }
}
