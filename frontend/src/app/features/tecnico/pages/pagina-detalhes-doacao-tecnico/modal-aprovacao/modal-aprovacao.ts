import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-modal-aprovacao',
  standalone: true,
  imports: [ CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule ],
  templateUrl: './modal-aprovacao.html',
  styleUrls: ['./modal-aprovacao.css']
})
export class ModalAprovacao {

  private dialogRef = inject(MatDialogRef<ModalAprovacao>);

  tipoDestino = 'DOACAO';
  justificativa = '';

  fechar(): void {
    this.dialogRef.close();
  }

  enviar(): void {
    this.dialogRef.close({
      tipoDestino: this.tipoDestino,
      justificativa: this.justificativa
    });
  }
}