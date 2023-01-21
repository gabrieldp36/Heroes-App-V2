import { Component } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Router } from '@angular/router';

import Swal from 'sweetalert2';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
})
export class RegistroComponent  {

  public typeInputPassword: string = 'password';
  public nombreApellidoPatron: RegExp = /^(?:[\u00c0-\u01ffa-zA-Z'-]){2,}(?:\s[\u00c0-\u01ffa-zA-Z'-]{2,})+$/i;
  public emailPatron: RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{1,3})+$/;
  public passwordPatron: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

  miFormulario: FormGroup = this.formBuilder.group({
    name: [ '', [Validators.required, Validators.pattern(this.nombreApellidoPatron) ] ],
    email: [ '', [ Validators.required, Validators.pattern(this.emailPatron) ] ],
    password: ['', [ Validators.required, Validators.pattern(this.passwordPatron) ] ],
  });

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {};
  
  validarCampos(campo: string, error: string): boolean {
    return (this.miFormulario.get(campo)?.errors?.[error] 
        && this.miFormulario.get(campo)?.touched )
          ?  true : false;
  };

  registro(): void {

    if (this.miFormulario.invalid) {
      this.miFormulario.markAllAsTouched();
      return
    };

    const {name, email, password} = this.miFormulario.value;

    this.authService.registro(name, email, password)
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
          title: '¡Usuario creado!',
          color: '#fff',
          background: '#323232',
        });
      } else {
        Swal.fire( {
          icon: 'error',
          title: 'Registración incorrecta',
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
