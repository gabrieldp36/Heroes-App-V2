import { Component, AfterViewInit, Input, ViewChild } from '@angular/core';

import { HttpErrorResponse } from '@angular/common/http';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

import { Heroe, Comentario, ComentarioPost, ComentarioPorId } from '../../interfaces/heroes.interfaces';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-comentarios',
  templateUrl: './comentarios.component.html',
  styles: [
    `
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
export class ComentariosComponent implements AfterViewInit {

  @Input() heroe!: Heroe;
  @Input() userId!: number;
  @Input() adminUser!: boolean;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  public error!: HttpErrorResponse;
  public displayedColumns: string[] = ['url_foto', 'nombre', 'descripcion', 'eliminar'];
  public dataSource!: MatTableDataSource<Comentario>;
  public comentario: ComentarioPorId = {}
  public mostrarComentarios: boolean = false;

  // Formulario Comentarios.

  public miFormulario: FormGroup = this.formBuilder.group({
    descripcion: [ '', [Validators.required, Validators.maxLength(130)] ],
  });

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private heroesService: HeroesService,
    public validatorService: ValidatorService,
    private matPaginatorIntl: MatPaginatorIntl,
    private dialog: MatDialog,
    public activeModal: NgbActiveModal

  ) {};

  public ngAfterViewInit() {
    this.popularTabla();
  };

  /******TABLA PARA MOSTRAR COMENTARIOS ******/
  
  public popularTabla(): void {
    this.heroesService.getComentarios(this.heroe.id).subscribe({
      next: (comentarios) => { 
        (comentarios.length > 0) ? this.mostrarComentarios = true : this.mostrarComentarios = false;
        this.dataSource = new MatTableDataSource(this.agregrarPlaceHolder(comentarios));
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.matPaginatorIntl.itemsPerPageLabel = 'Items por página';
        this.matPaginatorIntl.nextPageLabel = 'Página siguiente';
        this.matPaginatorIntl.previousPageLabel = 'Página anterior';
      },
      error: (err) => { console.error(err)},
    });
  };
  
  public agregrarPlaceHolder(comentarios: Comentario[]): Comentario[] {
    comentarios.map( (comentario: Comentario) => {
      (!this.authService.esImgUrl(comentario.url_foto)) 
      ? comentario.url_foto = '../../../assets/images/UserPlaceHolder.jpg' : '';
    });
    return comentarios
  };

  public esComentarioPropio(id:number): boolean {
    return id == this.userId;
  };
  
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    };
  };

  /*******AGREGAR Y ACTUALIZAR COMENTARIOS *******/

  public agregarActualizarComentario(): void {
    if(this.comentario?.id) {
      const body = {
        comentario: this.miFormulario.value.descripcion
      };
      this.heroesService.actualizarComentario(this.comentario.id, body)
      .subscribe( resp => {
        if (resp === true) {
          this.popularTabla();
          this.comentario = {};
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
            title: '¡Comentario actualizado!',
            color: '#fff',
            background: '#323232',
          });
        } else {
          Swal.fire( {
            icon: 'error',
            title: 'Actualización incorrecta',
            text: `${resp || 'Servidor momentáneamente fuera de servicio'}`,    
            color: '#fff',
            background: '#323232',
            confirmButtonColor: '#F9BA41',
            returnFocus: false
          });
        };
      });

    } else {
      const body: ComentarioPost = {
        id_usuario: this.userId,
        id_heroe: this.heroe.id,
        comentario: this.miFormulario.value.descripcion,
      };
      this.heroesService.agregarComentario(body).subscribe( resp => {
        if (resp === true) {
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
  };

  public obtenerComentario(id: number):void {
    this.heroesService.getComentarioPorId(id).subscribe({
      next: (comentario) => { 
        this.comentario = comentario;
        this.miFormulario.setValue({descripcion: comentario?.descripcion || ''});
      },
      error: (err) => { console.error(err)},
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
};
