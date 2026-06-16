package com.sistemadoacao.backend.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sistemadoacao.backend.dto.RedefinirSenhaDTO;
import com.sistemadoacao.backend.exception.NotFoundException;
import com.sistemadoacao.backend.repository.PessoaRepository;

import jakarta.transaction.Transactional;

@Service
public class LoginService implements UserDetailsService {

    private final PessoaRepository repository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public LoginService(PessoaRepository repository, EmailService emailService, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return repository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário ou senha incorreto."));
    }

    @Transactional
    public void solicitarRecuperacaoSenha(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("E-mail é obrigatório.");
        }

        var pessoa = repository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado com e-mail: " + email));

        String token = UUID.randomUUID().toString();
        pessoa.setTokenRecuperacao(token);
        pessoa.setTokenExpiracao(LocalDateTime.now().plusMinutes(30));
        repository.save(pessoa);

        String link = "http://localhost:4200/redefinir-senha?token=" + token;
        emailService.enviarEmailRecuperacaoSenha(pessoa.getEmail(), pessoa.getNome(), link);
    }

    @Transactional
    public void redefinirSenha(RedefinirSenhaDTO dto) {
        if (dto == null || dto.token() == null || dto.token().isBlank()) {
            throw new IllegalArgumentException("Token é obrigatório.");
        }

        var pessoa = repository.findByTokenRecuperacao(dto.token())
                .orElseThrow(() -> new NotFoundException("Token de recuperação inválido."));

        if (pessoa.getTokenExpiracao() == null || pessoa.getTokenExpiracao().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token de recuperação expirado.");
        }

        if (dto.novaSenha() == null || dto.novaSenha().isBlank()) {
            throw new IllegalArgumentException("Nova senha é obrigatória.");
        }

        if (!dto.novaSenha().equals(dto.confirmarSenha())) {
            throw new IllegalArgumentException("Nova senha e confirmação de senha não conferem.");
        }

        pessoa.setSenha(passwordEncoder.encode(dto.novaSenha()));
        pessoa.setTokenRecuperacao(null);
        pessoa.setTokenExpiracao(null);
        repository.save(pessoa);
    }
}
