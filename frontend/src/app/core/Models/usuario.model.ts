export interface Usuario {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  perfil?: string;
  dataCadastro?: string;
  ativo?: boolean;
  grr?: string;
  curso?: string;
  senha?: string;
}

export interface UsuarioCadastroRequest {
  nome: string;
  cpf: string;
  email: string;
  senha: string;
}

export interface TecnicoCadastroRequest {
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  grr: string;
  curso: string;
}

export interface AdminCadastroRequest {
  nome: string;
  cpf: string;
  email: string;
  senha: string;
}

export interface UsuarioAtualizacaoRequest {
  nome: string;
  cpf: string;
  email: string;
  grr?: string;
  curso?: string;
  senha?: string;
}
