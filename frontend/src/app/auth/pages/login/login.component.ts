import { Component } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Router } from '@angular/router';

import Swal from 'sweetalert2';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {

  public typeInputPassword: string = 'password';
  public emailPatron: RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{1,3})+$/;

  miFormulario: FormGroup = this.formBuilder.group({
    email: [ '', [ Validators.required, Validators.pattern(this.emailPatron) ] ],
    password: ['', [ Validators.required] ],
  });

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {};

  validarCampos(campo: string, error: string): boolean {
    return (this.miFormulario.get(campo)?.errors?.[error] 
        && this.miFormulario.get(campo)?.touched )
          ?  true : false;
  };

  login(): void {
    if (this.miFormulario.invalid) {
      this.miFormulario.markAllAsTouched();
      return
    };

    const {email, password} = this.miFormulario.value;
    
    this.authService.login(email, password)
    .subscribe( resp => {
      if( resp === true ) {
        this.router.navigateByUrl('/heroes');
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: false,
          // didOpen: (toast) => {
          //   toast.addEventListener('mouseenter', Swal.stopTimer)
          //   toast.addEventListener('mouseleave', Swal.resumeTimer)
          // }
        });
        Toast.fire({
          icon: 'success',
          title: '¡Login exitoso!',
          color: '#fff',
          background: '#323232',
        });
      } else {
        localStorage.clear();
        Swal.fire( {
          icon: 'error',
          title: 'Login incorrecto',
          text: `${resp || 'Servidor momentáneamente fuera de servicio'}`,
          returnFocus: false
        });
      };
    });
  };
  
  public mostrarContrasena():void {
    (this.typeInputPassword === 'password') 
        ? this.typeInputPassword = 'text' 
          :  this.typeInputPassword ='password';
  };
};
