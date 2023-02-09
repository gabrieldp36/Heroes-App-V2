import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { Usuario } from '../../../auth/interfaces/auth.interfaces';
import { HeroesService } from '../../services/heroes.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ValidatorService } from '../../validators/validator.service';
import { DialogEliminarComponent } from '../../components/dialog-eliminar/dialog-eliminar.component';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styles: [
  ]
})
export class PerfilComponent implements OnInit {
  public imagenPerfil = ''
  public typeInputPassword1: string = 'password';
  public typeInputPassword2: string = 'password';

  public miFormulario: FormGroup = this.formBuilder.group({
    nombre: ['', [Validators.required, Validators.pattern(this.validatorService.nombreApellidoPatron)]],
    url_foto: ['', []],
    correo: ['', [ Validators.required, Validators.pattern(this.validatorService.emailPatron)] ],
    password: ['', [Validators.pattern(this.validatorService.passwordPatron)] ],
    password2: ['', [] ],
  }, {
    validators: [ this.validatorService.camposIguales('password', 'password2') ],
  });

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private heroesService: HeroesService,
    public validatorService: ValidatorService,
    private dialog: MatDialog,
  ) {};

  public ngOnInit(): void {
    this.inicializarForm();
  };

  public get usuario (): Usuario {
    return this.authService.auth;
  };

  public inicializarForm(): void {
    this.heroesService.popularFormulario().subscribe( (resp) => {
      if(resp) {
        this.miFormulario.setValue({
          nombre: this.usuario.nombre,
          url_foto: this.usuario.url_foto,
          correo: this.usuario.correo,
          password: '',
          password2: ''
        });
        (this.usuario.url_foto) 
          ? this.imagenPerfil = this.usuario.url_foto : this.imagenPerfil = '../../../assets/images/UserPlaceHolder.jpg';
      };
    });
  };

  public mostrarContrasena():void {
    (this.typeInputPassword1 === 'password') 
        ? this.typeInputPassword1 = 'text' 
          :  this.typeInputPassword1 ='password';
  };

  public mostrarContrasena2():void {
    (this.typeInputPassword2 === 'password') 
        ? this.typeInputPassword2 = 'text' 
        :  this.typeInputPassword2 ='password';
  };

  public actualizarUsuario(): void {
    const {nombre, url_foto, correo, password} = this.miFormulario.value;
    this.heroesService.actualizarPerfil(nombre, url_foto, correo, password)
    .subscribe( resp => {
      if( resp === true ) {
        this.authService.cargarDatosUsuarios().subscribe( (_) => {
          this.router.navigateByUrl('/heroes');
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
            title: '¡Usuario Actualizado!',
            color: '#fff',
            background: '#323232',
          });
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

  public eliminarUsuario(): void {
    const dialog = this.dialog.open(DialogEliminarComponent, {
      width: '300px',
      panelClass:['dialogConfirm'],
    });
    dialog.afterClosed().subscribe((result) => {
      if(result) {
        this.heroesService.eliminarCuenta()
        .subscribe( resp => {
          if( resp === true ) {
            localStorage.clear();
            this.router.navigateByUrl('/auth/login');
            Swal.fire( {
              icon: 'success',
              title: 'Cuenta eliminada',
              text: 'Le confirmamos que su usuario ha sido eliminado.',
              returnFocus: false
            });
          } else {
            Swal.fire( {
              icon: 'error',
              title: 'Eliminación incorrecta',
              text: `${resp || 'Servidor momentáneamente fuera de servicio'}`,    
              color: '#fff',
              background: '#323232',
              confirmButtonColor: '#F9BA41',
              returnFocus: false
            });
          };
        });
      };
    });
  };
};
