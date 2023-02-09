import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-heroe-error',
  templateUrl: './heroe-error.component.html',
  styles: [
  ]
})
export class HeroeErrorComponent {

  constructor ( 
    private dialogRef: MatDialogRef<HeroeErrorComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string,
  ) {};

  cerrar(): void {
    this.dialogRef.close();
  };
};
