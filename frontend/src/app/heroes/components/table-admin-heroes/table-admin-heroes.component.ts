import { Component, ViewChild, AfterViewInit } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';

import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';

import { MatSort } from '@angular/material/sort';

import { MatDialog } from '@angular/material/dialog';

import Swal from 'sweetalert2';

import { HeroesService } from '../../services/heroes.service';

import { AuthService } from '../../../auth/services/auth.service';

import { ConfirmarComponent } from '../../components/confirmar/confirmar.component';

import { Heroe } from '../../interfaces/heroes.interfaces';

@Component({
  selector: 'app-table-admin-heroes',
  templateUrl: './table-admin-heroes.component.html',
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
    `
  ]
})
export class TableAdminHeroesComponent implements AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  public displayedColumns: string[] = ['foto', 'nombre', 'alter_ego', 'acciones'];
  public dataSource!: MatTableDataSource<Heroe>;

  constructor (
    private authService: AuthService,
    private heroesService: HeroesService,
    private matPaginatorIntl: MatPaginatorIntl,
    private dialog: MatDialog,
  ) {};

  public ngAfterViewInit() {
    this.popularTabla();
  };

  public popularTabla(): void {
    this.heroesService.getHeroes().subscribe({
      next: (heroes) => { 
        this.dataSource = new MatTableDataSource(this.agregrarImagen(heroes));
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.matPaginatorIntl.itemsPerPageLabel = 'Items por página';
        this.matPaginatorIntl.nextPageLabel = 'Página siguiente';
        this.matPaginatorIntl.previousPageLabel = 'Página anterior';
      },
      error: (err) => { console.error(err)},
    });
  };

  public agregrarImagen(heroes:Heroe[]): Heroe[] {
    heroes.map( (heroe: Heroe) => {
      if(!this.authService.esImgUrl(heroe.alt_img) && !heroe.assets_img) {
        heroe.alt_img = '../../../assets/no-image.png';
      };
      if(heroe.assets_img) {
        heroe.alt_img = `assets/heroes/${heroe.id}.jpg`
      };
    });
    return heroes;
  };

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    };
  };

  public eliminarHeroe(heroe: Heroe): void {
    const dialog = this.dialog.open(ConfirmarComponent, {
      width: '300px',
      panelClass:['dialogConfirm'],
      data: {...heroe},
    });
    dialog.afterClosed().subscribe( (result) => {
      if (result) {
        this.heroesService.borrarHeroe(heroe.id).subscribe({
          next: (resp) => {
            if( Object.keys(resp).length === 0) {
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
                }
              });
              Toast.fire({
                icon: 'success',
                title: '¡Héroe eliminado!',
                color: '#fff',
                background: '#323232',
              });
            }
          },
          error: (err) => {
            Swal.fire( {
              icon: 'error',
              title: 'Eliminación incorrecta',
              text: `${err.error.msg || 'Servidor momentáneamente fuera de servicio'}`,    
              color: '#fff',
              background: '#323232',
              confirmButtonColor: '#F9BA41',
              returnFocus: false
            });
          },
        });
      };
    });
  };
};
