package com.sistemadoacao.backend.model;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@OnDelete(action = OnDeleteAction.CASCADE)
public class Tecnico extends Pessoa {

    @Schema(description = "Codigo do aluno GRR", example = "20221106")
    private String grr;

    @Enumerated(EnumType.STRING)
    @Schema(description = "Curso do aluno tecnico", example = "TADS")
    private Curso curso;
}
