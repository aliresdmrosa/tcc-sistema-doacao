import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogBaseComponent } from '../dialogs/dialog-base/dialog-base';
import { DialogBaseData } from '../dialogs/dialog-base/dialog-base.types';

type TipoModal = NonNullable<DialogBaseData['tipo']>;

const LARGURA_PADRAO = '420px';

export function abrirModalAviso(
  dialog: MatDialog,
  titulo: string,
  mensagem: string,
  tipo: TipoModal = 'warning'
): MatDialogRef<DialogBaseComponent> {
  return dialog.open(DialogBaseComponent, {
    width: LARGURA_PADRAO,
    data: {
      tipo,
      titulo,
      mensagem,
      textoConfirmar: 'OK'
    }
  });
}

export function abrirModalCarregamento(
  dialog: MatDialog,
  titulo: string,
  mensagem: string
): MatDialogRef<DialogBaseComponent> {
  return dialog.open(DialogBaseComponent, {
    width: LARGURA_PADRAO,
    disableClose: true,
    data: {
      tipo: 'confirm',
      titulo,
      mensagem,
      mostrarConfirmar: false,
      carregando: true
    }
  });
}
