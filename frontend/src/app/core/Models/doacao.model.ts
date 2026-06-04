export interface ImagemDoacao {
  id: number;
  url: string;
}

export interface HistoricoDoacao {
  id: number;
  dataAlteracao: string;
  observacao: string;
  executor: string;
  status: string;
}

export interface ReparoDoacao {
  id: number;
  descricao: string;
  conclusao: string;
  idTecnico: number;
  dataInicio: string;
  dataFim: string;
}

export interface SolicitacaoRelacionada {
  id: number;
  usuarioId: number;
  curso: string;
  grr: string;
  motivo: string;
  dataCadastro: string;
  status: string;
  ativo: boolean;
  sem_computador: boolean;
}

export interface Doacao {
  id: number;
  doadorId: number;
  equipamento: string;
  quantidade: number;
  descricao: string;
  statusConservacao: string;
  dataCadastro: string;
  dataEntrega: string;
  imagens: ImagemDoacao[];
  status: string;
  historico?: HistoricoDoacao[];
  reparo?: ReparoDoacao;
  solicitacao?: SolicitacaoRelacionada;
  doacoes?: string[];
}
