import { Injectable } from '@angular/core';
import { AngularNeo4jService } from 'angular-neo4j';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class KLoginService {
  loginUrl = environment.loginUrl;
  loginSuccess = false;

  loginAnswer: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(public angularS: AngularNeo4jService) {
  }

  doConnect(): void {
    const url = this.loginUrl;
    // const url = 'http://localhost:7474';
    const url2 =  'http://192.168.0.169:7474'
    const username = 'neo4j';
    const password = 'etimbuk12';
    const encrypted = true;

    fetch(url,{mode:'no-cors'})
    .then(()=> {
      console.log('url went')
      this.loginSuccess = true
    })
    .catch(()=> {this.loginSuccess = false})
    .finally(()=> {
      if (this.loginSuccess) {
        this. angularS
            .connect(
              url,
              username,
              password,
              encrypted
            )
            .then(driver => {
              alert('in then url')
              if (driver) {
                alert('in driver then url')
                console.log(`Successfully connected to ${url}`);
                this.loginAnswer.next(true)
                // this.loginSuccess = true;
              }
            });
      }
      else {
        this. angularS
            .connect(
              url2,
              username,
              password,
              encrypted
            )
            .then(driver2 => {
              alert('in then url2')
              if (driver2) {
                alert(`Successfully connected to ${url2}`)
                console.log(`Successfully connected to ${url2}`);
                this.loginAnswer.next(true)

                // this.loginSuccess = true;
              }
            })

      }

    })




          // .catch(() => {alert('in catch')})

          // .finally(() => {
          //   alert('in finally')
          //   if (!this.loginSuccess) {
          //     alert('INside2')
          //     this. angularS
          //       .connect(
          //         url2,
          //         username,
          //         password,
          //         encrypted
          //       )
          //       .then(driver2 => {
          //         if (driver2) {
          //           console.log(`Successfully connected to ${url2}`);
          //         }
          //       });
          //   }

          // })
          // ;





          // .catch(() => {
          //   console.log('IN CATCH2')
          //   alert('IN CATCH2')
          // });

    // }



  }
  doDisConnect(): void {
    this.angularS.disconnect();
  }

  }
