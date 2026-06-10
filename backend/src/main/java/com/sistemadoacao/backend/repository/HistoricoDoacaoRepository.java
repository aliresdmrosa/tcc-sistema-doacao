package com.sistemadoacao.backend.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sistemadoacao.backend.model.HistoricoDoacao;

@Repository
public interface HistoricoDoacaoRepository extends JpaRepository<HistoricoDoacao, Long> {

    HistoricoDoacao findTopByDoacao_IdOrderByDataAlteracaoDesc(Long doacaoId);
}
