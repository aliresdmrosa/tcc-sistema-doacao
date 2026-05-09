export interface DoacaoDTO {
    id: number;
    equipamento?: string;
    quantidade: number;
    descricao?: string;
    status: string;
    statusConservacao?: string;
    dataCadastro : string;
    nome?: string;
    email?: string;
    cpf?: string;
    dataAlteracaoStatus?: string;
    imagemId?: number;
    url?: string;

} 