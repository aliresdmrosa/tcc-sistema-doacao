package com.sistemadoacao.backend.model;

import java.time.LocalDate;
import java.time.LocalDateTime;


import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;



@Entity
@EntityListeners(AuditingEntityListener.class)
public class Reparo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;
    @Schema(example = "Tela trocada", description = "Descreve o problema")
    private String descricao;
    @Schema(example = "Tela trocada", description = "Descreve o problema")
    private String conclusao;
    private Long idTecnico;
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDate dataInicio;
    private LocalDateTime dataFim;
    @JsonIgnoreProperties("reparos")
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "doacao_id") // Nome da coluna no banco de dados
    private Doacao doacao; 


    public Reparo() {
    }

    public Reparo(Long id, String descricao, Long idTecnico, LocalDate dataInicio, LocalDateTime dataFim, Doacao doacao) {
        this.id = id;
        this.descricao = descricao;
        this.idTecnico = idTecnico;
        this.dataInicio = dataInicio;
        this.dataFim = dataFim;
        this.doacao = doacao;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Long getIdTecnico() {
        return idTecnico;
    }

    public void setIdTecnico(Long idTecnico) {
        this.idTecnico = idTecnico;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDate dataInicio) {
        this.dataInicio = dataInicio;
    }


    public Doacao getDoacao() {
        return doacao;
    }

    public void setDoacao(Doacao doacao) {
        this.doacao = doacao;
    }

    public LocalDateTime getDataFim() {
        return dataFim;
    }

    public void setDataFim(LocalDateTime dataFim) {
        this.dataFim = dataFim;
    }

    public String getConclusao() {
        return conclusao;
    }

    public void setConclusao(String conclusao) {
        this.conclusao = conclusao;
    }

    

}
