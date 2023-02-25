import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {


  private messageSource = new BehaviorSubject('');
  private messageSource2 = new BehaviorSubject('');

  private progressMessageSource = new BehaviorSubject(0);
  private progressMessageSource2 = new BehaviorSubject(0);


  currentMessage = this.messageSource.asObservable();
  currentProgressMessage = this.progressMessageSource.asObservable();
  currentProgressMessage2 = this.progressMessageSource2.asObservable();

  constructor() { }

  changeMessage(message: string) {
    this.messageSource.next(message)
  }
  changeMessage2(message: string) {
    this.messageSource2.next(message)
  }
  changeProgressMessage(message: number) {
    this.progressMessageSource.next(message)
  }

  changeProgressMessage2(message: number) {
    this.progressMessageSource2.next(message)
  }
}
