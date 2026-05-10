package com.sistemadoacao.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.sistemadoacao.backend.model.Equipamento;
import com.sistemadoacao.backend.model.Reparo;

public record ReparoResponseDTO(
    Long id,
    String descricao,
    String conclusao,
    Long idTecnico,
    LocalDate dataInicio,
    LocalDateTime dataFim,
    Long idDoacao,           
    Equipamento equipamentoDoacao
) {
    
    public ReparoResponseDTO(Reparo reparo) {
        this(
            reparo.getId(),
            reparo.getDescricao(),
            reparo.getConclusao(),
            reparo.getIdTecnico(),
            reparo.getDataInicio(),
            reparo.getDataFim(),
            reparo.getDoacao().getId(),
            reparo.getDoacao().getEquipamento()
        );
    }

}
