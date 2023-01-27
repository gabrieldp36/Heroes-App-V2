import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';

import { tap, map, switchMap,  catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

import { Heroe, Comentario, ComentarioPost, ComentarioPorId, ComentarioAdmin } from '../interfaces/heroes.interfaces';

import { Usuario, AuthResponse } from '../../auth/interfaces/auth.interfaces';

import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class HeroesService {

  private baseUrl: string = environment.baseUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {};

  /************API USUARIOS*************/

  public popularFormulario(): Observable<Boolean> {
    if( localStorage.getItem('token') ) {
      return this.http.get<Usuario>(`${this.baseUrl}/uinfo`)
      .pipe( 
        switchMap( user => {
          return this.http.get<Usuario>(`${this.baseUrl}/usuarios/${user.id}`);
        }),
        tap ( usuarioActualizado => {
          this.authService.setAuth = usuarioActualizado;
        }),
        map( (_) => true),
        catchError( (err) => of(err.error.msg) )
      );
    };
    return of(false);
  };

  public obtenerUsuarioActualizado(): Observable<Boolean> {
    if( localStorage.getItem('token') ) {
      return this.http.get<Usuario>(`${this.baseUrl}/uinfo`)
      .pipe( 
        switchMap( user => {
          return this.http.get<Usuario>(`${this.baseUrl}/usuarios/${user.id}`);
        }),
        tap ( usuarioActualizado => {
          this.authService.setAuth = usuarioActualizado;
        }),
        map( (_) => true),
        catchError( (err) => of(err.error.msg) )
      );
    };
    return of(false);
  };

  public getUsuarios(): Observable<Usuario[]> {
    if( localStorage.getItem('token') ) {
      return this.http.get<Usuario[]>(`${this.baseUrl}/usuarios`);
    };
    return of([]);
  };

  public actualizarPerfil(nombre: string,  url_foto: string, correo: string, password: string): Observable<boolean>  { 
    const body = { nombre,  url_foto, correo, password };
    return this.http.get<Usuario>(`${this.baseUrl}/uinfo`)
    .pipe(
      switchMap( user => {
        return this.http.patch<AuthResponse>(`${this.baseUrl}/usuarios/${user.id}`, body)
      }),
      map( (_) => true),
      catchError( err => of(err.error.msg) ),
    );
  };

  public eliminarCuenta(): Observable<boolean>  { 
    return this.http.get<Usuario>(`${this.baseUrl}/uinfo`)
    .pipe(
      switchMap( user => {
        return this.http.delete<AuthResponse>(`${this.baseUrl}/usuarios/${user.id}`)
      }),
      map( (_) => true),
      catchError( err => of(err.error.msg) ),
    );
  };

  public bloquearUsuario(id: number): Observable<boolean>  { 
    return this.http.delete<AuthResponse>(`${this.baseUrl}/usuarios/${id}`)
    .pipe(
      map( (_) => true),
      catchError( err => of(err.error.msg) ),
    );
  };

  public reactivarUsuario(id: number): Observable<boolean>  { 
    return this.http.patch<AuthResponse>(`${this.baseUrl}/reactivar/${id}`,{})
    .pipe(
      map( (_) => true),
      catchError( err => of(err.error.msg) ),
    );
  };

  /************API HÉROES*************/

  public getHeroes(): Observable<Heroe[]> {
    return this.http.get<Heroe[]>(`${this.baseUrl}/heroes`);
  };

  public getHeroesPorId(id: string): Observable<Heroe> {
    return this.http.get<Heroe>(`${this.baseUrl}/heroes/${id}`);
  };

  public getHeroesPropios(id_usuario: number): Observable<Heroe[]> {
    return this.http.get<Heroe[]>(`${this.baseUrl}/propios/${id_usuario}`);
  };

  public getHeroesPropiosIds(): Observable<number[]> {

    return this.http.get<Usuario>(`${this.baseUrl}/uinfo`)
    .pipe( 
      switchMap( user => {
        return this.http.get<Heroe[]>(`${this.baseUrl}/propios/${user.id}`);
      }),
      map( (heroesPropios) => {
        const heroesId: number[] = [];
        heroesPropios.map( (heroe) =>  {
          heroesId.push(heroe.id)
        });
        return heroesId;
      }),
    );
  };

  public getSugerencias(termino: string): Observable<Heroe[]> {
    return this.http.get<Heroe[]>(`${this.baseUrl}/buscar?termino=${termino}&limite=5`);
  };

  public agregarHeroe(heroe: Heroe): Observable<Heroe> {
    return this.http.post<Heroe>(`${this.baseUrl}/heroes`, heroe);
  };

  public actualizarHeroe(heroe: Heroe): Observable<Heroe> {
    return this.http.patch<Heroe>(`${this.baseUrl}/heroes/${heroe.id}`, heroe);
  };

  public borrarHeroe(id: number): Observable<{}> {
    return this.http.delete<{}>(`${this.baseUrl}/heroes/${id}`);
  };

  /************API COMENTARIOS*************/

  public getComentarios(idHeroe: number): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(`${this.baseUrl}/comentarios/${idHeroe}`);
  };

  public getComentariosAdmin(): Observable<ComentarioAdmin[]> {
    return this.http.get<ComentarioAdmin[]>(`${this.baseUrl}/comentarios`);
  };

  public agregarComentario(comentario:ComentarioPost): Observable<boolean>  { 
    return this.http.post(`${this.baseUrl}/comentarios`, comentario)
    .pipe(
      map( (_) => true),
      catchError( err => of(err.error.msg) ),
    );
  };

  public actualizarComentario(idComentario: number, comentario: any): Observable<boolean>  { 
    return this.http.patch(`${this.baseUrl}/comentarios/${idComentario}`, comentario)
    .pipe(
      map( (_) => true),
      catchError( err => of(err.error.msg) ),
    );
  };

  public getComentarioPorId(idComentario: number): Observable<ComentarioPorId> {
    return this.http.get<ComentarioPorId>(`${this.baseUrl}/particulares/${idComentario}`);
  };

  public borrarComentario(id: number): Observable<[]> {
    return this.http.delete<[]>(`${this.baseUrl}/comentarios/${id}`);
  };
};
