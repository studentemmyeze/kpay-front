import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../app/services/user.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: UserService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot):
    Observable<boolean | UrlTree> |
    Promise<boolean | UrlTree> | boolean
    | UrlTree {
      if (this.authService.isLogged()) {
        this.authService.redirectUrl = ''; // null;
        return true;
  }

      this.authService.redirectUrl = state.url;
      this.router.navigate(['']);
      return false;
}
  
}
