package com.sistemadoacao.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record AdministradorDTO(@Valid @NotNull UsuarioRequestDTO usuario) {
}
