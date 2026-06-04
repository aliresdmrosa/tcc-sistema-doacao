package com.sistemadoacao.backend.dto;

import java.time.LocalDate;

import com.sistemadoacao.backend.model.Pessoa;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

// Unico dto para representar os tipos de usuarios pois eles compartilham os mesmos atributos por enquanto.
public record UsuarioRequestDTO(
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    Long id,

    @Schema(description = "Nome completo do usuario", example = "Joao Silva")
    @NotBlank
    String nome,

    @Schema(description = "Numero do CPF", example = "12345678900")
    @Pattern(regexp = "\\d{11}", message = "CPF deve conter 11 numeros")
    String cpf,

    @Schema(description = "Endereco de email do usuario", example = "joao@gmail.com")
    @NotBlank
    String email,

    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    String perfil,

    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    LocalDate dataCadastro,

    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    Boolean ativo,

    @NotBlank
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$",
        message = "Senha deve ter no minimo 8 caracteres, maiuscula, minuscula, numero e simbolo"
    )
    String senha
) {
    public UsuarioRequestDTO(Pessoa pessoa) {
        this(
            pessoa.getId(),
            pessoa.getNome(),
            pessoa.getCpf(),
            pessoa.getEmail(),
            pessoa.getClass().getSimpleName(),
            pessoa.getDataCadastro(),
            pessoa.isAtivo(),
            pessoa.getSenha()
        );
    }
}
