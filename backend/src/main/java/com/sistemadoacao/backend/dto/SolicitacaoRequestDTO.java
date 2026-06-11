package com.sistemadoacao.backend.dto;

import com.sistemadoacao.backend.model.CursoUsuario;
import com.sistemadoacao.backend.model.Equipamento;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record SolicitacaoRequestDTO(
        @NotNull Equipamento equipamento,
        @NotNull CursoUsuario curso,
        @Pattern(regexp = "\\d{8}", message = "GRR deve conter 8 numeros") String grr,
        String motivo,
        Boolean semComputador,
        Boolean ativo) {
}
