import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '../utilities/format-datepicker';

@Component({
  selector: 'app-rootnav',
  templateUrl: './rootnav.component.html',
  styleUrls: ['./rootnav.component.css'],
  providers: [
    {provide: DateAdapter, useClass: AppDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS}
]
})
export class RootnavComponent {
  typesOfShoes: string[] = ['Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

    Level: string ;
    User: string ;
    Name: string ;



  constructor(private breakpointObserver: BreakpointObserver,
              private userService: UserService,
              private router: Router,
              private route: ActivatedRoute
              ) {
                // todays date
                this.Level = userService.getLevel();
                this.Name = userService.getUserName();
                this.User = userService.getUser();


                const a = new Date(new Date()).toLocaleDateString('en-GB').split('/');

                // last login date
                const b = new Date(new Date(this.userService.getLoginNodeID())).toLocaleDateString('en-GB').split('/');
                // console.log('Time difference::', a , b, userService.getLevel());
                // if (a !== b) {
                //   this.userService.logout();
                // }
                setTimeout(()=> {
                  if (a[0] !== b[0] || a[1] !== b[1] || a[2] !== b[2]) {
                    // console.log('INSIDE THE TIME IF', a, b);
                  this.userService.logout();
                }
                }, 2000);

              }

  // aLogOut_old(): void {
  //   this.userService.logout(). then((data) => {
  //     if (data)
  //     {
  //       console.log('JUST BEFORE NAVIGATE');
  //       this.router.navigate(['login'], { replaceUrl: true });

  //     }
  //   });


  // }

  aLogOut(): void {
    // console.log('LOGIN NOde ID::::', this.userService.getLoginNodeID());
    this.userService.logout().subscribe((data) => {
      // if (data)
      {
        // console.log('JUST BEFORE NAVIGATE');
        this.router.navigate(['login'], { replaceUrl: true });

      }
    });


  }

  aLogOutError(): void {
    this.userService.logout1(). then((data) => {
      if (data)
      {
        // console.log('JUST BEFORE NAVIGATE');
        this.router.navigate(['login'], { replaceUrl: true });

      }
    });


  }

  getLevel(): string { return this.userService.getLevel(); }
  getUser(): string { return this.userService.getUser(); }
  getName(): string { return this.userService.getUserName(); }



  aHandOver(): void {
    // this.userService.logout();
    this.router.navigate(['handover'], { replaceUrl: true });


  }

  isAllowed(aLink: string): boolean {
    let answerReturned = true;
    const level = this.userService.getLevel();
    const answer = (/USER/i).test(level);
    if (answer) {
      if (aLink === 'settings') {answerReturned = false; }
      if (aLink === 'bills') {answerReturned = false; }
      if (aLink === 'paymentinfo') {answerReturned = false; }
      if (aLink === 'makepay') {answerReturned = false; }


    }


    return answerReturned;
  }

navigate(path: string): void {
    this.router.navigate([{outlets: {primary: path, nav:path}}],
                         {relativeTo: this.route});
}



}
