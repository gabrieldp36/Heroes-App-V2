import { NgModule } from '@angular/core';

import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';

import { LoginComponent } from './pages/login/login.component';

import { RegistroComponent } from './pages/registro/registro.component';

const routes: Routes = [
  {
    path: '',

    children: [
      {
        path: 'inicio',
        component: HomeComponent,
      },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'registro',
        component: RegistroComponent,
      },
      {
        path: '**',
        redirectTo: 'inicio'
      },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ]
})
export class AuthRoutingModule {};
