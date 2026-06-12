package com.sistemadoacao.backend.config;

import com.sistemadoacao.backend.model.Administrador;
import com.sistemadoacao.backend.model.Curso;
import com.sistemadoacao.backend.model.Perfil;
import com.sistemadoacao.backend.model.Tecnico;
import com.sistemadoacao.backend.model.Usuario;
import com.sistemadoacao.backend.repository.AdministradorRepository;
import com.sistemadoacao.backend.repository.PessoaRepository;
import com.sistemadoacao.backend.repository.TecnicoRepository;
import com.sistemadoacao.backend.repository.UsuarioRepository;
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
    ApplicationRunner criarPerfisIniciais(
            AdministradorRepository administradorRepository,
            TecnicoRepository tecnicoRepository,
            UsuarioRepository usuarioRepository,
            PessoaRepository pessoaRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin-inicial.enabled:true}") boolean perfisIniciaisHabilitados,
            @Value("${app.admin-inicial.nome:Administrador}") String nomeAdmin,
            @Value("${app.admin-inicial.cpf:00000000000}") String cpfAdmin,
            @Value("${app.admin-inicial.email:admin@sistemadoacao.com}") String emailAdmin,
            @Value("${app.admin-inicial.senha:admin123}") String senhaAdmin,
            @Value("${app.tecnico-inicial.nome:Tecnico Teste}") String nomeTecnico,
            @Value("${app.tecnico-inicial.cpf:11111111111}") String cpfTecnico,
            @Value("${app.tecnico-inicial.email:tecnico@sistemadoacao.com}") String emailTecnico,
            @Value("${app.tecnico-inicial.senha:tecnico123}") String senhaTecnico,
            @Value("${app.tecnico-inicial.grr:20240001}") String grrTecnico,
            @Value("${app.usuario-inicial.nome:Usuario Teste}") String nomeUsuario,
            @Value("${app.usuario-inicial.cpf:22222222222}") String cpfUsuario,
            @Value("${app.usuario-inicial.email:usuario@sistemadoacao.com}") String emailUsuario,
            @Value("${app.usuario-inicial.senha:usuario123}") String senhaUsuario) {

        return args -> {
            if (!perfisIniciaisHabilitados) {
                log.info("Criacao dos perfis iniciais desabilitada.");
                return;
            }

            reativarAdministradores(administradorRepository);

            criarAdminInicial(
                    administradorRepository,
                    pessoaRepository,
                    passwordEncoder,
                    nomeAdmin,
                    cpfAdmin,
                    emailAdmin,
                    senhaAdmin);

            criarTecnicoInicial(
                    tecnicoRepository,
                    pessoaRepository,
                    passwordEncoder,
                    nomeTecnico,
                    cpfTecnico,
                    emailTecnico,
                    senhaTecnico,
                    grrTecnico);

            criarUsuarioInicial(
                    usuarioRepository,
                    pessoaRepository,
                    passwordEncoder,
                    nomeUsuario,
                    cpfUsuario,
                    emailUsuario,
                    senhaUsuario);
        };
    }

    private void reativarAdministradores(AdministradorRepository administradorRepository) {
        administradorRepository.findAll().forEach(administrador -> {
            boolean alterado = false;

            if (!administrador.getPerfis().contains(Perfil.ADMINISTRADOR)) {
                administrador.getPerfis().add(Perfil.ADMINISTRADOR);
                alterado = true;
                log.info("Perfil ADMINISTRADOR aplicado ao administrador existente {}.", administrador.getEmail());
            }

            if (!administrador.isAtivo()) {
                administrador.setAtivo(true);
                alterado = true;
                log.info("Administrador existente {} reativado automaticamente.", administrador.getEmail());
            }

            if (alterado) {
                administradorRepository.save(administrador);
            }
        });
    }

    private void criarAdminInicial(
            AdministradorRepository administradorRepository,
            PessoaRepository pessoaRepository,
            PasswordEncoder passwordEncoder,
            String nome,
            String cpf,
            String email,
            String senha) {

        if (administradorRepository.count() > 0) {
            log.info("Administrador inicial nao criado: ja existe administrador cadastrado.");
            return;
        }

        if (pessoaRepository.existsByEmail(email)) {
            log.warn("Administrador inicial nao criado: o e-mail {} ja esta em uso.", email);
            return;
        }

        Administrador administrador = new Administrador();
        administrador.setNome(nome);
        administrador.setCpf(cpf);
        administrador.setEmail(email);
        administrador.setSenha(passwordEncoder.encode(senha));
        administrador.setAtivo(true);
        administrador.setPerfis(Set.of(Perfil.ADMINISTRADOR));

        administradorRepository.save(administrador);
        log.info("Administrador inicial criado com o e-mail {}.", email);
    }

    private void criarTecnicoInicial(
            TecnicoRepository tecnicoRepository,
            PessoaRepository pessoaRepository,
            PasswordEncoder passwordEncoder,
            String nome,
            String cpf,
            String email,
            String senha,
            String grr) {

        if (tecnicoRepository.count() > 0) {
            log.info("Tecnico inicial nao criado: ja existe tecnico cadastrado.");
            return;
        }

        if (pessoaRepository.existsByEmail(email)) {
            log.warn("Tecnico inicial nao criado: o e-mail {} ja esta em uso.", email);
            return;
        }

        Tecnico tecnico = new Tecnico();
        tecnico.setNome(nome);
        tecnico.setCpf(cpf);
        tecnico.setEmail(email);
        tecnico.setSenha(passwordEncoder.encode(senha));
        tecnico.setAtivo(true);
        tecnico.setGrr(grr);
        tecnico.setCurso(Curso.TADS);
        tecnico.setPerfis(Set.of(Perfil.TECNICO));

        tecnicoRepository.save(tecnico);
        log.info("Tecnico inicial criado com o e-mail {}.", email);
    }

    private void criarUsuarioInicial(
            UsuarioRepository usuarioRepository,
            PessoaRepository pessoaRepository,
            PasswordEncoder passwordEncoder,
            String nome,
            String cpf,
            String email,
            String senha) {

        if (usuarioRepository.count() > 0) {
            log.info("Usuario inicial nao criado: ja existe usuario cadastrado.");
            return;
        }

        if (pessoaRepository.existsByEmail(email)) {
            log.warn("Usuario inicial nao criado: o e-mail {} ja esta em uso.", email);
            return;
        }

        Usuario usuario = new Usuario();
        usuario.setNome(nome);
        usuario.setCpf(cpf);
        usuario.setEmail(email);
        usuario.setSenha(passwordEncoder.encode(senha));
        usuario.setAtivo(true);
        usuario.setPerfis(Set.of(Perfil.USUARIO));

        usuarioRepository.save(usuario);
        log.info("Usuario inicial criado com o e-mail {}.", email);
    }
}
