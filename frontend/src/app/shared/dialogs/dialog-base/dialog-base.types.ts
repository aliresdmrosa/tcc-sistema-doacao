export interface DialogBaseData {

  titulo: string;

  mensagem: string;

  tipo?: 'success' | 'error' | 'warning' | 'confirm';

  textoConfirmar?: string;

  textoCancelar?: string;

  mostrarConfirmar?: boolean;

  mostrarCancelar?: boolean;

  carregando?: boolean;
}
