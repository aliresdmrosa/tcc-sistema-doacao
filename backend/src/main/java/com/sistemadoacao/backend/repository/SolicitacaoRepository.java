package com.sistemadoacao.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sistemadoacao.backend.dto.SolicitacaoDTO;
import com.sistemadoacao.backend.model.Solicitacao;

@Repository
public interface SolicitacaoRepository extends JpaRepository<Solicitacao, Long> {

    List<Solicitacao> findAllByUsuarioId(Long id);

        // Consulta personalizada para retornar as solicitações com nome e cpf do usuário
        @org.springframework.data.jpa.repository.Query("""
            SELECT new com.sistemadoacao.backend.dto.SolicitacaoDTO(s, p.nome, p.cpf)
            FROM Solicitacao s
            JOIN Pessoa p ON s.usuarioId = p.id
        """)
    List<SolicitacaoDTO> findAllUser();

}
