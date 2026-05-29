package com.sistemadoacao.backend.dto;

import com.sistemadoacao.backend.model.Curso;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record TecnicoDTO(
        @Valid @NotNull UsuarioRequestDTO usuario,
        @NotNull Curso curso,
        @Pattern(regexp = "\\d{8}", message = "GRR deve conter 8 numeros") String GRR) {
}
