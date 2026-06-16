package com.sistemadoacao.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sistemadoacao.backend.dto.LoginDTO;
import com.sistemadoacao.backend.dto.LoginRequestDTO;
import com.sistemadoacao.backend.dto.RecuperarSenhaDTO;
import com.sistemadoacao.backend.dto.RedefinirSenhaDTO;
import com.sistemadoacao.backend.exception.NotFoundException;
import com.sistemadoacao.backend.repository.PessoaRepository;
import com.sistemadoacao.backend.service.LoginService;
import com.sistemadoacao.backend.service.TokenService;

import java.util.Map;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/login")
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Login", description = "Endpoint publico para autenticação de usuários")
public class LoginController {
    
    @Autowired
    private AuthenticationManager manager;

    @Autowired
    private PessoaRepository repository;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private LoginService loginService;

    @PostMapping
    public ResponseEntity<LoginDTO> efetuarLogin(@RequestBody @Valid LoginRequestDTO dados) {
        try {
            // Se o RequestBody estiver errado, 'dados' será null aqui
            var authenticationToken = new UsernamePasswordAuthenticationToken(dados.email(), dados.senha());
            manager.authenticate(authenticationToken);
    
            var pessoa = repository.findByEmail(dados.email())
                        .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
            if (!pessoa.isAtivo()) {
                log.warn("Tentativa de login em perfil desativado: {}", pessoa.getEmail());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            log.info("Usuário autenticado: {}", pessoa.getEmail());
            log.debug("Gerando token para o usuário: {}", pessoa.getEmail());
            var token = tokenService.gerarToken(pessoa);

            log.debug("token gerado: {}", token);
            
            String tipo = pessoa.getClass().getSimpleName().toUpperCase();
            
            return ResponseEntity.ok(new LoginDTO(token, pessoa.getId(), pessoa.getEmail(), tipo));
        } catch (DisabledException e) {
            log.warn("Login bloqueado para perfil desativado: {}", dados.email());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }catch(UsernameNotFoundException e2){
            log.error("Usuário não encontrado: {}", e2.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        
        } catch (Exception e) {
            log.error("Erro ao autenticar: {}", e.getMessage());
            return ResponseEntity.status(401).build();
        }
    }

    @PostMapping("/recuperar-senha")
    public ResponseEntity<Map<String, String>> recuperarSenha(@RequestBody RecuperarSenhaDTO dados) {
        try {
            loginService.solicitarRecuperacaoSenha(dados.email());
            return ResponseEntity.ok(Map.of("mensagem", "E-mail de recuperação enviado."));
        } catch (NotFoundException e) {
            log.warn("Solicitação de recuperação para e-mail não encontrado: {}", dados.email());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("mensagem", e.getMessage()));
        } catch (IllegalArgumentException e) {
            log.warn("Dados inválidos para recuperação de senha: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("mensagem", e.getMessage()));
        }
    }

    @PostMapping("/redefinir-senha")
    public ResponseEntity<Map<String, String>> redefinirSenha(@RequestBody RedefinirSenhaDTO dados) {
        try {
            loginService.redefinirSenha(dados);
            return ResponseEntity.ok(Map.of("mensagem", "Senha redefinida com sucesso."));
        } catch (NotFoundException e) {
            log.warn("Tentativa de redefinição com token inválido.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("mensagem", e.getMessage()));
        } catch (IllegalArgumentException e) {
            log.warn("Dados inválidos para redefinição de senha: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("mensagem", e.getMessage()));
        }
    }
}
