package com.sistemadoacao.backend.config;

import com.sistemadoacao.backend.model.Administrador;
import com.sistemadoacao.backend.model.Perfil;
import com.sistemadoacao.backend.repository.AdministradorRepository;
import com.sistemadoacao.backend.repository.PessoaRepository;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Slf4j
public class AdminBootstrapConfig {

    @Bean
    ApplicationRunner criarAdminInicial(
            AdministradorRepository administradorRepository,
            PessoaRepository pessoaRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin-inicial.enabled:true}") boolean adminInicialHabilitado,
            @Value("${app.admin-inicial.nome:Administrador}") String nome,
            @Value("${app.admin-inicial.cpf:00000000000}") String cpf,
            @Value("${app.admin-inicial.email:admin@sistemadoacao.com}") String email,
            @Value("${app.admin-inicial.senha:admin123}") String senha) {

        return args -> {
            if (!adminInicialHabilitado) {
                log.info("Criação do administrador inicial desabilitada.");
                return;
            }

            administradorRepository.findAll().stream()
                    .filter(administrador -> !administrador.getPerfis().contains(Perfil.ADMINISTRADOR))
                    .forEach(administrador -> {
                        administrador.getPerfis().add(Perfil.ADMINISTRADOR);
                        administradorRepository.save(administrador);
                        log.info("Perfil ADMINISTRADOR aplicado ao administrador existente {}.", administrador.getEmail());
                    });

            if (administradorRepository.count() > 0) {
                log.info("Administrador inicial não criado: já existe administrador cadastrado.");
                return;
            }

            if (pessoaRepository.existsByEmail(email)) {
                log.warn("Administrador inicial não criado: o e-mail {} já está em uso.", email);
                return;
            }

            Administrador administrador = new Administrador();
            administrador.setNome(nome);
            administrador.setCpf(cpf);
            administrador.setEmail(email);
            administrador.setSenha(passwordEncoder.encode(senha));
            administrador.setPerfis(Set.of(Perfil.ADMINISTRADOR));

            administradorRepository.save(administrador);
            log.info("Administrador inicial criado com o e-mail {}.", email);
        };
    }
}
