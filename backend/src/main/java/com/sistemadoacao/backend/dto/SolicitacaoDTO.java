package com.sistemadoacao.backend.dto;

import com.sistemadoacao.backend.model.Solicitacao;

public record SolicitacaoDTO(
        Solicitacao solicitacao,
        String nome,
        String cpf
) {

}
