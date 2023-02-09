import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import Swal from 'sweetalert2';
import { HeroesService } from '../../services/heroes.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Usuario } from '../../../auth/interfaces/auth.interfaces';

@Component({
  selector: 'app-table-administrador',
  templateUrl: './table-administrador.component.html',
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
  ],
})
export class TableAdministradorComponent implements AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  public displayedColumns: string[] = ['foto', 'nombre', 'correo', 'estado'];
  public dataSource!: MatTableDataSource<Usuario>;

  constructor (
    private authService: AuthService,
    private heroesService: HeroesService,
    private matPaginatorIntl: MatPaginatorIntl,
  ) {};

  public ngAfterViewInit() {
    this.popularTabla();
  };

  public popularTabla(): void {
    this.heroesService.getUsuarios().subscribe({
      next: (usuarios) => { 
        this.dataSource = new MatTableDataSource(this.agregrarPlaceHolder(usuarios));
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.matPaginatorIntl.itemsPerPageLabel = 'Items por página';
        this.matPaginatorIntl.nextPageLabel = 'Página siguiente';
        this.matPaginatorIntl.previousPageLabel = 'Página anterior';
      },
      error: (err) => { console.error(err)},
    });
  };

  public agregrarPlaceHolder(usuarios: Usuario[]): Usuario[] {
    usuarios.map( (usuario: Usuario) => {
      (!this.authService.esImgUrl(usuario.url_foto)) 
          ? usuario.url_foto = '../../../assets/images/UserPlaceHolder.jpg' : '';
    });
    return usuarios
  };

  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    };
  };

  public bloquearUsuario(id: number): void {
    this.heroesService.bloquearUsuario(id).subscribe( (resp) => {
      if( resp === true ) {
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
          title: '¡Usuario bloqueado!',
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

  public reactivarUsuario(id: number): void {
    this.heroesService.reactivarUsuario(id).subscribe( (resp) => {
      if( resp === true ) {
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
          title: '¡Usuario reactivado!',
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
