import { Component, OnInit } from '@angular/core';
import { HeroesService } from '../../services/heroes.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Heroe } from '../../interfaces/heroes.interfaces';

@Component({
  selector: 'app-listado',
  templateUrl: './listado.component.html',
  styles: []
})
export class ListadoComponent implements OnInit {

  public adminUser: boolean = false;
  public error: boolean = false;
  public heroes: Heroe[] = [];

  constructor(
    private authService: AuthService,
    private heroesService: HeroesService
  ) {};

  ngOnInit(): void {
    this.esAdministrador();
    this.getListadoHeroes();
  };

  public esAdministrador():void {
    this.heroesService.obtenerUsuarioActualizado().subscribe( (_) => {
      if(this.authService.auth.admin) {
        this.adminUser = this.authService.auth.admin;
      };
    });
  };

  public getListadoHeroes(): void {
    this.heroesService.getHeroes()
    .subscribe( 
      (heroes) => {
        this.error = false;
        this.heroes = heroes;
      },
      (error) => {
        console.error(error);
        this.error = true;
      },
    );
  };
};
