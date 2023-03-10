import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FlexLayoutModule } from '@angular/flex-layout';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HeroesRoutingModule } from './heroes-routing.module';

import { MaterialModule } from '../material/material.module';

import { AgregarComponent } from './pages/agregar/agregar.component';

import { BuscarComponent } from './pages/buscar/buscar.component';

import { HeroeComponent } from './pages/heroe/heroe.component';

import { HomeComponent } from './pages/home/home.component';

import { ListadoComponent } from './pages/listado/listado.component';

import { HeroeTarjetaComponent } from './components/heroe-tarjeta/heroe-tarjeta.component';

import { ConfirmarComponent } from './components/confirmar/confirmar.component';

import { RellenarCamposComponent } from './components/rellenar-campos/rellenar-campos.component';

import { ImagenPipe } from './pipes/imagen.pipe';

import { PerfilComponent } from './pages/perfil/perfil.component';

import { DialogEliminarComponent } from './components/dialog-eliminar/dialog-eliminar.component';

import { PropiosComponent } from './pages/propios/propios.component';

import { AdministradorComponent } from './pages/administrador/administrador.component';

import { HeroeErrorComponent } from './components/heroe-error/heroe-error.component';

import { EliminarComentarioComponent } from './components/eliminar-comentario/eliminar-comentario.component';

import { TableAdministradorComponent } from './components/table-administrador/table-administrador.component';

import { TableAdminHeroesComponent } from './components/table-admin-heroes/table-admin-heroes.component';

import { TableAdminComentariosComponent } from './components/table-admin-comentarios/table-admin-comentarios.component';

import { ComentariosComponent } from './components/comentarios/comentarios.component';

@NgModule({

  declarations: [
    AgregarComponent,
    BuscarComponent,
    HeroeComponent,
    HomeComponent,
    ListadoComponent,
    HeroeTarjetaComponent,
    ImagenPipe,
    ConfirmarComponent,
    RellenarCamposComponent,
    PerfilComponent,
    DialogEliminarComponent,
    PropiosComponent,
    AdministradorComponent,
    HeroeErrorComponent,
    EliminarComentarioComponent,
    TableAdministradorComponent,
    TableAdminHeroesComponent,
    TableAdminComentariosComponent,
    ComentariosComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    HeroesRoutingModule,
  ]
})
export class HeroesModule {};
