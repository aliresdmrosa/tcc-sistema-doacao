package com.sistemadoacao.backend.dto;

public record PessoaResponseDTO(long id, String nome, String cpf, String email, String perfil, String dataCadastro, boolean ativo, String grr, String curso) {

}
