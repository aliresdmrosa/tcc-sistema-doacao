package com.sistemadoacao.backend.controller;


import java.util.List;



import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.MediaType;

import com.sistemadoacao.backend.model.Doacao;
import com.sistemadoacao.backend.model.Equipamento;
import com.sistemadoacao.backend.model.Pessoa;
import com.sistemadoacao.backend.model.Status;
import com.sistemadoacao.backend.service.DoacaoService;
import com.sistemadoacao.backend.dto.AlterStatusDTO;
import com.sistemadoacao.backend.dto.DashboardDTO;
import com.sistemadoacao.backend.dto.DoacaoRequestDTO;
import com.sistemadoacao.backend.dto.DoacaoResponseDTO;
import com.sistemadoacao.backend.dto.DoacaoResponseUserDTO;
import com.sistemadoacao.backend.dto.DoacaoReverDTO;
import com.sistemadoacao.backend.dto.DoacaoTDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;



@Slf4j
@RestController
@RequestMapping("/doacao")
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Doação", description = "Endpoints para gerenciamento de doacoes")
public class DoacaoController {

    private final DoacaoService doacaoService;
    


    public DoacaoController(DoacaoService doacaoService) {
        this.doacaoService = doacaoService;
        

    }

    // TODO: Implementar função para imprimir etiqueta de doação

    @GetMapping()
    @Operation(summary = "Listar todas as doações", description = "Retorna uma lista de todas as doações cadastradas no sistema.")
    @ApiResponse(responseCode = "200", description = "Doacoes encontrados com sucesso")
    @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content)
    public ResponseEntity<List<DoacaoResponseUserDTO>> listarDoacoes() {
        return ResponseEntity.ok(doacaoService.listarDoacoesUser());
    }

    @GetMapping("usuario")
    @Operation(summary = "Listar todas as doacoes do usuario")
    public ResponseEntity<List<DoacaoResponseDTO>> listarDoacoesPorUsuario(@AuthenticationPrincipal Pessoa user){
        return ResponseEntity.ok(doacaoService.listarDoacoesPorUsuario(user.getId()));
                
    }

    @GetMapping("usuario/{id}")
    @Operation(summary = "Listar todas as doacoes de um usuario pelo ID")
    public ResponseEntity<List<DoacaoResponseDTO>> listarDoacoesPorUsuarioId(@PathVariable Long id) {
        return ResponseEntity.ok(doacaoService.listarDoacoesPorUsuario(id));
    }
    

    @GetMapping("tipo/{equipamento}")
    @Operation(summary = "Listar todas as doações que são do mesmo tipo de equipamento", description = "Retorna uma lista de todas as doações cadastradas no sistema com o tipo do equipamento.")
    @ApiResponse(responseCode = "200", description = "Doacoes encontrados com sucesso")
    @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content)
    public ResponseEntity<List<Doacao>> listarDoacoesPorEquipamento(@PathVariable Equipamento equipamento) {
        return ResponseEntity.ok(doacaoService.listarDoacoesPorEquipamento(equipamento));
    }

    @GetMapping("status/{status}")
    @Operation(summary = "Listar doacoes por status", description = "Retorna uma lista de doacoes filtradas pelo status informado.")
    @ApiResponse(responseCode = "200", description = "Doacoes retornadas com sucesso")
    @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content)
    public ResponseEntity<List<DoacaoResponseDTO>> listarDoacoesPorStatus(@PathVariable Status status) {
        return ResponseEntity.ok(
                doacaoService.listarDoacoesPorStatus(status).stream()
                        .map(DoacaoResponseDTO::new)
                        .toList());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lista doacao por ID", description = "Retorna doacao com ID buscado.")
    @ApiResponse(responseCode = "200", description = "Doação encontrada com sucesso")
    @ApiResponse(responseCode = "404", description = "Doação nao encontrada.")
    @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content)
    public ResponseEntity<DoacaoTDTO> listarDoacaoPorId(@PathVariable(value = "") Long id) {
        return ResponseEntity.ok(doacaoService.listarDoacaoPorId(id));
    }

    // cadastrar nova doação
    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Criar uma nova doação", description = "Cria uma nova doação com os dados fornecidos com upload da imagem associada.")
    @ApiResponse(responseCode = "201", description = "Doação criada com sucesso")
    @ApiResponse(responseCode = "400", description = "Requisição inválida", content = @Content)
    @ApiResponse(responseCode = "404", description = "Arquivo não encontrado")
    @ApiResponse(responseCode = "415", description = "Formato de arquivo inválido")
    @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content)
    public ResponseEntity<DoacaoResponseDTO> cadastrarDoacao(@ModelAttribute DoacaoRequestDTO doacaoRequest, @AuthenticationPrincipal Pessoa user){
        DoacaoResponseDTO doacaoResponse = doacaoService.cadastrarDoacao(doacaoRequest, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(doacaoResponse);
    }

    @DeleteMapping("/{id}")
    //TODO : ENVIAR EMAIL PARA USUÁRIO INFORMANDO QUE SUA DOAÇÃO FOI DELETADA, COM O MOTIVO DA DELEÇÃO
    @Operation(summary = "Deletar doacao pelo ID")
    @ApiResponse(responseCode = "204", description = "Doação deletado com sucesso")
    @ApiResponse(responseCode = "400", description = "Requisição inválida")
    @ApiResponse(responseCode = "404", description = "Doação não encontrado")
    @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    public ResponseEntity<Void> deletarDoacao(@PathVariable Long id) {
        doacaoService.deleteDoacao(id);
        return ResponseEntity.noContent().build();
    }

    // TODO : ENVIAR EMAIL PARA USUÁRIO INFORMANDO QUE SUA DOAÇÃO FOI ATUALIZADA, COM O MOTIVO DA ATUALIZAÇÃO
    @PatchMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Atualização parcial", description = "Altera apenas os campos enviados no formulário.")
    @ApiResponse(responseCode = "201", description = "Doação criada com sucesso")
    @ApiResponse(responseCode = "404", description = "Arquivo não encontrado", content = @Content)
    @ApiResponse(responseCode = "415", description = "Formato de arquivo inválido", content = @Content)
    public ResponseEntity<DoacaoResponseDTO> atualizarDoacao(
            @PathVariable Long id,
            @ModelAttribute DoacaoRequestDTO doacaoRequest) {

            Doacao doacaoAtualizada = doacaoService.updateDoacao(id, doacaoRequest);
        
            return ResponseEntity.ok(new DoacaoResponseDTO(doacaoAtualizada));

        
    }

    @Operation(summary = "Obtem dados para preencher Dashboard", description = "Retorna um json com todos os dados para adiciionar nos cards e graficos.")
    @ApiResponse(responseCode = "200", description = "Dados do dashboard obtidos com sucesso")
    @ApiResponse(responseCode = "500", description = "Erro no servidor", content = @Content)
    @ApiResponse(responseCode = "403", description = "Acesso negado", content = @Content)
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDTO> getDashboard() {
        DashboardDTO dashboard = doacaoService.gerarRelatorioGeral();
        return ResponseEntity.ok(dashboard);
    }

    @Operation(summary = "Aprovar doação", description = "Altera o status da doação para APROVADO.")
    @ApiResponse(responseCode = "200", description = "Doação aprovada com sucesso")
    @ApiResponse(responseCode = "404", description = "Doação não encontrada", content = @Content)
    @ApiResponse(responseCode = "500", description = "Erro no servidor", content = @Content)
    @PatchMapping("aprovar/{id}")
    public ResponseEntity<Void> aprovarDoacao(@RequestBody AlterStatusDTO body, @PathVariable Long id) {
        doacaoService.aprovarDoacao(id, body.motivo());
        return ResponseEntity.ok().build();
    }

    
    @Operation(summary = "Reprovar doação", description = "Altera o status da doação para REPROVADO.")
    @ApiResponse(responseCode = "200", description = "Doação reprovada com sucesso")
    @ApiResponse(responseCode = "404", description = "Doação não encontrada", content = @Content)
    @ApiResponse(responseCode = "500", description = "Erro no servidor", content = @Content)
    @PatchMapping("reprovar/{id}")
    public ResponseEntity<Doacao> reprovarDoacao(@RequestBody AlterStatusDTO body, @PathVariable Long id) {
        return ResponseEntity.ok(doacaoService.reprovarDoacao(id, body.motivo()));
    }

    @Operation(summary = "Enviar doacao para reparo", description = "Altera apenas o status da doacao para REPARO.")
    @ApiResponse(responseCode = "200", description = "Doacao enviada para reparo com sucesso")
    @ApiResponse(responseCode = "404", description = "Doacao nao encontrada", content = @Content)
    @ApiResponse(responseCode = "500", description = "Erro no servidor", content = @Content)
    @PatchMapping("reparo/{id}")
    public ResponseEntity<Doacao> enviarDoacaoParaReparo(@RequestBody AlterStatusDTO body, @PathVariable Long id) {
        return ResponseEntity.ok(doacaoService.enviarDoacaoParaReparo(id, body.motivo()));
    }

    @Operation(summary = "Enviar doacao para estoque", description = "Altera apenas o status da doacao para ESTOQUE.")
    @ApiResponse(responseCode = "200", description = "Doacao enviada para estoque com sucesso")
    @ApiResponse(responseCode = "404", description = "Doacao nao encontrada", content = @Content)
    @ApiResponse(responseCode = "500", description = "Erro no servidor", content = @Content)
    @PatchMapping("estoque/{id}")
    public ResponseEntity<Doacao> enviarDoacaoParaEstoque(@RequestBody AlterStatusDTO body, @PathVariable Long id) {
        return ResponseEntity.ok(doacaoService.enviarDoacaoParaEstoque(id, body.motivo()));
    }

    @Operation(summary = "Reabrir análise", description = "Altera apenas o status da doacao para PENDENTE.")
    @ApiResponse(responseCode = "200", description = "Doacao enviada para analise com sucesso")
    @ApiResponse(responseCode = "404", description = "Doacao nao encontrada", content = @Content)
    @ApiResponse(responseCode = "500", description = "Erro no servidor", content = @Content)
    @PatchMapping("pendente/{id}")
    public ResponseEntity<Doacao> enviarDoacaoParaPendente(@RequestBody AlterStatusDTO body, @PathVariable Long id) {
        return ResponseEntity.ok(doacaoService.enviarDoacaoParaPendente(id, body.motivo()));
    }

    @Operation(summary = "Enviar doacao para aprovado reparo", description = "Altera apenas o status da doacao para APROVADO_REPARO.")
    @ApiResponse(responseCode = "200", description = "Doacao enviada para aprovado reparo com sucesso")
    @ApiResponse(responseCode = "404", description = "Doacao nao encontrada", content = @Content)
    @ApiResponse(responseCode = "500", description = "Erro no servidor", content = @Content)
    @PatchMapping("aprovado-reparo/{id}")
    public ResponseEntity<Doacao> enviarDoacaoParaAprovadoReparo(@RequestBody AlterStatusDTO body, @PathVariable Long id) {
        return ResponseEntity.ok(doacaoService.enviarDoacaoParaAprovadoReparo(id, body.motivo()));
    }

    @Operation(summary = "Marcar doacao como doada", description = "Altera apenas o status da doacao para DOADO.")
    @ApiResponse(responseCode = "200", description = "Doacao marcada como doada com sucesso")
    @ApiResponse(responseCode = "404", description = "Doacao nao encontrada", content = @Content)
    @ApiResponse(responseCode = "500", description = "Erro no servidor", content = @Content)
    @PatchMapping("doado/{id}")
    public ResponseEntity<Doacao> enviarDoacaoParaDoado(@RequestBody AlterStatusDTO body, @PathVariable Long id) {
        return ResponseEntity.ok(doacaoService.enviarDoacaoParaDoado(id, body.motivo()));
    }

    @GetMapping("/aprovada")
    @Operation(summary = "Lista doações aprovadas", description = "Retorna todas as doações com status APROVADO ou APROVADO_IA. Usar esse endpoint para selecionar doações para solicitações.")
    @ApiResponse(responseCode = "200", description = "Doações aprovadas retornadas com sucesso")
    @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content)
    public ResponseEntity<List<Doacao>> listarDoacoesAprovadas() {
        return ResponseEntity.ok(doacaoService.listarDoacoes());
    }

    // @Operation(summary = "Rever doação", description = "Altera o status da doação para REVER quando o doador não concorda com avaliação da AI.")
    // @ApiResponse(responseCode = "200", description = "Doação rever com sucesso")
    // @ApiResponse(responseCode = "404", description = "Doação não encontrada", content = @Content)
    // @ApiResponse(responseCode = "500", description = "Erro no servidor", content = @Content)
    // @PatchMapping("rever/{id}")
    // public ResponseEntity<Doacao> reverDoacao(@PathVariable Long id) {
    //     return ResponseEntity.ok(doacaoService.reverDoacao(id));
    // }

    @GetMapping("/tecnico")
    @Operation(summary = "Lista doações que estao com status PENDENTE ou REPARO", description = "Retorna todas as doações com status PENDENTE ou REPARO. Usar esse endpoint para selecionar doações para avaliação técnica.")
    @ApiResponse(responseCode = "200", description = "Doações status rever retornadas com sucesso")
    @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content)
    public ResponseEntity<List<DoacaoReverDTO>> listarDoacoesTecnico() {
        return ResponseEntity.ok(doacaoService.listarDoacoesTecnico());
    }

    // @GetMapping("/tecnico/{id}")
    // @Operation(summary = "Lista doação por ID com status REVER ou REPARO", description = "Retorna a doação com status REVER ou REPARO pelo ID. Usar esse endpoint para selecionar doações para avaliação técnica.")
    // @ApiResponse(responseCode = "200", description = "Doação status rever retornada com sucesso")
    // @ApiResponse(responseCode = "500", description = "Erro interno do servidor", content = @Content)
    // public ResponseEntity<DoacaoReverDTO> listarDoacaoReverReparoPorId(@PathVariable Long id) {
    //     return ResponseEntity.ok(doacaoService.listarDoacaoReverReparoPorId(id));
    // }

}
