import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DialogBaseData } from './dialog-base.types';

@Component({
  selector: 'app-dialog-base',

  standalone: true,

  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],

  templateUrl: './dialog-base.html',

  styleUrls: ['./dialog-base.css']
})
export class DialogBaseComponent {

  constructor(

    private dialogRef: MatDialogRef<DialogBaseComponent>,

    @Inject(MAT_DIALOG_DATA)
    public data: DialogBaseData

  ) {}

  confirmar(): void {

    this.dialogRef.close(true);

  }

  cancelar(): void {

    this.dialogRef.close(false);

  }

  obterIcone(): string {

    if (this.data.icone) {

      return this.data.icone;

    }

    switch (this.data.tipo) {

      case 'success':
        return 'check_circle';

      case 'error':
        return 'error';

      case 'warning':
        return 'warning';

      case 'confirm':
        return 'help';

      default:
        return 'info';
    }
  }
}