import { Injectable } from '@angular/core';

import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment} from '@angular/router';

import { Observable } from 'rxjs';

import { tap } from 'rxjs/operators';

import Swal from 'sweetalert2';

import { AuthService } from '../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanLoad {

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {};

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.verificaAutenticacion()
    .pipe( tap ( estaAutenticado => {
        if ( !estaAutenticado ) {
          this.router.navigate(['auth/login']);
          localStorage.clear()
          Swal.fire( {
            icon: 'warning',
            title: 'Sesión expirada',
            text: `Por favor vuelva a iniciar sesión`,
            returnFocus: false
          });
        };
      }),
    );
  };

  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.verificaAutenticacion()
    .pipe( tap ( estaAutenticado => {
        if ( !estaAutenticado ) {
          this.router.navigate(['auth/login']);
          localStorage.clear()
          Swal.fire( {
            icon: 'warning',
            title: 'Sesión expirada',
            text: `Por favor vuelva a iniciar sesión`,
            returnFocus: false
          });
        };
      }),
    );
  };
};
