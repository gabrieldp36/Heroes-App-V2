import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidatorService {

  public nombreApellidoPatron: RegExp = /^(?:[\u00c0-\u01ffa-zA-Z'-]){2,}(?:\s[\u00c0-\u01ffa-zA-Z'-]{2,})+$/i;
  public emailPatron: RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{1,3})+$/;
  public passwordPatron: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

  validarCampos(miFormulario: FormGroup, campo: string, error: string): boolean {
    return (miFormulario.get(campo)?.errors?.[error] 
        && miFormulario.get(campo)?.touched )
          ?  true : false;
  };
  
  camposIguales(campo1: string, campo2: string) {
    return (miFormulario: AbstractControl): ValidationErrors | null => {
      const pass1: string = miFormulario.get(campo1)?.value;
      const pass2: string = miFormulario.get(campo2)?.value;
      if (pass1 !== pass2) {
        miFormulario.get(campo2)?.setErrors( {noIguales: true} );
        return {noIguales: true};
      }
      miFormulario.get(campo2)?.setErrors( null );
      return null
    };
  };
};
