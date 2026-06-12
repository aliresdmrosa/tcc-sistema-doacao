package com.sistemadoacao.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.sistemadoacao.backend.config.Utils;
import com.sistemadoacao.backend.dto.ReparoResponseDTO;

import com.sistemadoacao.backend.service.ReparoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;

import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/reparo")
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Reparo", description = "Endpoints para gerenciamento de reparos")
public class ReparoController {

    private final ReparoService reparoService;
    private final Utils utils;

    public ReparoController(ReparoService reparoService, Utils utils) {
        this.reparoService = reparoService;
        this.utils = utils;
    }

    @GetMapping()
    @Operation(summary = "Lista todos os reparos", description = "Retorna uma lista de todos os reparos cadastrado no sistema.")
    @ApiResponse(responseCode = "200", description = "Reparos encontrados com sucesso")
    @ApiResponse(responseCode = "403", description = "Acesso negado, nao possui permissao", content = @Content)
    @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content)
    public ResponseEntity<List<ReparoResponseDTO>> listarTodosReparos() {
        try {
            return ResponseEntity.ok(reparoService.listarReparos());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/tecnico")
    @PreAuthorize("hasAnyRole('TECNICO', 'ADMINISTRADOR')")
    @Operation(summary = "Lista todos os reparos de um tecnico", description = "Retorna uma lista de todos os reparos cadastrado no sistema.")
    @ApiResponse(responseCode = "200", description = "Reparos encontrados com sucesso")
    @ApiResponse(responseCode = "403", description = "Acesso negado, nao possui permissao", content = @Content)
    @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content)
    public ResponseEntity<List<ReparoResponseDTO>> listarTodosReparosTecnico() {
        try {
            return ResponseEntity.ok(reparoService.listarReparosTecnico(utils.getIdUsuarioLogado()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/tecnico/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','TECNICO')")
    @Operation(summary = "Lista todos os reparos de um tecnico por id", description = "Retorna uma lista de todos os reparos de um tecnico especifico.")
    @ApiResponse(responseCode = "200", description = "Reparos encontrados com sucesso")
    @ApiResponse(responseCode = "403", description = "Acesso negado, nao possui permissao", content = @Content)
    @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content)
    public ResponseEntity<List<ReparoResponseDTO>> listarTodosReparosTecnicoPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(reparoService.listarReparosTecnico(id));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/item/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'TECNICO')")
    @Operation(summary = "Busca um reparo por id", description = "Retorna os dados de um reparo especifico.")
    public ResponseEntity<ReparoResponseDTO> buscarReparoPorId(@PathVariable Long id) {
        return ResponseEntity.ok(reparoService.buscarReparoPorId(id));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'TECNICO')")
    @Operation(summary = "Lista todos os reparos de uma doacao", description = "Retorna uma lista de todos os reparos de uma doacao.")
    @ApiResponse(responseCode = "200", description = "Reparos encontrados com sucesso")
    @ApiResponse(responseCode = "403", description = "Acesso negado, nao possui permissao", content = @Content)
    @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content)
    public ResponseEntity<List<ReparoResponseDTO>> listaTodosReparosDoacao(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(reparoService.listarReparosDoacao(id));
        } catch (Exception e) {
            log.error("Erro ao buscar reparos de doacao: {}", e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping()
    @PreAuthorize("hasRole('TECNICO')")
    @Operation(summary = "Cadastra novo reparo", description = "Retorna um novo reparo cadastrado no sistema.")
    @ApiResponse(responseCode = "201", description = "Reparos cadastrado com sucesso")
    @ApiResponse(responseCode = "404", description = "Doacao nao encontrada.")
    @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content)
    public ResponseEntity<ReparoResponseDTO> novoReparo(@RequestParam Long id_doacao, @RequestParam String descricao) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(reparoService.save(descricao, utils.getIdUsuarioLogado(), id_doacao));
        } catch (ResponseStatusException e1) {
            log.error(e1.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            log.error("Erro ao salvar reparo: {}", e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @PatchMapping("{id}/descricao")
    @PreAuthorize("hasRole('TECNICO')")
    @Operation(summary = "Atualizar descricao do reparo", description = "Atualiza apenas a descricao de um reparo.")
    @ApiResponse(responseCode = "200", description = "Descricao do reparo atualizada com sucesso")
    @ApiResponse(responseCode = "404", description = "Reparo nao encontrado", content = @Content)
    @ApiResponse(responseCode = "500", description = "Erro no servidor", content = @Content)
    public ResponseEntity<ReparoResponseDTO> atualizarDescricaoReparo(@RequestBody String descricao,
            @PathVariable Long id) {
        try {
            return ResponseEntity.ok(reparoService.atualizarDescricaoReparo(id, descricao));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e2) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Concluir reparo", description = "Altera o status da doação para Aprovado e adiciona data de fim de reparo.")
    @ApiResponse(responseCode = "404", description = "Reparo não encontrada", content = @Content)
    @PatchMapping("concluir/{id}")
    @PreAuthorize("hasRole('TECNICO')")
    public ResponseEntity<Void> concluirReparo(@RequestBody String motivo, @PathVariable Long id) {
        try {
            reparoService.concluirReparo(id, motivo);
            return ResponseEntity.status(HttpStatus.OK).build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e2) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Reparo sem conserto", description = "Altera o status da doação para Descarte e adiciona data de fim de reparo.")
    @ApiResponse(responseCode = "200", description = "Doacao para descarte com sucesso")
    @ApiResponse(responseCode = "404", description = "Reparo não encontrada", content = @Content)
    @ApiResponse(responseCode = "500", description = "Erro no servidor", content = @Content)
    @PatchMapping("descarte/{id}")
    @PreAuthorize("hasRole('TECNICO')")
    public ResponseEntity<Void> concluirReparoDescarte(@RequestBody String motivo, @PathVariable Long id) {
        try {
            reparoService.concluirReparoDescarte(id, motivo);
            return ResponseEntity.status(HttpStatus.OK).build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e2) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PatchMapping("concluir-item/{id}")
    @PreAuthorize("hasRole('TECNICO')")
    @Operation(summary = "Concluir item de reparo", description = "Altera o status do item de reparo para Concluido e adiciona data de fim do item.")
    @ApiResponse(responseCode = "200", description = "Item de reparo concluido com sucesso")
    @ApiResponse(responseCode = "404", description = "Item de reparo não encontrado", content = @Content)
    @ApiResponse(responseCode = "500", description = "Erro no servidor", content = @Content)
    public ResponseEntity<Void> concluirReparoItem(@PathVariable Long id) {
        try {
            reparoService.concluirReparoItem(id);
            return ResponseEntity.status(HttpStatus.OK).build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e2) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}
