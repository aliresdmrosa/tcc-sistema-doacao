package com.sistemadoacao.backend.service;


import java.security.SecureRandom;
import java.util.List;



import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.sistemadoacao.backend.dto.AdministradorDTO;
import com.sistemadoacao.backend.dto.TecnicoDTO;
import com.sistemadoacao.backend.dto.UsuarioRequestDTO;
import com.sistemadoacao.backend.dto.UsuarioResponseDTO;
import com.sistemadoacao.backend.model.Administrador;
import com.sistemadoacao.backend.model.Pessoa;
import com.sistemadoacao.backend.model.Perfil;
import com.sistemadoacao.backend.model.Tecnico;
import com.sistemadoacao.backend.model.Usuario;
import com.sistemadoacao.backend.repository.AdministradorRepository;
import com.sistemadoacao.backend.repository.PessoaRepository;
import com.sistemadoacao.backend.repository.TecnicoRepository;
import com.sistemadoacao.backend.repository.UsuarioRepository;

import org.springframework.lang.NonNull;
import java.util.Set;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;



@Service
@Slf4j
public class UsuarioService {
    
    private final PessoaRepository pessoaRepository;
    private final UsuarioRepository usuarioRepository;
    private final TecnicoRepository tecnicoRepository;
    private final AdministradorRepository admRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private static SecureRandom random = new SecureRandom();
    private static final String DATA_FOR_RANDOM = "abcdefghijklmnopqrstuvwxyz" + "abcdefghijklmnopqrstuvwxyz".toUpperCase() + "0123456789";
    
   
    public UsuarioService(UsuarioRepository usuarioRepository, EmailService emailService, PasswordEncoder passwordEncoder, TecnicoRepository tecnicoRepository, PessoaRepository pessoaRepository, AdministradorRepository admRepository) {
        this.usuarioRepository = usuarioRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.tecnicoRepository = tecnicoRepository;
        this.pessoaRepository = pessoaRepository;
        this.admRepository = admRepository;
    }

    // A anotação garante: salva tudo (Pessoa + Usuario), ou não salva nada.
    @Transactional
    public UsuarioResponseDTO saveUsuario(UsuarioRequestDTO usuario) {
        Usuario novo = new Usuario();

        if (pessoaRepository.existsByEmail(usuario.email())) {
            throw new RuntimeException("Já existe um usuário cadastrado com este e-mail.");
        }

        try {
            novo.setNome(usuario.nome());
            novo.setCpf(usuario.cpf());
            novo.setEmail(usuario.email());
            String senhaCript = passwordEncoder.encode(usuario.senha());

            novo.setSenha(senhaCript);
            novo.setPerfis(Set.of(Perfil.USUARIO));
            usuarioRepository.save(novo);
          
            emailService.enviarEmailCadastro(novo.getEmail(), novo.getNome(), "");
            
        } catch (Exception e) {
            log.error("Erro ao enviar e-mail de cadastro: {}", e.getMessage());
        }
        log.info("Salvando novo usuário: {}", usuario.email());
        return new UsuarioResponseDTO(novo.getId(), novo.getNome(), novo.getCpf(), novo.getEmail(), novo.getClass().getSimpleName(), novo.getDataCadastro().toString(), novo.isAtivo(), "", "");
    }

    public List<Pessoa> getAllUsuarios() {
        return pessoaRepository.findAll().stream()
        .filter(pessoa -> !(pessoa instanceof Administrador))
        .toList();
    }

    public Usuario getUsuarioById(@NonNull Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com ID: " + id));
        return usuario;
    }

    public Pessoa getPessoaById(@NonNull Long id) {
        return pessoaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Perfil nao encontrado com ID: " + id));
    }

   
    @Transactional
    public Pessoa updateUsuario(@NonNull Long id, Pessoa usuarioAtualizado) {

        Pessoa pessoa = pessoaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com ID: " + id));

        if(pessoa.getClass().getSimpleName().equals("Administrador") || pessoa.getClass().getSimpleName().equals("Usuario")) {
            pessoa.setNome(usuarioAtualizado.getNome());
            pessoa.setCpf(usuarioAtualizado.getCpf());
            pessoa.setEmail(usuarioAtualizado.getEmail());
            return pessoaRepository.save(pessoa);
        } else {
            Tecnico tecnicoExistente = tecnicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Técnico não encontrado com ID: " + id));
            tecnicoExistente.setNome(usuarioAtualizado.getNome());
            tecnicoExistente.setCpf(usuarioAtualizado.getCpf());
            tecnicoExistente.setEmail(usuarioAtualizado.getEmail());
            tecnicoExistente.setCurso(((Tecnico) usuarioAtualizado).getCurso());
            tecnicoExistente.setGrr(((Tecnico) usuarioAtualizado).getGrr());
            return tecnicoRepository.save(tecnicoExistente);
        }
        
    }

    public boolean deleteUsuario(@NonNull Long id) {
        Pessoa pessoa = pessoaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado com ID: " + id));
        
        if (pessoa instanceof Administrador) {
            throw new RuntimeException("Administrador nao pode ser excluido por este fluxo.");
        }

        if(pessoa.getClass().getSimpleName().equals("Tecnico")) {
            tecnicoRepository.deleteById(id);
            log.info("Técnico deletado com sucesso: ID {}", id);
            return true;
        }else {
             usuarioRepository.deleteById(id);
             log.info("Usuário deletado com sucesso: ID {}", id);
            return true;
        }
    }

    @Transactional
    public Pessoa desativarPerfil(@NonNull Long id) {
        Pessoa pessoa = getPessoaById(id);
        if (pessoa instanceof Administrador) {
            throw new RuntimeException("Administrador nao pode ser desativado por este fluxo.");
        }
        pessoa.setAtivo(false);
        return pessoaRepository.save(pessoa);
    }

    @Transactional
    public Pessoa reativarPerfil(@NonNull Long id) {
        Pessoa pessoa = getPessoaById(id);
        pessoa.setAtivo(true);
        return pessoaRepository.save(pessoa);
    }

    @Transactional
    public void alterarSenha(@NonNull Long id, String senhaAtual, String novaSenha) {
        
        Usuario usuario = getUsuarioById(id);
        // Verifica se a senha atual está correta
        if (!passwordEncoder.matches(senhaAtual, usuario.getSenha())) {
            throw new RuntimeException("A senha atual informada está incorreta.");
        }

        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);
        
        log.info("Senha alterada com sucesso para o usuário ID: {}", id);
    }

    public Tecnico saveTecnico(TecnicoDTO tecnico) {
        Tecnico novo = new Tecnico();

        if (pessoaRepository.existsByEmail(tecnico.usuario().email())) {
            throw new RuntimeException("Já existe um usuário cadastrado com este e-mail.");
        }

        try {
            novo.setNome(tecnico.usuario().nome());
            novo.setCpf(tecnico.usuario().cpf());
            novo.setEmail(tecnico.usuario().email());
            novo.setCurso(tecnico.curso());
            novo.setGrr(tecnico.GRR());
            var novaSenha = tecnico.usuario().senha();
            String senhaCript = passwordEncoder.encode(novaSenha);

            novo.setSenha(senhaCript);
            novo.setPerfis(Set.of(Perfil.TECNICO));
            tecnicoRepository.save(novo);
          
            emailService.enviarEmailCadastro(novo.getEmail(), novo.getNome(), novaSenha);
            
        } catch (Exception e) {
            log.error("Erro ao enviar e-mail de cadastro: {}", e.getMessage());
        }
        log.info("Salvando novo usuário: {}", tecnico.usuario().email());
        
        return novo;
    }

    public List<Tecnico> listarTecnicos(){
        return tecnicoRepository.findAll().stream()
        .toList();
    }

    public String gerarSenha(int tamanho) {
        StringBuilder sb = new StringBuilder(tamanho);
        for (int i = 0; i < tamanho; i++) {
            int rndCharAt = random.nextInt(DATA_FOR_RANDOM.length());
            char rndChar = DATA_FOR_RANDOM.charAt(rndCharAt);
            sb.append(rndChar);
        }
        return sb.toString();
    }

    public Administrador saveAdmin(AdministradorDTO adm) {
        Administrador novo = new Administrador();

        if (pessoaRepository.existsByEmail(adm.usuario().email())) {
            throw new RuntimeException("Já existe um usuário cadastrado com este e-mail.");
        }

        try {
            novo.setNome(adm.usuario().nome());
            novo.setCpf(adm.usuario().cpf());
            novo.setEmail(adm.usuario().email());
            String senhaCript = passwordEncoder.encode(adm.usuario().senha());
            novo.setSenha(senhaCript);
            novo.setPerfis(Set.of(Perfil.ADMINISTRADOR));

            admRepository.save(novo);
          
            emailService.enviarEmailCadastro(novo.getEmail(), novo.getNome(),"");
            
        } catch (Exception e) {
            log.error("Erro ao enviar e-mail de cadastro: {}", e.getMessage());
        }
        log.info("Salvando novo usuário: {}", novo.getEmail());
        return novo;
        
    }

    public boolean getUsuarioByEmail (String email) {
        return pessoaRepository.existsByEmail(email);
    }
}
