import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog'

@Component({
  selector: 'app-dialog-eliminar',
  templateUrl: './dialog-eliminar.component.html',
  styles: [
  ]
})
export class DialogEliminarComponent {
  constructor(
    private dialogRef: MatDialogRef<DialogEliminarComponent>,
  ) {};

  cancelar(): void {
    this.dialogRef.close();
  };

  borrar():void {
    this.dialogRef.close(true);
  };
};
