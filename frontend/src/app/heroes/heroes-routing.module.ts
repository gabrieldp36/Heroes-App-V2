import { NgModule } from '@angular/core';

import { Routes, RouterModule } from '@angular/router';

import { ListadoComponent } from './pages/listado/listado.component';

import { AgregarComponent } from './pages/agregar/agregar.component';

import { BuscarComponent } from './pages/buscar/buscar.component';

import { HeroeComponent } from './pages/heroe/heroe.component';

import { HomeComponent } from './pages/home/home.component';

import { PerfilComponent } from './pages/perfil/perfil.component';

import { PropiosComponent } from './pages/propios/propios.component';

import { AdministradorComponent } from './pages/administrador/administrador.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: 'perfil',
        component: PerfilComponent,
      },
      {
        path: 'listado',
        component: ListadoComponent,
      },
      {
        path: 'propios',
        component: PropiosComponent,
      },
      {
        path: 'admin',
        component: AdministradorComponent,
      },
      {
        path: 'agregar',
        component: AgregarComponent,
      },
      {
        path: 'editar/:id',
        component: AgregarComponent,
      },
      {
        path: 'buscar',
        component: BuscarComponent,
      },
      {
        path: ':id',
        component: HeroeComponent,
      },
      {
        path: '**',
        redirectTo: 'listado'
      },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule,
  ]
})
export class HeroesRoutingModule {};
