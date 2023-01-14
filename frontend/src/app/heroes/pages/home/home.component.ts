import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { AuthService } from '../../../auth/services/auth.service';

import { Usuario } from 'src/app/auth/interfaces/auth.interfaces';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: [
   `
    .containers {
      margin: 15px;
    }
   `
  ]
})
export class HomeComponent implements OnInit {

  public imgPerfil = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {};
  
  public ngOnInit(): void {
    this.authService.cargarDatosUsuarios().subscribe();
  };

  public get usuario (): Usuario {
    return this.authService.auth;
  };

  public get usurioImg(): string {
    return this.authService.auth.url_foto || '../../../assets/images/UserPlaceHolder.jpg';
  };

  public logout(): void {
    this.authService.loguot();
    this.router.navigate(['./auth']);
  };
};
