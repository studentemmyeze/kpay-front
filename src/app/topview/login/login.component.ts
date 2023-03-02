import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import * as fromApp from 'src/app/app.reducer' ;
// import { Store } from '@ngrx/store';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private userService: UserService,
              private router: Router,
    // private store: Store<{ui:fromApp.State}>
    ) { console.log('inside the cost of login!!');
  }

  // createUser(): void {

  // }
  ngOnInit(): void {
    this.errorMessage = '';
    if (this.userService.isLogged()) {
            this.navigateTo();
        }
    // console.log('IN LOGIN COMPONENT');
  }




// tslint:disable-next-line:typedef
public navigateTo(url?: string) {
    console.log('in navigate to');
    url = url || 'nav';
    // this.store.dispatch({type: 'START_LOADING'});
    this.router.navigate([url], { replaceUrl: true });
}

// public login4(username: string, password: string) {
//   this.userService.signIn(username, password).then(data => {
//     console.log('THIS IS LOGIN RESULT', data);
//     if (data) {
//       this.navigateTo();
//     }

//   });
// }

// tslint:disable-next-line:typedef
public login5(username: string, password: string) {
  // console.log('AT LOGIN5::', this.email, this.password);
  this.userService.signIn(username, password)
  .subscribe(data => {
    // console.log('THIS IS LOGIN RESULT', data);
    if (data) {
      this.navigateTo();
    }

  });

}

}
