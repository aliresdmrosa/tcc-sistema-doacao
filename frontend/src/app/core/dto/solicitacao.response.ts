export interface SolicitacaoResponseDTO {
    id: number;
    usuarioId?: number;
    equipamento: string;
    curso: string;
    grr: string;
    motivo: string;
    sem_computador: boolean;
    semComputador?: boolean;
    ativo: boolean;
    nome?: string;
    cpf?: string;
    dataCadastro: string;
    status: string;
    historico: HistoricoSolicitacao[];
    doacoes?: DoacaoSolicitacao[];
}

export interface HistoricoSolicitacao {
    id: number;
    dataAlteracao: string;
    executor: string;
    status: string;
    observacao: string;
}

export interface DoacaoSolicitacao {
    id: number;
    equipamento?: string;
    status?: string;
}
