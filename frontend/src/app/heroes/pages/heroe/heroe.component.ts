import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { HttpErrorResponse } from '@angular/common/http';

import { switchMap } from 'rxjs/operators';

import { HeroesService } from '../../services/heroes.service';

import { AuthService } from '../../../auth/services/auth.service';

import { Heroe } from '../../interfaces/heroes.interfaces';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';

import { ComentariosComponent } from '../../components/comentarios/comentarios.component';

@Component({
  selector: 'app-heroe',
  templateUrl: './heroe.component.html',
  styles: [
    `
      img {
        margin-top: 10px;
        width: 400px;
        max-width: 100%;
        border-radius: 20px;
        box-shadow: 4px 4px 4px 5px rgba(0.21, 0.21, 0.21, 0.21), 4px 4px 4px 4px rgba(0.24, 0.24, 0.24, 0.24);
        height: 500px;
      }
      .mat-background {
        background-color: #7b1fa2 !important;
      }
      .mat-background.comentarios {
        background-color: #5dcebc !important;
        height: auto;
        padding: 4px;
      }
    `
  ]
})
export class HeroeComponent implements OnInit {

  @ViewChild('imagen') imagenHeroe!:ElementRef<HTMLImageElement>;
  public error!: HttpErrorResponse;
  public heroe!: Heroe;
  public adminUser: boolean = false;
  public userId: number = 0;
  public imgLoad: boolean = false;
  public heroesPropios: number[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private heroesService: HeroesService,
    private router:Router,
    private modalService: NgbModal,
    private modalConfig: NgbModalConfig
  ) {
    this.modalConfig.backdrop = 'static';
    this.modalConfig.keyboard = false;
    this.modalConfig.size = 'xl';
  };

  ngOnInit(): void {
    this.getHeroesPropios();
    this.esAdministrador();
    this.getHeroe();
  };

  /****BUSCAMOS LA INFORMACIÓN DEL HÉROE A MOSTRAR ****/

  public getHeroe():void {
    this.activatedRoute.params
    .pipe( switchMap( ( {id} ) => this.heroesService.getHeroesPorId( id ) ) )
    .subscribe( 
      (heroe) => {
        this.heroe = heroe;
      },
      (error) => {
        console.error(error);
        this.error = error;
      },
    );
  };

  /****
    OBTENEMOS INFORMACIÓN PARA MOSTRAR CONDICIONALMENTE 
    EL BOTÓN EDITAR HÉROE O ELIMINAR/EDITAR COMENTARIO   
  ****/

  public getHeroesPropios(): void {
    this.heroesService.getHeroesPropiosIds().subscribe( (heroesIds) => {
      this.heroesPropios = heroesIds;
    });
  };

  public esHeroePropio(id:number): boolean {
    return this.heroesPropios.includes(id);
  };

  public esAdministrador():void {
    this.heroesService.obtenerUsuarioActualizado().subscribe( (_) => {
      this.userId = this.authService.auth.id;
      if(this.authService.auth.admin) {
        this.adminUser = this.authService.auth.admin;
      };
    });
  };

  /****MODAL COMENTARIOS ****/

  public comentarios():void {
    const modalRef = this.modalService.open(ComentariosComponent);
    modalRef.componentInstance.heroe = this.heroe;
    modalRef.componentInstance.userId = this.userId;
    modalRef.componentInstance.adminUser = this.adminUser;
  };

  public irListado(): void {
    this.router.navigate( ['/heroes/listado'] );
  };

  public irBuscador(): void {
    this.router.navigate( ['/heroes/buscar'] );
  };

  public irEditar(): void {
    this.router.navigate( ['/heroes/editar', this.heroe.id] );
  };

  public onLoadImg(): void {
    this.imgLoad = true;
  };

  imagenError(): void {
    this.imagenHeroe.nativeElement.src = 'assets/no-image.png';
  };
};
