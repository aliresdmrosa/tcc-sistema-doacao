package com.sistemadoacao.backend.dto;

import java.time.LocalDate;
import com.sistemadoacao.backend.model.Equipamento;
import com.sistemadoacao.backend.model.Status;

public record SolicitacaoDTO(
        Long id,
        String grr,
        Equipamento equipamento,
        Status status,
        String motivo,
        Boolean sem_computador,
        Boolean ativo,
        LocalDate dataCadastro,
        String nome,
        String cpf
) {

}