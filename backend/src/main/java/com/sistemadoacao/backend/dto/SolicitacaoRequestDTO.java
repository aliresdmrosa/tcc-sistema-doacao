package com.sistemadoacao.backend.dto;

import com.sistemadoacao.backend.model.Curso;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record SolicitacaoRequestDTO(
        @NotNull Curso curso,
        @Pattern(regexp = "\\d{8}", message = "GRR deve conter 8 numeros") String grr,
        String motivo,
        Boolean semComputador,
        Boolean ativo) {
}
