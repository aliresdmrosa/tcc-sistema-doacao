package com.sistemadoacao.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sistemadoacao.backend.model.Reparo;
import java.util.List;

@Repository
public interface ReparoRepository extends JpaRepository<Reparo, Long> {

    // Busca todos os reparos filtrando pelo ID da doação
    @Query("SELECT r FROM Reparo r WHERE r.doacao.id = :doacaoId")
    List<Reparo> findAllByDoacaoId(@Param("doacaoId") Long doacaoId);

    @Query("SELECT r FROM Reparo r WHERE idTecnico = :idUsuarioLogado")
    List<Reparo> findAllByIdTecnico(@Param("idUsuarioLogado") Long idUsuarioLogado);
}
