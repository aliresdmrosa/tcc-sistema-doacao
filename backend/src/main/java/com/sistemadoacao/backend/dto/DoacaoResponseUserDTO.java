package com.sistemadoacao.backend.dto;

import java.time.LocalDate;

public interface DoacaoResponseUserDTO {
    Long getId();
    String getDescricao();
    LocalDate getDataCadastro();
    String getStatus();
    String getEquipamento();
    String getStatusConservacao();
    String getNome();
    String getCpf();
}
