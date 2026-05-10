package com.sistemadoacao.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.sistemadoacao.backend.config.Utils;
import com.sistemadoacao.backend.dto.ReparoResponseDTO;
import com.sistemadoacao.backend.model.Doacao;
import com.sistemadoacao.backend.model.HistoricoDoacao;
import com.sistemadoacao.backend.model.Reparo;
import com.sistemadoacao.backend.model.Status;
import com.sistemadoacao.backend.repository.DoacaoRepository;
import com.sistemadoacao.backend.repository.ReparoRepository;

import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ReparoService {

    private final ReparoRepository reparoRepository;
    private final DoacaoRepository doacaoRepository;
    private final Utils utils;

    public ReparoService(ReparoRepository reparoRepository, DoacaoRepository doacaoRepository, Utils utils) {
        this.reparoRepository = reparoRepository;
        this.doacaoRepository = doacaoRepository;
        this.utils = utils;
    }

    public List<ReparoResponseDTO> listarReparos() {
        List<Reparo> reparos = reparoRepository.findAll();
        return reparos.stream().map(reparo -> new ReparoResponseDTO(reparo)).toList();
    }

    public ReparoResponseDTO save(String descricao, @NonNull Long id_usuario, @NonNull Long id_doacao) {
        try {

            Doacao doacao = doacaoRepository.findById(id_doacao)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Doacao nao encontrada com ID: " + id_doacao));

            Reparo novoReparo = new Reparo();
            // Historico
            HistoricoDoacao historicoDoacao = new HistoricoDoacao();
            historicoDoacao.setDataAlteracao(LocalDateTime.now());
            historicoDoacao.setObservacao("Doacao em reparo");
            historicoDoacao.setExecutor(utils.getNomeUsuarioLogado());
            historicoDoacao.setStatus(Status.REPARO);

            historicoDoacao.setDoacao(doacao);
            doacao.setStatus(Status.REPARO);
            doacao.getHistorico().add(historicoDoacao);
            // fim historico

            novoReparo.setDoacao(doacao);
            novoReparo.setDescricao(descricao);
            novoReparo.setIdTecnico(id_usuario);

            Reparo salvo = reparoRepository.save(novoReparo);

            log.debug("Reparo salvo {}", salvo);

            return new ReparoResponseDTO(salvo);

        } catch (Exception e) {
            log.error("Erro ao salvar reparo: {}", e.getMessage());

            throw e;
        }
    }

    public List<ReparoResponseDTO> listarReparosDoacao(Long id) {
        List<Reparo> reparos = reparoRepository.findAllByDoacaoId(id);
        return reparos.stream().map(reparo -> new ReparoResponseDTO(reparo)).toList();
    }

    public void concluirReparoAprovacao(@NonNull Long id, String motivo) {

        Reparo reparoConcluir = reparoRepository.findById(id).orElseThrow();

        if (reparoConcluir == null) {
            throw new RuntimeException("Erro: Reparo nao encontrado.");
        }

        Doacao doacao = doacaoRepository.findById(reparoConcluir.getDoacao().getId()).orElseThrow();

        if (doacao == null) {
            throw new RuntimeException("Erro: Doacao do reparo nao encontrada");
        }

        // Historico
        HistoricoDoacao historicoDoacao = new HistoricoDoacao();
        historicoDoacao.setDataAlteracao(LocalDateTime.now());
        historicoDoacao.setObservacao("Doacao em reparo concluido");
        historicoDoacao.setExecutor(utils.getNomeUsuarioLogado());
        historicoDoacao.setStatus(Status.APROVADO);

        historicoDoacao.setDoacao(doacao);

        doacao.setStatus(Status.APROVADO);
        doacao.getHistorico().add(historicoDoacao);

        reparoConcluir.setDataFim(LocalDateTime.now());
        // fim historico

        reparoConcluir.setDoacao(doacao);
        reparoConcluir.setConclusao(motivo);
        reparoConcluir.setIdTecnico(utils.getIdUsuarioLogado());

        Reparo salvo = reparoRepository.save(reparoConcluir);

        log.debug("Reparo salvo {}", salvo);

    }

    public void concluirReparoDescarte(@NonNull Long id, String motivo) {
        Reparo reparoConcluir = reparoRepository.findById(id).orElseThrow();

        if(reparoConcluir == null){
            throw new RuntimeException("Erro: Reparo nao encontrado.");
        }

        Doacao doacao = doacaoRepository.findById(reparoConcluir.getDoacao().getId()).orElseThrow();

        if(doacao == null){
            throw new RuntimeException("Erro: Doacao do reparo nao encontrada");
        }

        // Historico
            HistoricoDoacao historicoDoacao = new HistoricoDoacao();
            historicoDoacao.setDataAlteracao(LocalDateTime.now());
            historicoDoacao.setObservacao("Doacao para descarte");
            historicoDoacao.setExecutor(utils.getNomeUsuarioLogado());
            historicoDoacao.setStatus(Status.DESCARTE);

            historicoDoacao.setDoacao(doacao);

            doacao.setStatus(Status.DESCARTE);
            doacao.getHistorico().add(historicoDoacao);

            reparoConcluir.setDataFim(LocalDateTime.now());
        // fim historico

        reparoConcluir.setDoacao(doacao);
        reparoConcluir.setConclusao(motivo);
        reparoConcluir.setIdTecnico(utils.getIdUsuarioLogado());

        reparoRepository.save(reparoConcluir);
    }

    public List<ReparoResponseDTO> listarReparosTecnico(Long idUsuarioLogado) {
        log.info("id do tecnico logado: {}", idUsuarioLogado);
        List<Reparo> reparos = reparoRepository.findAllByIdTecnico(idUsuarioLogado);
        return reparos.stream().map(reparo -> new ReparoResponseDTO(reparo)).toList();
    }

}
