package com.sistemadoacao.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sistemadoacao.backend.model.Pessoa;

@Repository
public interface PessoaRepository  extends JpaRepository<Pessoa, Long> {

    boolean existsByEmail(String email);

    Optional<Pessoa> findByEmail(String email);

    Optional<Pessoa> findByTokenRecuperacao(String token);

    Optional<Pessoa> findByCpf(String cpf);



}
