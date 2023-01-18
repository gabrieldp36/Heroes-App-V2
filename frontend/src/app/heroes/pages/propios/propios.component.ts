import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../../auth/services/auth.service';

import { HeroesService } from '../../services/heroes.service';

import { Heroe } from '../../interfaces/heroes.interfaces';

@Component({
  selector: 'app-propios',
  templateUrl: './propios.component.html',
  styles: [
  ]
})
export class PropiosComponent implements OnInit {

  public error: boolean = false;
  public heroes: Heroe[] = [];

  constructor(
    private authService: AuthService,
    private heroesService: HeroesService
  ) {};

  ngOnInit(): void {
    this.heroesService.obtenerUsuarioActualizado().subscribe( (resp) => {
      if(resp) {
        this.heroesService.getHeroesPropios(this.authService.auth.id)
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
    });
  };
};
