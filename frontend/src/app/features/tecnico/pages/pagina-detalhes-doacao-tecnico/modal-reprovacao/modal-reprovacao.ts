import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-modal-reprovacao',
  standalone: true,
  imports: [ CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule ],
  templateUrl: './modal-reprovacao.html',
  styleUrls: ['./modal-reprovacao.css']
})
export class ModalReprovacao {

  private dialogRef = inject(MatDialogRef<ModalReprovacao>);

  justificativa = '';

  fechar(): void {
    this.dialogRef.close();
  }

  enviar(): void {
    this.dialogRef.close(this.justificativa);
  }
}