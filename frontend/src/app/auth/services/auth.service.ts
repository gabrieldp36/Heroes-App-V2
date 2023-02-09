import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map, switchMap,  catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {AuthResponse, Usuario, TokenResponse } from 'src/app/auth/interfaces/auth.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl: string = environment.baseUrl;
  private _Auth!: Usuario;
  private _imgRegex: RegExp = /^http[s]?:\/\/?.*$/;

  constructor(private http: HttpClient) {};

  public get auth(): Usuario {
    return { ...this._Auth} ;
  };

  public set setAuth(usuario: Usuario) {
    this._Auth = usuario;
  };

  public login(correo: string, password: string): Observable<boolean> {
    const body = { correo, password };
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, body)
    .pipe(
      switchMap( resp => {
        localStorage.setItem('token', resp.jwt!);
        return this.http.get<Usuario>(`${this.baseUrl}/uinfo`);
      }),
      tap ( resp => {
        this._Auth = resp;
      }),
      map( (_) => true),
      catchError( err => of(err.error.msg) ),
    );
  };

  public registro(nombre: string, correo: string, password: string): Observable<boolean>  { 
    const body = { nombre, correo, password };
    return this.http.post<AuthResponse>(`${this.baseUrl}/usuarios`, body)
    .pipe(
      switchMap( resp => {
        localStorage.setItem('token', resp.jwt!);
        return this.http.get<Usuario>(`${this.baseUrl}/uinfo`);
      }),
      tap ( resp => {
        this._Auth = resp;
      }),
      map( (_) => true),
      catchError( err => of(err.error.msg) ),
    );
  };

  public verificaAutenticacion(): Observable<boolean> {
    if ( !localStorage.getItem('token') ) {
      return of(false);
    };
    return this.http.get<TokenResponse>(`${this.baseUrl}/validar`)
    .pipe( 
      map ( (_) => true ),
      catchError( (_) => of(false) )
    );
  };

  public cargarDatosUsuarios(): Observable<boolean> {
    if( localStorage.getItem('token') ) {
      return this.http.get<Usuario>(`${this.baseUrl}/uinfo`)
      .pipe( 
        switchMap( user => {
          return this.http.get<Usuario>(`${this.baseUrl}/usuarios/${user.id}`);
        }),
        tap ( usuarioActualizado => {
          this._Auth = usuarioActualizado;
          if( !this.esImgUrl(usuarioActualizado.url_foto) ) {
            this._Auth.url_foto = '../../../assets/images/UserPlaceHolder.jpg';
          };
        }),
        map( (_) => true),
        catchError( (err) => of(err.error.msg) )
      );
    };
    return of(false);
  };

  public esImgUrl(img: string): boolean {
    if ( this._imgRegex.test(img) ) {
      return true;
    } else {
      return false;
    };
  };

  loguot (): void {
    localStorage.clear();
  };
};
