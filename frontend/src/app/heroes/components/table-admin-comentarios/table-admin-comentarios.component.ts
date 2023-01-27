import { Component, ViewChild, AfterViewInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MatTableDataSource } from '@angular/material/table';

import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';

import { MatSort } from '@angular/material/sort';

import { MatDialog } from '@angular/material/dialog';

import { switchMap } from 'rxjs/operators';

import { of } from 'rxjs';

import Swal from 'sweetalert2';

import { ValidatorService } from '../../validators/validator.service';

import { HeroesService } from '../../services/heroes.service';

import { EliminarComentarioComponent } from '../../components/eliminar-comentario/eliminar-comentario.component';

import {ComentarioAdmin, ComentarioPorId } from '../../interfaces/heroes.interfaces';


@Component({
  selector: 'app-table-admin-comentarios',
  templateUrl: './table-admin-comentarios.component.html',
  styles: [
    `
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
      tr.mat-row, tr.mat-footer-row {
        height: 60px;
      }
    `
  ],
})
export class TableAdminComentariosComponent implements AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  public displayedColumns: string[] = ['nombre', 'superhero', 'descripcion', 'acciones'];
  public dataSource!: MatTableDataSource<ComentarioAdmin>;
  public comentario: ComentarioPorId = {}

  // Formulario Comentarios.

  public miFormulario: FormGroup = this.formBuilder.group({
    descripcion: [ '', [Validators.required, Validators.maxLength(130)] ],
  });

  constructor (
    private heroesService: HeroesService,
    private formBuilder: FormBuilder,
    private matPaginatorIntl: MatPaginatorIntl,
    private dialog: MatDialog,
    public validatorService: ValidatorService,
  ) {};

  public ngAfterViewInit() {
    this.popularTabla();
  };

  public popularTabla(): void {
    this.heroesService.getComentariosAdmin().subscribe({
      next: (comentarios) => { 
        this.dataSource = new MatTableDataSource(comentarios);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.matPaginatorIntl.itemsPerPageLabel = 'Items por página';
        this.matPaginatorIntl.nextPageLabel = 'Página siguiente';
        this.matPaginatorIntl.previousPageLabel = 'Página anterior';
      },
      error: (err) => { console.error(err)},
    });
  };

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    };
  };

  /*******ACTUALIZAR COMENTARIOS *******/

  public actualizarComentario(): void {
    const body = {
      comentario: this.miFormulario.value.descripcion,
    };
    this.heroesService.actualizarComentario(this.comentario.id!, body)
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
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
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
