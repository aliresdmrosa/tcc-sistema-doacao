package com.sistemadoacao.backend.dto;

import java.time.LocalDate;

public interface DoacaoResponseUserDTO {
    Long getId();
    Long getIdSolicitacao();
    String getDescricao();
    LocalDate getDataCadastro();
    LocalDate getDataEntrega();
    String getStatus();
    String getEquipamento();
    String getStatusConservacao();
    String getNome();
    String getCpf();
}
