package com.sistemadoacao.backend.dto;

import com.sistemadoacao.backend.model.Curso;

public record TecnicoResponseDTO(Long id, String nome, String email, Curso curso, String GRR, String dataCadastro) {
}
