export interface SolicitacaoResponseDTO {
    id: number;
    equipamento: string;
    curso: string;
    grr: string;
    motivo: string;
    semComputador: boolean;
    ativo: boolean;
    nome: string;
    cpf: string;
    dataCadastro: string;
    status: string;
    historico: Historico[];
}

interface Historico {
    id: number;
    dataAlteracao: string;
    executor: string;
    status: string;
    observacao: string;
}
