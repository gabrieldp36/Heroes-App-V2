import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { HttpErrorResponse } from '@angular/common/http';

import { MatTableDataSource } from '@angular/material/table';

import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';

import { MatSort } from '@angular/material/sort';

import { MatDialog } from '@angular/material/dialog';

import { switchMap } from 'rxjs/operators';

import { of } from 'rxjs';

import Swal from 'sweetalert2';

import { HeroesService } from '../../services/heroes.service';

import { AuthService } from '../../../auth/services/auth.service';

import { ValidatorService } from '../../validators/validator.service';

import { EliminarComentarioComponent } from '../../components/eliminar-comentario/eliminar-comentario.component';

import { Heroe, Comentario, ComentarioPost } from '../../interfaces/heroes.interfaces';

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
      .tamaño-fuente {
        font-size: 15px;
      }
      table {
        width: 100%;
      }
      .mat-mdc-form-field {
        font-size: 15px;
        width: 100%;
      }
      td, th {
        width: 25%;
      } 
    `
  ]
})
export class HeroeComponent implements OnInit, AfterViewInit {

  @ViewChild('imagen') imagenHeroe!:ElementRef<HTMLImageElement>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  public error!: HttpErrorResponse;
  public heroe!: Heroe;
  public heroeNombre: string = '';
  public adminUser: boolean = false;
  public userId: number = 0;
  public imgLoad: boolean = false;
  public heroesPropios: number[] = [];
  public mostrarComentarios: boolean = false;
  public displayedColumns: string[] = ['url_foto', 'nombre', 'descripcion', 'eliminar'];
  public dataSource!: MatTableDataSource<Comentario>;

  // Formulario Comentarios.

  public miFormulario: FormGroup = this.formBuilder.group({
    descripcion: [ '', [Validators.required, Validators.maxLength(130)] ],
  });

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private heroesService: HeroesService,
    public validatorService: ValidatorService,
    private router:Router,
    private matPaginatorIntl: MatPaginatorIntl,
    private dialog: MatDialog,
  ) {};

  ngOnInit(): void {
    this.getHeroesPropios();
    this.esAdministrador();
    this.getHeroe();
  };

  public ngAfterViewInit() {
    this.popularTabla();
  };

  /****BUSCAMOS LA INFORMACIÓN DEL HÉROE A MOSTRAR ****/

  public getHeroe():void {
    this.activatedRoute.params
    .pipe( switchMap( ( {id} ) => this.heroesService.getHeroesPorId( id ) ) )
    .subscribe( 
      (heroe) => {
        this.heroe = heroe;
        this.heroeNombre = heroe.superhero;
      },
      (error) => {
        console.error(error);
        this.error = error;
      },
    );
  };

    /****OBTENEMOS INFORMACIÓN PARA MOSTRAR CONDICIONALMENTE 
      EL BOTÓN EDITAR  HÉROE O ELIMINAR COMENTARIO   
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
  
  public esComentarioPropio(id:number): boolean {
    return id == this.userId;
  };

  /******TABLA PARA MOSTRAR COMENTARIOS ******/

  public popularTabla(): void {
    this.activatedRoute.params
    .pipe( switchMap( ( {id} ) => this.heroesService.getHeroesPorId( id ) ) )
    .subscribe( 
      (heroe) => {
        this.heroesService.getComentarios(heroe.id).subscribe({
          next: (comentarios) => { 
            (comentarios.length > 0) ? this.mostrarComentarios = true :  this.mostrarComentarios = false;
            this.dataSource = new MatTableDataSource(this.agregrarPlaceHolder(comentarios));
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.matPaginatorIntl.itemsPerPageLabel = 'Items por página';
            this.matPaginatorIntl.nextPageLabel = 'Página siguiente';
            this.matPaginatorIntl.previousPageLabel = 'Página anterior';
          },
          error: (err) => { console.error(err)},
        });
      },
      (error) => {
        console.error(error);
        this.error = error;
      },
    );
  };

  public agregrarPlaceHolder(comentarios: Comentario[]): Comentario[] {
    comentarios.map( (comentario: Comentario) => {
      (!this.authService.esImgUrl(comentario.url_foto)) 
          ? comentario.url_foto = '../../../assets/images/UserPlaceHolder.jpg' : '';
    });
    return comentarios
  };

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    };
  };

  /*******AGREGAR COMENTARIOS *******/

  public agregarComentario(): void {
    
    const body: ComentarioPost = {
      id_usuario: this.userId,
      id_heroe: this.heroe.id,
      comentario: this.miFormulario.value.descripcion,
    };

    this.heroesService.agregarComentario(body).subscribe( resp => {
      if (resp) {
        this.popularTabla();
        this.miFormulario.reset({descripcion: ''})
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          },
        });
        Toast.fire({
          icon: 'success',
          title: '¡Comentario agregado!',
          color: '#fff',
          background: '#323232',
        });
      } else {
        Swal.fire( {
          icon: 'error',
          title: 'Incorporación incorrecta',
          text: `${resp || 'Servidor momentáneamente fuera de servicio'}`,    
          color: '#fff',
          background: '#323232',
          confirmButtonColor: '#F9BA41',
          returnFocus: false
        });
      };
    });
  };

  /*******BORRAR COMENTARIOS *******/

  public borrarComentario(id: number) {
    const dialog = this.dialog.open(EliminarComentarioComponent, {
      width: '300px',
      panelClass:['dialogConfirm'],
    });
    dialog.afterClosed()
    .pipe( switchMap( (result) => (result) ? this.heroesService.borrarComentario(id) : of(false) ) )
    .subscribe( resp => {
      if (resp !== false) {
        this.popularTabla();
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          },
        });
        Toast.fire({
          icon: 'success',
          title: '¡Comentario eliminado!',
          color: '#fff',
          background: '#323232',
        });
      };
    });
  };

  /***************************************/

  irListado(): void {
    this.router.navigate( ['/heroes/listado'] );
  };

  irBuscador(): void {
    this.router.navigate( ['/heroes/buscar'] );
  };

  irEditar(): void {
    this.router.navigate( ['/heroes/editar', this.heroe.id] );
  };

  onLoadImg(): void {
    this.imgLoad = true;
  };

  imagenError(): void {
    this.imagenHeroe.nativeElement.src = 'assets/no-image.png';
  };
};
