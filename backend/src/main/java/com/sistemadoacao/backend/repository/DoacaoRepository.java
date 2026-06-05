package com.sistemadoacao.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sistemadoacao.backend.dto.DoacaoResponseUserDTO;
import com.sistemadoacao.backend.dto.DoacaoReverDTO;
import com.sistemadoacao.backend.model.Doacao;
import com.sistemadoacao.backend.model.Equipamento;
import com.sistemadoacao.backend.model.Status;

@Repository
public interface DoacaoRepository extends JpaRepository<Doacao, Long> {

    // lista todos por equipamento
    List<Doacao> findByEquipamento(Equipamento equipamento);

    // Lista todas que tem status APROVADO ou APROVADO_IA
    @Query("SELECT d FROM Doacao d WHERE d.status = 'APROVADO' OR d.status = 'APROVADO_IA'")
    List<Object[]> findAprovadas();

    long countByStatus(Status status);

    @Query(value = "SELECT MONTH(d.data_alteracao), COUNT(d.id) " +
            "FROM historico_status d " +
            "WHERE d.tipo_entidade = 'doacao' " +
            "AND d.status = 'DOADO' " +
            "GROUP BY MONTH(d.data_alteracao)" +
            "ORDER BY MONTH(d.data_alteracao) ASC", nativeQuery = true)
    List<Object[]> findDoacoesMensais();

    @Query("SELECT d.equipamento, COUNT(d.id) " +
            "FROM Doacao d " +
            "GROUP BY d.equipamento")
    List<Object[]> findTotalPorEquipamento();

    List<Doacao> findByStatus(Status status);

    List<Doacao> findByDoadorId(Long id);

    @Query(value = """
                SELECT
                    d.id as id,
                    d.descricao as descricao,
                    d.data_cadastro as dataCadastro,
                    d.quantidade as quantidade,
                    d.status as status,
                    d.equipamento as equipamento,
                    d.status_conservacao,
                    p.nome as nome,
                    p.cpf as cpf,
                    p.email as email,
                    h.data_alteracao as dataAlteracaoStatus,
                    i.url as url
                FROM doacao d
                JOIN pessoa p ON d.doador_id = p.id
                LEFT JOIN imagem_doacao i ON i.id = (
                    SELECT MIN(i2.id) FROM imagem_doacao i2 WHERE i2.doacao_id = d.id
                )
                LEFT JOIN historico_status h ON h.id = (SELECT MAX(h2.id) FROM historico_status h2 WHERE h2.doacao_id = d.id)

            """, nativeQuery = true)
    List<DoacaoReverDTO> buscarDoacoesComDoador(@Param("status") List<Status> status);

    @Query(value = """
                        SELECT
                            d.id as id,
                            d.descricao as descricao,
                            d.data_cadastro as dataCadastro,
                            d.quantidade as quantidade,
                            d.status as status,
                            d.equipamento as equipamento,
                            d.status_conservacao,
                            p.nome as nome,
                            p.cpf as cpf
                        FROM doacao d
                        JOIN pessoa p ON d.doador_id = p.id
            """, nativeQuery = true)
    List<DoacaoResponseUserDTO> buscarTodasUser();

    @Query(value = """
                                      SELECT
                                          d.id as id,
                                          d.descricao as descricao,
                                          d.data_cadastro as dataCadastro,
                                          d.quantidade as quantidade,
                                          d.status as status,
                                          d.equipamento as equipamento,
                                          d.status_conservacao,
                                          p.nome as nome,
                                          p.cpf as cpf,
                                          h.data_alteracao as dataAlteracaoStatus,
                                          i.url as url
                                      FROM doacao d
                                      LEFT JOIN imagem_doacao i ON i.id = (
                                          SELECT MIN(i2.id) FROM imagem_doacao i2 WHERE i2.doacao_id = d.id
                                      )
                                      LEFT JOIN historico_status h ON h.id = (SELECT MAX(h2.id) FROM historico_status h2 WHERE h2.doacao_id = d.id)
                                      JOIN pessoa p ON d.doador_id = p.id
                                      WHERE d.status IN ('APROVADO_REPARO',
                                                        'APROVADO',
                                                        'REPROVADO',
                                                        'REPARO',
                                                        'DESCARTE',
                                                        'PENDENTE',
                                                        'ESTOQUE')
                                  """, nativeQuery = true)
    List<DoacaoReverDTO> buscarDoacoesTecnico();

}
