package com.sistemadoacao.backend.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.sistemadoacao.backend.model.Pessoa;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sistemadoacao.backend.dto.SolicitacaoDTO;
import com.sistemadoacao.backend.dto.SolicitacaoRequestDTO;
import com.sistemadoacao.backend.model.Solicitacao;
import com.sistemadoacao.backend.service.SolicitacaoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/solicitacao")
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Solicitacao", description = "Endpoints para gerenciamento de solicitações")
public class SolicitacaoController {

    private final SolicitacaoService service;

    public SolicitacaoController(SolicitacaoService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Cadastra nova solicitação", description = "Cadastra uma nova solicitação associada ao usuário autenticado.")
    @ApiResponse(responseCode = "200", description = "Solicitacao salva com sucesso")
    @ApiResponse(responseCode = "400", description = "Requisição inválida", content = @Content)
    @ApiResponse(responseCode = "403", description = "Usuário não autenticado", content = @Content)
    @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content)
    public ResponseEntity<Solicitacao> cadastrarSolicitacao(@RequestBody @Valid SolicitacaoRequestDTO dto,
            @AuthenticationPrincipal Pessoa principal) {
        return ResponseEntity.ok(service.save(dto, principal.getId()));
    }
    
    @GetMapping("/usuario")
    @Operation(summary = "Lista solicitações do usuário autenticado", description = "Retorna todas as solicitações associadas ao usuário autenticado.")
    @ApiResponse(responseCode = "200", description = "Lista de solicitações retornada com sucesso")
    @ApiResponse(responseCode = "403", description = "Usuário não autenticado", content = @Content)
    @ApiResponse(responseCode = "404", description = "Nenhuma solicitação encontrada para o usuário", content = @Content)
    @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content)
    public ResponseEntity<List<Solicitacao>> listarPorUsuario(@AuthenticationPrincipal Pessoa principal) {
        return ResponseEntity.ok(service.findByUsuarioId(principal.getId()));
    }

    @GetMapping("/usuario/{id}")
    @Operation(summary = "Lista solicitacoes de um usuario pelo ID", description = "Retorna todas as solicitacoes associadas ao usuario informado.")
    @ApiResponse(responseCode = "200", description = "Lista de solicitacoes retornada com sucesso")
    @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content)
    public ResponseEntity<List<Solicitacao>> listarPorUsuarioId(@PathVariable Long id) {
        return ResponseEntity.ok(service.findByUsuarioIdParaAdmin(id));
    }

    @GetMapping
    @Operation(summary = "Lista todas as solicitações", description = "Retorna todas as solicitações no sistema.")
    @ApiResponse(responseCode = "200", description = "Lista de solicitações retornada com sucesso")
    @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content)
    public ResponseEntity<List<SolicitacaoDTO>> listarTodos() {
        return ResponseEntity.ok(service.findAll());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deleta uma solicitação pelo ID", description = "Deleta uma solicitação pelo ID fornecido.")
    @ApiResponse(responseCode = "204", description = "Solicitação deletada com sucesso")
    @ApiResponse(responseCode = "403", description = "Usuário não autenticado", content = @Content)
    @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content)
    public ResponseEntity<Void> deletarSolicitacao(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Atualiza uma solicitação pelo ID", description = "Atualiza os dados de uma solicitação pelo ID fornecido.")
    @ApiResponse(responseCode = "200", description = "Solicitação atualizada com sucesso")
    @ApiResponse(responseCode = "403", description = "Usuário não autenticado", content = @Content)
    @ApiResponse(responseCode = "404", description = "Solicitação não encontrada", content = @Content)
    @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content)
    public ResponseEntity<Solicitacao> atualizarSolicitacao(@PathVariable Long id, @RequestBody @Valid SolicitacaoRequestDTO dto) {
        return ResponseEntity.ok(service.uptadeSolicitacao(id, dto));
    }

    @PatchMapping("/aprovar/{id}")
    @Operation(summary = "Aprova uma solicitação pelo ID", description = "Marca a solicitação como aprovada pelo ID fornecido.")
    @ApiResponse(responseCode = "200", description = "Solicitação aprovada com sucesso")
    @ApiResponse(responseCode = "403", description = "Usuário não autenticado", content = @Content)
    @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content)
    public ResponseEntity<Void> aprovarSolicitacao(@PathVariable Long id) {
        service.aprovarSolicitacao(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/reprovar/{id}")
    @Operation(summary = "Reprova uma solicitação pelo ID", description = "Marca a solicitação como reprovada pelo ID fornecido.")
    @ApiResponse(responseCode = "200", description = "Solicitação reprovada com sucesso")
    @ApiResponse(responseCode = "403", description = "Usuário não autenticado", content = @Content)
    @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content)
    public ResponseEntity<Void> reprovarSolicitacao(@PathVariable Long id) {
        service.reprovarSolicitacao(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{solicitacaoId}/selecionar-doacao")
    @Operation(summary = "Seleciona uma doação para a solicitação", description = "Associa uma doação aprovada à solicitação pelo ID fornecido.")
    @ApiResponse(responseCode = "200", description = "Doação selecionada com sucesso")
    @ApiResponse(responseCode = "403", description = "Usuário não autenticado", content = @Content)
    @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content)
    public ResponseEntity<Solicitacao> selecionarDoacaoParaSolicitacao(
            @PathVariable Long solicitacaoId,
            @RequestBody Long doacaoId
        ) {
            return ResponseEntity.ok(service.selecionarDoacaoSolicitacao(solicitacaoId, doacaoId));

    }


}
