package com.sistemadoacao.backend.model;

import java.time.LocalDate;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import lombok.Data;

@Data
@Entity
@EntityListeners(AuditingEntityListener.class)
@Inheritance(strategy = InheritanceType.JOINED)
public class Pessoa implements UserDetails {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;
    @Schema(description = "Nome completo do usuário", example = "João Silva")
    private String nome;
    @Schema(description = "Número do CPF", example = "12345678900")
    private String cpf;
    @Schema(description = "Endereço de email do usuário", example = "joao@gmail.com")
    private String email;
    @Schema(description = "Senha do usuário", example = "senhaSegura123")
    private String senha;
    @Schema(description = "Indica se o perfil pode acessar o sistema", example = "true")
    @Column(nullable = false)
    private boolean ativo = true;
    @Schema(description = "Papel do usuário no sistema", example = "TECNICO")

    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "pessoa_perfil")
    @ElementCollection(fetch = FetchType.EAGER)
    private Set<Perfil> perfis = new HashSet<>(); // uso set para evitar perfis duplicados

    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDate dataCadastro;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if(perfis == null) {
            return List.of(new SimpleGrantedAuthority("ROLE_" + this.getClass().getSimpleName().toUpperCase()));
        }

        return perfis.stream()
                .map(perfil -> new SimpleGrantedAuthority("ROLE_" + perfil.name()))
                .toList();
    }

    @Override
    public String getPassword() {
        return this.senha;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    public Long getId() {
        return this.id;
    }

    @Override
    public boolean isEnabled() {
        return this.ativo;
    }

}
