import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { HeroesService } from '../../services/heroes.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-administrador',
  templateUrl: './administrador.component.html',
  styles: [
  ]
})
export class AdministradorComponent implements OnInit {
  
  constructor (
    private authService: AuthService,
    private heroesService: HeroesService,
    private router: Router,
  ) {};

  public ngOnInit(): void {
    this.determinarPermanencia();
  };

  public determinarPermanencia(): void {
    this.heroesService.obtenerUsuarioActualizado().subscribe( (_) => {
      if(!this.authService.auth.admin) {
        this.router.navigate(['heroes/listado']);
      };
    });
  };
};
