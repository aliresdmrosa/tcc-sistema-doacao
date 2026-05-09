package com.sistemadoacao.backend.dto;


import java.time.LocalDate;

import com.sistemadoacao.backend.model.Equipamento;
import com.sistemadoacao.backend.model.Status;
// Uso Projection para retornar dados da doação, doador e histórico,
// evitando múltiplas consultas e carregamento desnecessário de entidades.
// Como poderia retornar null para dataAlteracaoStatus, usei java.sql.Timestamp para evitar problemas de conversão. e projection pois record não aceita null, e o timestamp é mais flexível nesse caso.
public interface DoacaoReverDTO {
    Long getId();
    String getDescricao();
    LocalDate getDataCadastro();
    Integer getQuantidade();
    Status getStatus();
    Equipamento getEquipamento();
    String getNome();
    String getCpf();
    String getEmail();
    java.sql.Timestamp getDataAlteracaoStatus();
    String getUrl();
    String getStatusConservacao();
    Long getImagemId();
}
