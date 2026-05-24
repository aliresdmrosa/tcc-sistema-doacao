export interface DialogBaseData {

  titulo: string;

  mensagem: string;

  tipo?: 'success' | 'error' | 'warning' | 'confirm';

  icone?: string;

  textoConfirmar?: string;

  textoCancelar?: string;

  mostrarConfirmar?: boolean;

  mostrarCancelar?: boolean;
}
