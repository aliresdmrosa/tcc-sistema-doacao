package com.sistemadoacao.backend.dto;

import java.time.LocalDate;

public interface DoacaoResponseUserDTO {
    Long getId();
    String getDescricao();
    LocalDate getDataCadastro();
    LocalDate getDataEntrega();
    String getStatus();
    String getEquipamento();
    String getStatusConservacao();
    String getNome();
    String getCpf();
}
