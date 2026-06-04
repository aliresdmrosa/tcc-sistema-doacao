package com.sistemadoacao.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginDTO(@NotBlank String token, Long id, String email, @NotBlank String perfil) {


}
