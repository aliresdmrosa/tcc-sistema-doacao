package com.sistemadoacao.backend.service;


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sistemadoacao.backend.dto.SolicitacaoDTO;
import com.sistemadoacao.backend.dto.SolicitacaoRequestDTO;
import com.sistemadoacao.backend.model.Doacao;
import com.sistemadoacao.backend.model.HistoricoDoacao;
import com.sistemadoacao.backend.model.HistoricoSolicitacao;
import com.sistemadoacao.backend.model.Pessoa;
import com.sistemadoacao.backend.model.Solicitacao;
import com.sistemadoacao.backend.model.Status;
import com.sistemadoacao.backend.repository.DoacaoRepository;
import com.sistemadoacao.backend.repository.SolicitacaoRepository;
import com.sistemadoacao.backend.exception.*;

import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class SolicitacaoService {

    private final SolicitacaoRepository solicitacaoRepository;
    private final DoacaoRepository doacaoRepository;

    public SolicitacaoService(SolicitacaoRepository solicitacaoRepository, DoacaoRepository doacaoRepository) {
        this.solicitacaoRepository = solicitacaoRepository;
        this.doacaoRepository = doacaoRepository;

    }

    public Solicitacao save(SolicitacaoRequestDTO solicitacao, Long usuarioId) {

        if (usuarioId == null) {
            throw new IdNullException("Id usuario null ao cadastrar solicitação");
        }

        // Lógica de negócio: Solicitação sempre inicia com status PENDENTE
        Solicitacao solicitacaoEntity = new Solicitacao();
        solicitacaoEntity.setUsuarioId(usuarioId);
        solicitacaoEntity.setEquipamento(solicitacao.equipamento());
        solicitacaoEntity.setCurso(solicitacao.curso());
        solicitacaoEntity.setGrr(solicitacao.grr());
        solicitacaoEntity.setMotivo(solicitacao.motivo());
        solicitacaoEntity.setSem_computador(solicitacao.semComputador());
        solicitacaoEntity.setAtivo(solicitacao.ativo());
        solicitacaoEntity.setStatus(Status.PENDENTE);
        log.info(solicitacaoEntity.toString());

        // Historico
        HistoricoSolicitacao h = new HistoricoSolicitacao();
        h.setDataAlteracao(LocalDateTime.now());
        h.setObservacao("Solicitação cadastrada no sistema.");
        h.setExecutor(getNomeUsuarioLogado());
        h.setStatus(Status.PENDENTE);

        h.setSolicitacao(solicitacaoEntity);

        solicitacaoEntity.getHistorico().add(h);

        log.info("Salvando solicitação para usuário ID: {}", usuarioId);
        log.debug("Detalhes da solicitação: {}", solicitacaoEntity);
        Solicitacao nova = solicitacaoRepository.save(solicitacaoEntity);

        return nova;
    }

    public List<Solicitacao> findByUsuarioId(Long id) {

        if (id == null) {
            throw new IdNullException("Id usuario null ao buscar solicitacoes");
        }

        List<Solicitacao> solicitacoes = solicitacaoRepository.findAllByUsuarioId(id);

        if (solicitacoes.isEmpty()) {
            log.warn("Nenhuma solicitação encontrada para o usuário ID: {}", id);
            throw new NotFoundException("Nenhuma solicitacao cadastrada para usuario");
        }
        return solicitacaoRepository.findAllByUsuarioId(id);
    }

    public List<Solicitacao> findByUsuarioIdParaAdmin(Long id) {
        if (id == null) {
            throw new IdNullException("Id usuario null ao buscar solicitacoes");
        }

        return solicitacaoRepository.findAllByUsuarioId(id);
    }

    public Solicitacao findById(@NonNull Long id){
        return solicitacaoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Solicitação não encontrada com ID: " + id));
    }

    public List<SolicitacaoDTO> findAll() {
        List<SolicitacaoDTO> solicitacoes = solicitacaoRepository.findAllUser();
        if (solicitacoes.isEmpty()) {
            throw new NotFoundException("Nenhuma solicitacao cadastrada");

        }
        return solicitacoes;

    }

    // @PreAuthorize("hasRole('ADMINISTRADOR')")
    public void delete(@NonNull Long id) {

        if (id == null) {
            throw new IdNullException("Erro ao deletar solicitacao com id null");
        }

        // historico
        HistoricoSolicitacao h = new HistoricoSolicitacao();
        h.setDataAlteracao(LocalDateTime.now());
        h.setObservacao("Solicitacao deletada");
        h.setExecutor(getNomeUsuarioLogado());
        h.setStatus(Status.DELETADA);
        // Adicionar id_solicitacao no historico
        try {
            Solicitacao s = findById(id);
            h.setSolicitacao(s);

        } catch (Exception e) {
            log.error("Erro ao buscar solicitacao para deletar.");
            throw new IdNullException("Erro ao buscar solicitacao para deletar");
        }

        solicitacaoRepository.deleteById(id);
        log.info("Solicitacao deletada com sucesso" + id);
    }

    public Solicitacao uptadeSolicitacao(Long id, SolicitacaoRequestDTO dto) {
        try {
            Solicitacao existente = findById(id);

            if (existente != null) {

                if (dto.equipamento() != null) {
                    existente.setEquipamento(dto.equipamento());
                }
                if (dto.curso() != null) {
                    existente.setCurso(dto.curso());
                }
                if (dto.grr() != null) {
                    existente.setGrr(dto.grr());
                }
                if (dto.motivo() != null) {
                    existente.setMotivo(dto.motivo());
                }
                existente.setSem_computador(dto.semComputador());
                existente.setAtivo(dto.ativo());
            } else {
                log.warn("Solicitação com ID {} não encontrada para atualização.", id);
                throw new IdNullException("Erro ao atualizar solicitação com id null");
            }

            log.info("Atualizando solicitação ID {} com novos dados: {}", id, existente);
            return solicitacaoRepository.save(existente);

        } catch (Exception e) {
            log.error("Erro ao atualizar solicitação ID {}: {}", id, e.getMessage());
            throw new ErroCadastoException("Erro ao atualizar solicitacao");

        }

    }

    // @PreAuthorize("hasRole('USUARIO')")
    public void aprovarSolicitacao(Long id) {
        try {
            Solicitacao existente = findById(id);

            if (existente == null) {
                log.info("solicicao com id", id);
                throw new IdNullException("Erro ao aprovar solicitacao com id null");
            }

            // Criar e Adicionar o Histórico
            HistoricoSolicitacao historico = new HistoricoSolicitacao();
            historico.setDataAlteracao(LocalDateTime.now());
            historico.setObservacao("Solicitação aprovada.");
            historico.setExecutor(getNomeUsuarioLogado());
            historico.setStatus(Status.APROVADA);

            historico.setSolicitacao(existente);

            existente.getHistorico().add(historico);
            existente.setStatus(Status.APROVADA);
            solicitacaoRepository.save(existente);

            log.info("Solicitacao aprovado - ", id);

        } catch (Exception e) {
            log.error("Erro ao aprovar solicitação ID {}: {}", id, e.getMessage());
            throw new ErroCadastoException("Erro ao aprovar solicitação");
        }
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public void reprovarSolicitacao(Long id) {
        try {
            Solicitacao existente = findById(id);

            // Criar historico doacao
            HistoricoSolicitacao historico = new HistoricoSolicitacao();
            historico.setDataAlteracao(LocalDateTime.now());
            historico.setObservacao("Solicitação reprovada.");
            historico.setExecutor(getNomeUsuarioLogado());
            historico.setStatus(Status.REPROVADA);

            historico.setSolicitacao(existente);
            // Atualizar histórico da solicitação
            existente.getHistorico().add(historico);
            existente.setStatus(Status.REPROVADA);
            solicitacaoRepository.save(existente);
        } catch (Exception e) {
            log.error("Erro ao reprovar solicitação ID {}: {}", id, e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Transactional
    public void reabrirAnaliseSolicitacao(Long id) {
        try {
            Solicitacao existente = findById(id);
            String executor = getNomeUsuarioLogado();

            for (Doacao doacao : new ArrayList<>(existente.getDoacoes())) {
                HistoricoDoacao historicoDoacao = new HistoricoDoacao();
                historicoDoacao.setDataAlteracao(LocalDateTime.now());
                historicoDoacao.setObservacao("Doacao voltou para estoque apos reabertura da solicitacao ID " + id);
                historicoDoacao.setExecutor(executor);
                historicoDoacao.setStatus(Status.ESTOQUE);
                historicoDoacao.setDoacao(doacao);

                doacao.getHistorico().add(historicoDoacao);
                doacao.setStatus(Status.ESTOQUE);
                doacao.setSolicitacao(null);
                doacaoRepository.save(doacao);
            }

            existente.getDoacoes().clear();

            HistoricoSolicitacao historico = new HistoricoSolicitacao();
            historico.setDataAlteracao(LocalDateTime.now());
            historico.setObservacao("Analise da solicitacao reaberta.");
            historico.setExecutor(executor);
            historico.setStatus(Status.PENDENTE);
            historico.setSolicitacao(existente);

            existente.getHistorico().add(historico);
            existente.setStatus(Status.PENDENTE);
            solicitacaoRepository.save(existente);
        } catch (Exception e) {
            log.error("Erro ao reabrir analise da solicitacao ID {}: {}", id, e.getMessage());
            throw new ErroCadastoException("Erro ao reabrir analise da solicitacao");
        }
    }

    // @PreAuthorize("hasRole('ADMINISTRADOR')")
    public Solicitacao selecionarDoacaoSolicitacao(@NonNull Long solicitacaoId, @NonNull Long doacaoId) {

        try {
            Solicitacao solicitacao = solicitacaoRepository.findById(solicitacaoId)
                    .orElseThrow(() -> new Exception("Solicitação não encontrada com ID: " + solicitacaoId));

            Doacao doacaoEscolhida = doacaoRepository.findById(doacaoId)
                    .orElseThrow(() -> new Exception("Doação não encontrada com ID: " + doacaoId));
        

        if (solicitacao.getStatus() != Status.APROVADA) {
            log.error("Solicitação com ID: {} não está aprovada. Status atual: {}", solicitacaoId,
                    solicitacao.getStatus());
            throw new AprovarErroException("Solicitação com ID: " + solicitacaoId + " não está aprovada.");
        }

        if (doacaoEscolhida == null) {
            throw new IdNullException("Doação não encontrada com ID: " + doacaoId);
        }

        List<Status> statusPermitidos = List.of(Status.ESTOQUE);
        // Verifica se a doação está disponível para seleção
        if (!statusPermitidos.contains(doacaoEscolhida.getStatus())) {
            log.error("Doação com ID: {} não está disponível para seleção. Status atual: {}", doacaoId,
                    doacaoEscolhida.getStatus());
            throw new AprovarErroException("Doação com ID: " + doacaoId + " não está disponível.");
        }
        

        // --- PARTE DA DOAÇÃO ---
        HistoricoDoacao historicoDoacao = new HistoricoDoacao();
        historicoDoacao.setDataAlteracao(LocalDateTime.now());
        historicoDoacao.setObservacao("Doação vinculada à solicitação ID " + solicitacaoId);
        historicoDoacao.setExecutor(getNomeUsuarioLogado());
        historicoDoacao.setStatus(Status.VINCULADO);

        // IMPORTANTE: Seta a doação para preencher doacao_id no banco
        historicoDoacao.setDoacao(doacaoEscolhida);
        doacaoEscolhida.getHistorico().add(historicoDoacao);
        doacaoEscolhida.setStatus(Status.VINCULADO);
        doacaoEscolhida.setSolicitacao(solicitacao);

        // --- PARTE DA SOLICITAÇÃO ---
        solicitacao.getDoacoes().add(doacaoEscolhida);
        solicitacao.setStatus(Status.VINCULADO);

        HistoricoSolicitacao h = new HistoricoSolicitacao();
        h.setDataAlteracao(LocalDateTime.now());
        h.setObservacao("Equipamento ID " + doacaoId + " vinculado com sucesso.");
        h.setStatus(Status.VINCULADO);
        h.setExecutor(getNomeUsuarioLogado());

        // IMPORTANTE: Seta a solicitação para preencher solicitacao_id no banco
        h.setSolicitacao(solicitacao);

        solicitacao.getHistorico().add(h);

        doacaoRepository.save(doacaoEscolhida);
        return solicitacaoRepository.save(solicitacao);
        } catch (Exception e) {
            throw new AprovarErroException("Erro ao vincular doacao a solicitacao");
        }
    }

    private String getNomeUsuarioLogado() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Pessoa pessoa) {
            return pessoa.getNome(); // Retorna o nome da entidade Pessoa logada
        }
        return "Sistema"; // Fallback para ações automáticas
    }

    public SolicitacaoDTO buscarDtoPorId(Long id) {
        return solicitacaoRepository.buscarDtoPorId(id);
        
    }

}
