import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DialogBaseComponent } from '../../../shared/dialogs/dialog-base/dialog-base';

@Component({
  selector: 'app-barra-superior',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './barra-superior.html',
  styleUrl: './barra-superior.css'
})
export class BarraSuperior {
  private dialog = inject(MatDialog);

  @Output() menuClick = new EventEmitter<void>();

  abrirFecharMenu(): void {
    this.menuClick.emit();
  }

  logout(): void {
    const dialogRef = this.dialog.open(DialogBaseComponent, {
      width: '420px',
      data: {
        titulo: 'Sair',
        mensagem: 'Tem certeza que deseja sair?',
        tipo: 'confirm',
        textoConfirmar: 'Sair',
        textoCancelar: 'Cancelar',
        mostrarCancelar: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        localStorage.clear();
        window.location.href = '/login';
      }
    });
  }
}
