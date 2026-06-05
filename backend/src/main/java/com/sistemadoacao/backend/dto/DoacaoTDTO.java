package com.sistemadoacao.backend.dto;

import com.sistemadoacao.backend.model.Equipamento;
import com.sistemadoacao.backend.model.Status;
import java.time.LocalDate;
import java.util.List;

import com.sistemadoacao.backend.model.Conservacao;
import com.sistemadoacao.backend.model.Doacao;
import com.sistemadoacao.backend.model.ImagemDoacao;


public record DoacaoTDTO(
        Long id,
        Equipamento equipamento,
        Integer quantidade,
        String descricao,
        Status status,
        Conservacao statusConservacao,
        LocalDate dataCadastro,
        List<ImagemDoacao> imagens,
        String nome,
        String cpf
) {
        
        public DoacaoTDTO(Doacao doacao, String nome, String cpf) {
                this(doacao.getId(), doacao.getEquipamento(), doacao.getQuantidade(), doacao.getDescricao(),
                                doacao.getStatus(), doacao.getStatusConservacao(), doacao.getDataCadastro(),
                                doacao.getImagens(), nome, cpf);
        }

}
