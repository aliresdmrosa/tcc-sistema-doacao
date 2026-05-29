package com.sistemadoacao.backend.service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Service;

import com.sistemadoacao.backend.config.Utils;
import com.sistemadoacao.backend.dto.AnaliseIAResponse;
import com.sistemadoacao.backend.dto.DashboardDTO;
import com.sistemadoacao.backend.dto.DoacaoRequestDTO;
import com.sistemadoacao.backend.dto.DoacaoResponseDTO;
import com.sistemadoacao.backend.dto.DoacaoReverDTO;
import com.sistemadoacao.backend.dto.GraficoDTO;
import com.sistemadoacao.backend.dto.GraficoEquipamentoDTO;
import com.sistemadoacao.backend.exception.AprovarErroException;
import com.sistemadoacao.backend.exception.EquipamentNullException;
import com.sistemadoacao.backend.exception.ErroCadastoException;
import com.sistemadoacao.backend.exception.FileStorageException;
import com.sistemadoacao.backend.exception.IdNullException;
import com.sistemadoacao.backend.exception.ImageErroLerException;
import com.sistemadoacao.backend.exception.ImageNullException;
import com.sistemadoacao.backend.exception.NotFoundException;
import com.sistemadoacao.backend.exception.ReprovarErroException;
import com.sistemadoacao.backend.exception.RequestImageIaException;
import com.sistemadoacao.backend.exception.StatusNullException;
import com.sistemadoacao.backend.model.Doacao;
import com.sistemadoacao.backend.model.Equipamento;
import com.sistemadoacao.backend.model.HistoricoDoacao;
import com.sistemadoacao.backend.model.ImagemDoacao;
import com.sistemadoacao.backend.model.Status;
import com.sistemadoacao.backend.repository.DoacaoRepository;
import com.sistemadoacao.backend.repository.UsuarioRepository;

import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class DoacaoService {

    private final DoacaoRepository repository;
    private final UsuarioRepository usuarioRepository;
    private final FileService fileService;
    private final OpenAIService openAIService;
    private final Utils utils;
    private final EmailService emailService;

    public DoacaoService(DoacaoRepository repository, UsuarioRepository usuarioRepository, FileService fileService,
            OpenAIService openAIService, Utils utils, EmailService emailService) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
        this.fileService = fileService;
        this.openAIService = openAIService;
        this.utils = utils;
        this.emailService = emailService;
    }

    public Doacao atualizarHistoricoDoacao(@NonNull Doacao novaDoacao, String observacao) {

        // Historico
        HistoricoDoacao histDoacao = new HistoricoDoacao();
        histDoacao.setDataAlteracao(LocalDateTime.now());
        histDoacao.setObservacao(observacao);
        histDoacao.setExecutor(utils.getNomeUsuarioLogado());
        histDoacao.setStatus(novaDoacao.getStatus());

        histDoacao.setDoacao(novaDoacao);
        novaDoacao.getHistorico().add(histDoacao);
        novaDoacao.setDoadorId(utils.getIdUsuarioLogado());
        return repository.save(novaDoacao);

    }

    public List<Doacao> listarDoacoes() {
        List<Doacao> doacoes = null;
        try {
            doacoes = repository.findAll();
            return doacoes;
        } catch (Exception e) {
            log.error("Erro ao listar doações: {}", e.getMessage());
            throw new RuntimeException("Erro ao listar doações", e);
        }

    }

    public List<Doacao> listarDoacoesPorEquipamento(Equipamento e) {
        List<Doacao> doacoes = repository.findByEquipamento(e);
        if (e == null || e.toString().isEmpty()) {
            log.warn("Equipamento nulo ou vazio fornecido para listar doações por equipamento.");
            throw new EquipamentNullException("Equipamento não pode ser nulo ou vazio.");
        }

        if (doacoes.isEmpty()) {
            log.warn("Nenhuma doação encontrada para o equipamento: {}", e);
            throw new NotFoundException("Nenhuma doacao encontrada para o equipamento");
        } else {
            log.info("Doações encontradas para o equipamento {}: {} registros", e, doacoes.size());
            return repository.findByEquipamento(e);
        }
    }

    public List<Doacao> listarDoacoesPorStatus(Status status) {
        List<Doacao> doacoes = repository.findByStatus(status);
        if (status == null) {
            log.warn("Status nulo fornecido para listar doações por status.");
            throw new StatusNullException("Status não pode ser nulo.");
        }
        return doacoes;
    }

    public List<Doacao> listarAprovados() {
        return repository.findAprovadas().stream()
                .map(obj -> (Doacao) obj[0])
                .toList();
    }

    public Doacao findByiD(@NonNull Long id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException("Doacao nao encontada com ID: " + id));
    }

    public Doacao aprovarDoacao(@NonNull Long id, String motivo) {
        if (id == null) {
            throw new IdNullException("ID da doação nao pode ser nulo.");
        }

        try {
            Doacao doacaoAprovar = findByiD(id);
            // historico
            HistoricoDoacao historicoDoacao = new HistoricoDoacao();
            historicoDoacao.setDataAlteracao(LocalDateTime.now());
            historicoDoacao.setObservacao("Doacao aprovada: " + motivo.replace("{}", motivo));
            historicoDoacao.setExecutor(utils.getNomeUsuarioLogado());
            historicoDoacao.setStatus(Status.APROVADO);

            historicoDoacao.setDoacao(doacaoAprovar);

            doacaoAprovar.getHistorico().add(historicoDoacao);

            Doacao doacao = repository.findById(id).orElseThrow();
            doacao.setStatus(Status.APROVADO);
            repository.save(doacao);

            emailService.enviarEmailStatusDoacao(utils.getEmailUsuarioLogado(), utils.getNomeUsuarioLogado(), "APROVADO");
            return doacao;
        } catch (NotFoundException e) {
            log.error("Doação não encontrada para aprovação com ID {}", id);
            throw e; // Re-throw para ser tratado pelo GlobalExceptionHandler
        } catch (Exception e) {
            log.error("Erro ao aprovar doacao");
            throw new AprovarErroException("Erro ao aprovar doacao");
        }
    }

    public Doacao reprovarDoacao(@NonNull Long id, String motivo) {

        try {

            Doacao doacaoReprovar = findByiD(id);
            // historico
            HistoricoDoacao historicoDoacao = new HistoricoDoacao();
            historicoDoacao.setDataAlteracao(LocalDateTime.now());
            historicoDoacao.setObservacao(motivo);
            historicoDoacao.setExecutor(utils.getNomeUsuarioLogado());
            historicoDoacao.setStatus(Status.REPROVADO);

            historicoDoacao.setDoacao(doacaoReprovar);

            doacaoReprovar.getHistorico().add(historicoDoacao);

            doacaoReprovar.setStatus(Status.REPROVADO);
            repository.save(doacaoReprovar);

            emailService.enviarEmailStatusDoacao(utils.getEmailUsuarioLogado(), utils.getNomeUsuarioLogado(), "REPROVADO");
            return doacaoReprovar;
        } catch (NotFoundException e) {
            log.error("Doação não encontrada para reprovação com ID {}", id);
            throw e; // Re-throw para ser tratado pelo GlobalExceptionHandler
        } catch (Exception e) {
            log.error("Erro ao reprovar doacao");
            throw new ReprovarErroException("Erro ao reprovar doacao");
        }
    }

    public Long totalDoacoes() {
        return repository.count();
    }

    public Doacao listarDoacaoPorId(Long id) {
        if (id == null) {
            throw new IdNullException("ID não pode ser nulo");
        }
        Doacao doacao = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Doacao não encontrado com ID: " + id));
        return doacao;
    }

    public boolean deleteDoacao(@NonNull Long id) {
        Doacao doacao = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Doacao não encontrado com ID: " + id));
        if (doacao.getImagem() != null && doacao.getImagem().getUrl() != null) {
            try {
                fileService.deletarArquivo(doacao.getImagem().getUrl());

            } catch (Exception e) {
                log.error("Erro ao deletar arquivo da doação com ID {}: {}", id, e.getMessage());
                throw new FileStorageException("Erro ao deletar arquivo associado à doação com ID: " + id);
            }
        }
        repository.delete(doacao);
        return true;
    }

    public Doacao updateDoacao(@NonNull Long id, DoacaoRequestDTO atualizado) {

        Doacao existente = listarDoacaoPorId(id);

        if (existente == null) {
            log.error("Doação não encontrado com ID {}", id);
            throw new NotFoundException("Doação não encontrado com ID: " + id);
        }

        if ("string".equals(atualizado.imagem().getOriginalFilename())) {
            log.error("Imagem nula ou inválida para doação com ID {}", id);
            throw new ImageNullException("Imagem nula ou inválida para doação com ID: " + id);
        }

        // validar imagem e salvar
        String nomeArquivoAtualizado = fileService.salvarArquivo(atualizado.imagem());
        ImagemDoacao nomeImagem = new ImagemDoacao(nomeArquivoAtualizado);

        // atualizar campos da doacao
        if (atualizado.equipamento() != null) {
            existente.setEquipamento(atualizado.equipamento());
        }

        if (atualizado.quantidade() != null) {
            existente.setQuantidade(atualizado.quantidade());
        }

        if (atualizado.descricao() != null) {
            existente.setDescricao(atualizado.descricao());
        }

        if (atualizado.conservacao() != null) {
            existente.setStatusConservacao(atualizado.conservacao());
        }

        // nova imagem doacao deve ser analisada pela ia novamente
        existente.setStatus(Status.PENDENTE);

        // analisar com ia
        AnaliseIAResponse analise = null;
        try {
            analise = openAIService.analisarImagem(atualizado.imagem());
            log.debug("Resposta da IA: {}", analise);
            switch (analise.status()) {
                case APROVADO:
                    existente.setStatus(Status.APROVADO_IA);
                    break;
                case REPARO:
                    existente.setStatus(Status.REPARO);
                    break;
                default:
                    existente.setStatus(Status.REPROVADO);
                    break;
            }
        } catch (Exception e) {
            log.error("Erro ao analisar imagem da doação com IA: {}", e.getMessage());
            throw new RequestImageIaException("Erro ao analisar imagem da doação com IA: " + e.getMessage());
        }

        // atualizar imagem
        if (atualizado.imagem() != null) {
            existente.setImagem(nomeImagem);
        }

        // atualizar historico
        existente = atualizarHistoricoDoacao(existente, analise.descricao() + " - " + analise.recomendacao());

        // O CascadeType.ALL salvará a imagem automaticamente
        existente = atualizarHistoricoDoacao(existente, analise.descricao() + " - " + analise.recomendacao());
        log.debug("Doação cadastrada com ID {}", existente.getId());

        return repository.save(existente);
    }

    public DashboardDTO gerarRelatorioGeral() {
        List<Object[]> resultadosBrutosPorEquipamento = repository.findTotalPorEquipamento();

        List<Object[]> resultadosBrutos = repository.findDoacoesMensais();

        // Converte a lista de Object[] para Lista de GraficoDTO
        List<GraficoDTO> grafico = resultadosBrutos.stream()
                .map(p -> new GraficoDTO((Integer) p[0], (Long) p[1]))
                .toList();

        List<GraficoEquipamentoDTO> graficoEquipamento = resultadosBrutosPorEquipamento.stream()
                .map(p -> new GraficoEquipamentoDTO(p[0].toString(), (Long) p[1]))
                .toList();
        return new DashboardDTO(
                usuarioRepository.count(),
                repository.count(),
                repository.countByStatus(Status.DOADO),
                repository.countByStatus(Status.APROVADO),
                repository.countByStatus(Status.APROVADO_IA),
                repository.countByStatus(Status.REPROVADO),
                repository.countByStatus(Status.REPARO),
                grafico,
                graficoEquipamento);
    }

    public DoacaoResponseDTO cadastrarDoacao(DoacaoRequestDTO doacaoRequest, Long id) throws RequestImageIaException {
        ImagemDoacao novaImagem = null;
        String nomeArquivo = null;
        log.info("ID USUARIO: ", id);
        try {
            log.debug("Dados recebidos da requisicao: {}", doacaoRequest.imagem().getOriginalFilename());
            nomeArquivo = fileService.salvarArquivo(doacaoRequest.imagem());
            // Imagem com a URL
            novaImagem = new ImagemDoacao(nomeArquivo);
            log.debug("Arquivo salvo com nome {}", nomeArquivo);
            // Doacao e associar a Imagem
            Doacao novaDoacao = new Doacao();
            novaDoacao.setDoadorId(id);
            novaDoacao.setEquipamento(doacaoRequest.equipamento());
            novaDoacao.setQuantidade(doacaoRequest.quantidade());
            novaDoacao.setDescricao(doacaoRequest.descricao());
            novaDoacao.setStatusConservacao(doacaoRequest.conservacao());
            // Chamar service IA para analisar a doação e definir o status inicial //
            // (APROVADO_IA ou REPARO ou REPROVADO)
            AnaliseIAResponse analise = openAIService.analisarImagem(doacaoRequest.imagem());
            log.debug("Resposta da IA: {}", analise);
            if (analise.status().equals(Status.APROVADO)) {
                novaDoacao.setStatus(Status.APROVADO_IA);
            } else if (analise.status().equals(Status.REPARO)) {
                novaDoacao.setStatus(Status.REPARO);

            } else {
                novaDoacao.setStatus(Status.REPROVADO);
            }
            novaDoacao.setImagem(novaImagem);

            // O CascadeType.ALL salvará a imagem automaticamente
            Doacao salva = atualizarHistoricoDoacao(novaDoacao, analise.descricao() + " - " + analise.recomendacao());
            log.debug("Doação cadastrada com ID {}", salva.getId());

            if (analise.status().equals(Status.REPROVADO)) {
                emailService.enviarEmailAvaliacaoIA(utils.getEmailUsuarioLogado(), utils.getNomeUsuarioLogado(), analise
                        .descricao() + " - STATUS: " + analise.status()
                        + " -  \nInfelizmente sua doação foi avaliada pela IA como REPROVADA. \n Caso queira uma reavaliação, por favor, solicite uma revisao pelo tecnico");
            } else {
                emailService.enviarEmailAvaliacaoIA(utils.getEmailUsuarioLogado(), utils.getNomeUsuarioLogado(), analise
                        .descricao() + " - STATUS: " + analise.status()
                        + " - \nParabéns! Sua doação foi avaliada pela IA como APROVADA ou REPARO. \n Por favor, enviar sua doação para o endereço de coleta.");
            }

            return new DoacaoResponseDTO(
                    salva.getId(),
                    salva.getEquipamento(),
                    salva.getQuantidade(),
                    salva.getDescricao(),
                    salva.getStatus(),
                    salva.getStatusConservacao(),
                    salva.getDataCadastro());
        } catch (RequestImageIaException e4) {
            log.error("Erro ao analisar imagem da doação com IA: {}", e4.getMessage());
            throw new RequestImageIaException("Formato de imagem invalido");
        } catch (ImageErroLerException e3) {
            log.error("Erro ao cadastrar doação", e3);
            throw new ErroCadastoException("Erro ao cadastrar doação", e3);
        }
    }

    public List<DoacaoResponseDTO> listarDoacoesPorUsuario(Long id) {
        if (id == null)
            throw new IdNullException("ID não pode ser nulo");
        return repository.findByDoadorId(id).stream().map(DoacaoResponseDTO::new).toList();
    }

    public Doacao reverDoacao(Long id) {
        return repository.findById(id).map(doacao -> {
            doacao.setStatus(Status.REVER);
            return atualizarHistoricoDoacao(doacao, "Doação enviada para revisão");
        }).orElseThrow(() -> new NotFoundException("Doação não encontrada com ID: " + id));
    }

    public List<DoacaoReverDTO> listarDoacoesReverReparo() {
        return repository.buscarDoacoesComDoador(Arrays.asList(Status.REVER, Status.REPARO));
    }

    public DoacaoReverDTO listarDoacaoReverReparoPorId(Long id) {
        return repository.buscarDoacoesComDoador(Arrays.asList(Status.REVER, Status.REPARO)).stream()
                .filter(d -> d.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Doação não encontrada com ID: " + id));
    }
}
