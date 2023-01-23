import { Component } from '@angular/core';

import { MatDialogRef } from '@angular/material/dialog'

@Component({
  selector: 'app-eliminar-comentario',
  templateUrl: './eliminar-comentario.component.html',
  styles: [
  ]
})
export class EliminarComentarioComponent {

  constructor(
    private dialogRef: MatDialogRef<EliminarComentarioComponent>,
  ) {};

  cancelar(): void {
    this.dialogRef.close();
  };

  borrar():void {
    this.dialogRef.close(true);
  };
};
