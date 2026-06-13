package com.sistemadoacao.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.sistemadoacao.backend.config.Utils;
import com.sistemadoacao.backend.dto.AnaliseIAResponse;
import com.sistemadoacao.backend.dto.DashboardDTO;
import com.sistemadoacao.backend.dto.DoacaoRequestDTO;
import com.sistemadoacao.backend.dto.DoacaoResponseDTO;
import com.sistemadoacao.backend.dto.DoacaoResponseUserDTO;
import com.sistemadoacao.backend.dto.DoacaoReverDTO;
import com.sistemadoacao.backend.dto.DoacaoTDTO;
import com.sistemadoacao.backend.dto.GraficoDTO;
import com.sistemadoacao.backend.dto.GraficoEquipamentoDTO;
import com.sistemadoacao.backend.exception.AprovarErroException;
import com.sistemadoacao.backend.exception.EquipamentNullException;
import com.sistemadoacao.backend.exception.ErroCadastoException;
import com.sistemadoacao.backend.exception.FileStorageException;
import com.sistemadoacao.backend.exception.IdNullException;
import com.sistemadoacao.backend.exception.ImageErroLerException;
import com.sistemadoacao.backend.exception.ImageInvalidException;
import com.sistemadoacao.backend.exception.ImageNullException;
import com.sistemadoacao.backend.exception.NotFoundException;
import com.sistemadoacao.backend.exception.ReprovarErroException;
import com.sistemadoacao.backend.exception.RequestImageIaException;
import com.sistemadoacao.backend.exception.StatusNullException;
import com.sistemadoacao.backend.model.Doacao;
import com.sistemadoacao.backend.model.Equipamento;
import com.sistemadoacao.backend.model.HistoricoDoacao;
import com.sistemadoacao.backend.model.ImagemDoacao;
import com.sistemadoacao.backend.model.Pessoa;
import com.sistemadoacao.backend.model.Status;
import com.sistemadoacao.backend.repository.DoacaoRepository;
import com.sistemadoacao.backend.repository.HistoricoDoacaoRepository;
import com.sistemadoacao.backend.repository.PessoaRepository;
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
    private final PessoaRepository pessoaRepository;
    private final HistoricoDoacaoRepository historicoRepository;

    public DoacaoService(DoacaoRepository repository, UsuarioRepository usuarioRepository, FileService fileService,
            OpenAIService openAIService, Utils utils, EmailService emailService, PessoaRepository pessoaRepository, HistoricoDoacaoRepository historico) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
        this.fileService = fileService;
        this.openAIService = openAIService;
        this.utils = utils;
        this.emailService = emailService;
        this.pessoaRepository = pessoaRepository;
        this.historicoRepository = historico;
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

            emailService.enviarEmailStatusDoacao(utils.getEmailUsuarioLogado(), utils.getNomeUsuarioLogado(),
                    "APROVADO");
            return doacao;
        } catch (NotFoundException e) {
            log.error("Doação não encontrada para aprovação com ID {}", id);
            throw e; // Re-throw para ser tratado pelo GlobalExceptionHandler
        } catch (Exception e) {
            log.error("Erro ao aprovar doacao");
            throw new AprovarErroException("Erro ao aprovar doacao");
        }
    }

    public Doacao aprovarDoacaoParaReparo(@NonNull Long id, String motivo) {
        if (id == null) {
            throw new IdNullException("ID da doacao nao pode ser nulo.");
        }

        try {
            Doacao doacao = findByiD(id);
            doacao.setStatus(Status.APROVADO_REPARO);

            HistoricoDoacao historicoDoacao = new HistoricoDoacao();
            historicoDoacao.setDataAlteracao(LocalDateTime.now());
            historicoDoacao.setObservacao("Doacao aprovada para reparo: " + motivo);
            historicoDoacao.setExecutor(utils.getNomeUsuarioLogado());
            historicoDoacao.setStatus(Status.APROVADO_REPARO);
            historicoDoacao.setDoacao(doacao);

            doacao.getHistorico().add(historicoDoacao);
            repository.save(doacao);

            emailService.enviarEmailStatusDoacao(utils.getEmailUsuarioLogado(), utils.getNomeUsuarioLogado(), "APROVADO_REPARO");
            return doacao;
        } catch (NotFoundException e) {
            log.error("Doacao nao encontrada para aprovacao para reparo com ID {}", id);
            throw e;
        } catch (Exception e) {
            log.error("Erro ao aprovar doacao para reparo");
            throw new AprovarErroException("Erro ao aprovar doacao para reparo");
        }
    }

    public Doacao entregarDoacao(@NonNull Long id, String motivo) {
        if (id == null) {
            throw new IdNullException("ID da doacao nao pode ser nulo.");
        }

        Doacao doacao = findByiD(id);

        if (doacao.getStatus() != Status.APROVADO && doacao.getStatus() != Status.APROVADO_REPARO) {
            throw new AprovarErroException("Doacao so pode ser entregue quando esta aprovada ou aprovada para reparo.");
        }

        HistoricoDoacao historicoDoacao = new HistoricoDoacao();
        historicoDoacao.setDataAlteracao(LocalDateTime.now());
        historicoDoacao.setObservacao("Doacao entregue: " + motivo);
        historicoDoacao.setExecutor(utils.getNomeUsuarioLogado());
        historicoDoacao.setStatus(Status.ENTREGUE);
        historicoDoacao.setDoacao(doacao);

        doacao.setStatus(Status.ENTREGUE);
        doacao.getHistorico().add(historicoDoacao);

        emailService.enviarEmailStatusDoacao(utils.getEmailUsuarioLogado(), utils.getNomeUsuarioLogado(), "ENTREGUE");

        return repository.save(doacao);
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

            emailService.enviarEmailStatusDoacao(utils.getEmailUsuarioLogado(), utils.getNomeUsuarioLogado(),
                    "REPROVADO");
            return doacaoReprovar;
        } catch (NotFoundException e) {
            log.error("Doação não encontrada para reprovação com ID {}", id);
            throw e; // Re-throw para ser tratado pelo GlobalExceptionHandler
        } catch (Exception e) {
            log.error("Erro ao reprovar doacao");
            throw new ReprovarErroException("Erro ao reprovar doacao");
        }
    }

    public Doacao enviarDoacaoParaReparo(@NonNull Long id, String motivo) {
        try {
            Doacao doacao = findByiD(id);

            HistoricoDoacao historicoDoacao = new HistoricoDoacao();
            historicoDoacao.setDataAlteracao(LocalDateTime.now());
            historicoDoacao.setObservacao("Doacao em reparo: " + motivo);
            historicoDoacao.setExecutor(utils.getNomeUsuarioLogado());
            historicoDoacao.setStatus(Status.REPARO);
            historicoDoacao.setDoacao(doacao);

            doacao.getHistorico().add(historicoDoacao);
            doacao.setStatus(Status.REPARO);

            emailService.enviarEmailStatusDoacao(utils.getEmailUsuarioLogado(), utils.getNomeUsuarioLogado(), "REPARO");

            return repository.save(doacao);
        } catch (NotFoundException e) {
            log.error("Doacao nao encontrada para envio ao reparo com ID {}", id);
            throw e;
        } catch (Exception e) {
            log.error("Erro ao enviar doacao para reparo: {}", e.getMessage());
            throw new RuntimeException("Erro ao enviar doacao para reparo", e);
        }
    }

    public Doacao enviarDoacaoParaEstoque(@NonNull Long id, String motivo) {
        try {
            Doacao doacao = findByiD(id);

            HistoricoDoacao historicoDoacao = new HistoricoDoacao();
            historicoDoacao.setDataAlteracao(LocalDateTime.now());
            historicoDoacao.setObservacao("Doacao em estoque: " + motivo);
            historicoDoacao.setExecutor(utils.getNomeUsuarioLogado());
            historicoDoacao.setStatus(Status.ESTOQUE);
            historicoDoacao.setDoacao(doacao);

            doacao.getHistorico().add(historicoDoacao);
            doacao.setStatus(Status.ESTOQUE);

            emailService.enviarEmailStatusDoacao(utils.getEmailUsuarioLogado(), utils.getNomeUsuarioLogado(), "ESTOQUE");

            return repository.save(doacao);
        } catch (NotFoundException e) {
            log.error("Doacao nao encontrada para envio ao estoque com ID {}", id);
            throw e;
        } catch (Exception e) {
            log.error("Erro ao enviar doacao para estoque: {}", e.getMessage());
            throw new RuntimeException("Erro ao enviar doacao para estoque", e);
        }
    }

    public Doacao enviarDoacaoParaPendente(@NonNull Long id, String motivo) {
        try {
            Doacao doacao = findByiD(id);

            HistoricoDoacao historicoDoacao = new HistoricoDoacao();
            historicoDoacao.setDataAlteracao(LocalDateTime.now());
            historicoDoacao.setObservacao("Doacao pendente: " + motivo);
            historicoDoacao.setExecutor(utils.getNomeUsuarioLogado());
            historicoDoacao.setStatus(Status.PENDENTE);
            historicoDoacao.setDoacao(doacao);

            doacao.getHistorico().add(historicoDoacao);
            doacao.setStatus(Status.PENDENTE);

            emailService.enviarEmailStatusDoacao(utils.getEmailUsuarioLogado(), utils.getNomeUsuarioLogado(), "PENDENTE");
            return repository.save(doacao);
        } catch (NotFoundException e) {
            log.error("Doacao nao encontrada para envio a pendente com ID {}", id);
            throw e;
        } catch (Exception e) {
            log.error("Erro ao enviar doacao para pendente: {}", e.getMessage());
            throw new RuntimeException("Erro ao enviar doacao para pendente", e);
        }
    }

    public Doacao enviarDoacaoParaAprovadoReparo(@NonNull Long id, String motivo) {
        try {
            Doacao doacao = findByiD(id);

            HistoricoDoacao historicoDoacao = new HistoricoDoacao();
            historicoDoacao.setDataAlteracao(LocalDateTime.now());
            historicoDoacao.setObservacao("Doacao aprovada para reparo: " + motivo);
            historicoDoacao.setExecutor(utils.getNomeUsuarioLogado());
            historicoDoacao.setStatus(Status.APROVADO_REPARO);
            historicoDoacao.setDoacao(doacao);

            doacao.getHistorico().add(historicoDoacao);
            doacao.setStatus(Status.APROVADO_REPARO);

            emailService.enviarEmailStatusDoacao(utils.getEmailUsuarioLogado(), utils.getNomeUsuarioLogado(), "APROVADO REPARO");

            return repository.save(doacao);
        } catch (NotFoundException e) {
            log.error("Doacao nao encontrada para envio a aprovado reparo com ID {}", id);
            throw e;
        } catch (Exception e) {
            log.error("Erro ao enviar doacao para aprovado reparo: {}", e.getMessage());
            throw new RuntimeException("Erro ao enviar doacao para aprovado reparo", e);
        }
    }

    public Doacao enviarDoacaoParaDoado(@NonNull Long id, String motivo) {
        try {
            Doacao doacao = findByiD(id);

            HistoricoDoacao historicoDoacao = new HistoricoDoacao();
            historicoDoacao.setDataAlteracao(LocalDateTime.now());
            historicoDoacao.setObservacao("Doacao marcada como doada: " + motivo);
            historicoDoacao.setExecutor(utils.getNomeUsuarioLogado());
            historicoDoacao.setStatus(Status.DOADO);
            historicoDoacao.setDoacao(doacao);

            doacao.getHistorico().add(historicoDoacao);
            doacao.setStatus(Status.DOADO);
            doacao.setDataEntrega(LocalDate.now());

            emailService.enviarEmailStatusDoacao(utils.getEmailUsuarioLogado(), utils.getNomeUsuarioLogado(), "DOADO");

            return repository.save(doacao);
        } catch (NotFoundException e) {
            log.error("Doacao nao encontrada para envio a doado com ID {}", id);
            throw e;
        } catch (Exception e) {
            log.error("Erro ao enviar doacao para doado: {}", e.getMessage());
            throw new RuntimeException("Erro ao enviar doacao para doado", e);
        }
    }

    public Long totalDoacoes() {
        return repository.count();
    }

    public Doacao listarId(Long id) {
        if (id == null) {
            throw new IdNullException("ID não pode ser nulo");
        }
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Doacao não encontrado com ID: " + id));
    }

    public DoacaoTDTO listarDoacaoPorId(Long id) {
        if (id == null) {
            throw new IdNullException("ID não pode ser nulo");
        }
        Doacao doacao = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Doacao não encontrado com ID: " + id));
        Pessoa usuario = pessoaRepository.findById(doacao.getDoadorId())
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado com ID: " + doacao.getDoadorId()));

        return new DoacaoTDTO(doacao, usuario.getNome(), usuario.getCpf());
    }

    public boolean deleteDoacao(@NonNull Long id) {
        Doacao doacao = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Doacao não encontrado com ID: " + id));
        if (doacao.getImagens() != null) {
            try {
                doacao.getImagens().stream()
                        .map(ImagemDoacao::getUrl)
                        .filter(url -> url != null)
                        .forEach(fileService::deletarArquivo);

            } catch (Exception e) {
                log.error("Erro ao deletar arquivo da doação com ID {}: {}", id, e.getMessage());
                throw new FileStorageException("Erro ao deletar arquivo associado à doação com ID: " + id);
            }
        }
        repository.delete(doacao);
        return true;
    }

    public Doacao updateDoacao(@NonNull Long id, DoacaoRequestDTO atualizado) {

        Doacao existente = listarId(id);

        if (existente == null) {
            log.error("Doação não encontrado com ID {}", id);
            throw new NotFoundException("Doação não encontrado com ID: " + id);
        }

        validarImagens(atualizado.imagens());
        if ("string".equals(atualizado.imagens().get(0).getOriginalFilename())) {
            log.error("Imagem nula ou inválida para doação com ID {}", id);
            throw new ImageNullException("Imagem nula ou inválida para doação com ID: " + id);
        }

        // validar imagem e salvar
        List<ImagemDoacao> novasImagens = salvarImagens(atualizado.imagens());

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
            analise = openAIService.analisarImagens(atualizado.imagens());
            log.debug("Resposta da IA: {}", analise);
            switch (analise.status()) {
                case APROVADO:
                    existente.setStatus(Status.APROVADO);
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
        existente.getImagens().clear();
        existente.getImagens().addAll(novasImagens);

        // atualizar historico
        existente = atualizarHistoricoDoacao(existente, analise.descricao() + " - " + analise.recomendacao());

        // O CascadeType.ALL salvará a imagem automaticamente
        existente = atualizarHistoricoDoacao(existente, analise.descricao() + " - " + analise.recomendacao());
        log.debug("Doação cadastrada com ID {}", existente.getId());

        emailService.enviarEmailStatusDoacao(utils.getEmailUsuarioLogado(), utils.getNomeUsuarioLogado(), existente.getStatus().toString());

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
                repository.countByStatus(Status.APROVADO_REPARO),
                repository.countByStatus(Status.REPROVADO),
                repository.countByStatus(Status.REPARO),
                grafico,
                graficoEquipamento);
    }

    public DoacaoResponseDTO cadastrarDoacao(DoacaoRequestDTO doacaoRequest, Long id) throws RequestImageIaException {
        log.info("ID USUARIO: {}", id);
        try {
            validarImagens(doacaoRequest.imagens());
            List<ImagemDoacao> novasImagens = salvarImagens(doacaoRequest.imagens());
            log.debug("{} arquivos salvos para a doacao", novasImagens.size());
            // Doacao e associar a Imagem
            Doacao novaDoacao = new Doacao();
            novaDoacao.setDoadorId(id);
            novaDoacao.setEquipamento(doacaoRequest.equipamento());
            novaDoacao.setQuantidade(doacaoRequest.quantidade());
            novaDoacao.setDescricao(doacaoRequest.descricao());
            novaDoacao.setStatusConservacao(doacaoRequest.conservacao());
            // Chamar service IA para analisar a doação e definir o status inicial //
            // (APROVADO_IA ou REPARO ou REPROVADO)
            AnaliseIAResponse analise = null;
            String observacaoHistorico;
            try {
                analise = openAIService.analisarImagens(doacaoRequest.imagens());
                log.debug("Resposta da IA: {}", analise);
                novaDoacao.setStatus(Status.PENDENTE);
                observacaoHistorico = analise.descricao() + " - " + analise.recomendacao();
            } catch (RequestImageIaException e) {
                log.error("Erro na analise da IA. Doacao sera cadastrada como PENDENTE: {}", e.getMessage());
                novaDoacao.setStatus(Status.PENDENTE);
                observacaoHistorico = "Analise da IA nao realizada: " + e.getMessage();
            }
            novaDoacao.setImagens(novasImagens);

            // O CascadeType.ALL salvará a imagem automaticamente
            Doacao salva = atualizarHistoricoDoacao(novaDoacao, observacaoHistorico);
            log.debug("Doação cadastrada com ID {}", salva.getId());

            if (analise != null && analise.status().equals(Status.REPROVADO)) {
                emailService.enviarEmailAvaliacaoIA(utils.getEmailUsuarioLogado(), utils.getNomeUsuarioLogado(), analise
                        .descricao() + " - STATUS: " + analise.status()
                        + " -  \nInfelizmente sua doação foi avaliada pela IA como REPROVADA. \n Caso queira uma reavaliação, por favor, solicite uma revisao pelo tecnico");
            } else if (analise != null) {
                emailService.enviarEmailAvaliacaoIA(utils.getEmailUsuarioLogado(), utils.getNomeUsuarioLogado(), analise
                        .descricao() + " - STATUS: " + analise.status()
                        + " - \nParabéns! Sua doação foi avaliada pela IA como APROVADA ou REPARO. \n Por favor, enviar sua doação para o endereço de coleta.");
            }

            return new DoacaoResponseDTO(salva);
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

    private void validarImagens(List<MultipartFile> imagens) {
        if (imagens == null || imagens.isEmpty()) {
            throw new ImageNullException("Envie pelo menos uma imagem da doacao.");
        }
        if (imagens.size() > 3) {
            throw new ImageInvalidException("A doacao pode ter no maximo tres imagens.");
        }
        if (imagens.stream().anyMatch(imagem -> imagem == null || imagem.isEmpty())) {
            throw new ImageNullException("Uma das imagens enviadas esta vazia.");
        }
    }

    private List<ImagemDoacao> salvarImagens(List<MultipartFile> imagens) {
        List<ImagemDoacao> imagensSalvas = new ArrayList<>();
        for (MultipartFile imagem : imagens) {
            imagensSalvas.add(new ImagemDoacao(fileService.salvarArquivo(imagem)));
        }
        return imagensSalvas;
    }

    // TODO: Melhorias futuras - usuario poderia pedir para revisar analise de ia

    // public Doacao reverDoacao(Long id) {
    // return repository.findById(id).map(doacao -> {
    // doacao.setStatus(Status.REVER);
    // return atualizarHistoricoDoacao(doacao, "Doação enviada para revisão");
    // }).orElseThrow(() -> new NotFoundException("Doação não encontrada com ID: " +
    // id));
    // }

    public List<DoacaoReverDTO> listarDoacoesTecnico() {
        List<DoacaoReverDTO> doacoes = repository.buscarDoacoesTecnico();
        if (doacoes.isEmpty()) {
            log.warn("Nenhuma doação encontrada com status listados.");
            throw new NotFoundException("Nenhuma doação encontrada para revisão técnica.");
        } else {
            
            for (DoacaoReverDTO doacao : doacoes) {
                log.info("Doação ID: {}, Status: {}, Doador: {}", doacao.getId(), doacao.getStatus(), doacao.getNome());
            }
            return doacoes;
        }

    }

    public DoacaoReverDTO listarDoacaoReverReparoPorId(Long id) {
        return repository.buscarDoacoesComDoador(Arrays.asList(Status.PENDENTE, Status.REPARO, Status.APROVADO_REPARO))
                .stream()
                .filter(d -> d.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Doação não encontrada com ID: " + id));
    }

    public List<DoacaoResponseUserDTO> listarDoacoesUser() {
        return repository.buscarTodasUser();

    }

    public HistoricoDoacao avaliacaoIA(Long id) {
        return historicoRepository.findTopByDoacao_IdOrderByDataAlteracaoDesc(id);
    }

    public Doacao doacaoReciclagem(Long id, String motivo) {
        try {
            Doacao doacao = findByiD(id);

            HistoricoDoacao historicoDoacao = new HistoricoDoacao();
            historicoDoacao.setDataAlteracao(LocalDateTime.now());
            historicoDoacao.setObservacao("Doacao marcada como reciclagem: " + motivo);
            historicoDoacao.setExecutor(utils.getNomeUsuarioLogado());
            historicoDoacao.setStatus(Status.RECICLAGEM);
            historicoDoacao.setDoacao(doacao);

            doacao.getHistorico().add(historicoDoacao);
            doacao.setStatus(Status.RECICLAGEM);
            doacao.setDataEntrega(LocalDate.now());

            emailService.enviarEmailStatusDoacao(utils.getEmailUsuarioLogado(), utils.getNomeUsuarioLogado(), "RECICLAGEM");

            return repository.save(doacao);
        } catch (NotFoundException e) {
            log.error("Doacao nao encontrada com ID {}", id);
            throw e;
        } catch (Exception e) {
            log.error("Erro ao enviar doacao  {}", e.getMessage());
            throw new RuntimeException("Erro ao enviar doacao para reciclagem", e);
        }
    }
}
