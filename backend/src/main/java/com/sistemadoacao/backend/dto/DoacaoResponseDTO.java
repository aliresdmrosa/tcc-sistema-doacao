package com.sistemadoacao.backend.dto;

import java.time.LocalDate;
import java.util.List;

import com.sistemadoacao.backend.model.Conservacao;
import com.sistemadoacao.backend.model.Doacao;
import com.sistemadoacao.backend.model.Equipamento;
import com.sistemadoacao.backend.model.ImagemDoacao;
import com.sistemadoacao.backend.model.Status;

public record DoacaoResponseDTO(
        Long id,
        Equipamento equipamento,
        Integer quantidade,
        String descricao,
        Status status,
        Conservacao statusConservacao,
        LocalDate dataCadastro,
        List<ImagemDoacao> imagens
) {
        public DoacaoResponseDTO(Doacao doacao) {
                this(doacao.getId(), doacao.getEquipamento(), doacao.getQuantidade(), doacao.getDescricao(),
                                doacao.getStatus(), doacao.getStatusConservacao(), doacao.getDataCadastro(),
                                doacao.getImagens());
        }

}
