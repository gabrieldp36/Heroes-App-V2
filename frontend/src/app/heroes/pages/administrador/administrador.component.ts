import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';

import { Router } from '@angular/router'

import { MatTableDataSource } from '@angular/material/table';

import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';

import { MatSort } from '@angular/material/sort';

import { HeroesService } from '../../services/heroes.service';

import { AuthService } from '../../../auth/services/auth.service';

import { Usuario } from '../../../auth/interfaces/auth.interfaces';

@Component({
  selector: 'app-administrador',
  templateUrl: './administrador.component.html',
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
export class AdministradorComponent implements OnInit, AfterViewInit {
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  public displayedColumns: string[] = ['id', 'nombre', 'correo', 'estado'];
  public dataSource!: MatTableDataSource<Usuario>;

  constructor (
    private authService: AuthService,
    private heroesService: HeroesService,
    private matPaginatorIntl: MatPaginatorIntl,
    private router: Router,
  ) {};

  public ngOnInit(): void {
    this.determinarPermanencia();
  };

  public ngAfterViewInit() {
    this.popularTabla();
  };

  public determinarPermanencia(): void {
    this.heroesService.obtenerUsuarioActualizado().subscribe( (_) => {
      if(!this.authService.auth.admin) {
        this.router.navigate(['heroes/listado']);
      };
    });
  };

  public popularTabla(): void {
    this.authService.getUsuarios().subscribe({
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
};
