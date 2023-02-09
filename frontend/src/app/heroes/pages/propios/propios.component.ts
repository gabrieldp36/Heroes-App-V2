import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
  public cargando: boolean = false;
  public error: boolean = false;
  public heroes: Heroe[] = [];

  constructor(
    private authService: AuthService,
    private heroesService: HeroesService,
    private router: Router
  ) {};

  ngOnInit(): void {
    this.cargando = true;
    this.heroesService.obtenerUsuarioActualizado().subscribe( (resp) => {
      if(resp) {
        this.heroesService.getHeroesPropios(this.authService.auth.id)
        .subscribe( 
          (heroes) => {
            this.cargando = false;
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

  irAgregar(): void {
    this.router.navigate( ['/heroes/agregar'] );
  };

  irListado(): void {
    this.router.navigate( ['/heroes/listado'] );
  };
};
