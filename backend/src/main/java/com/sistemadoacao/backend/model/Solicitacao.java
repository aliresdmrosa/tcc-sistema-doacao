package com.sistemadoacao.backend.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
// anotacao para habilitar o auditing (data de criacao automatico)
@EntityListeners(AuditingEntityListener.class) 
public class Solicitacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    private Long usuarioId;

    @Enumerated(EnumType.STRING)
    @Schema(example = "NOTEBOOK", description = "Equipamento solicitado")
    private Equipamento equipamento;

    @Enumerated(EnumType.STRING)
    @Schema(example = "TADS", description = "Curso do solicitante")
    private Curso curso;

    @Schema(example = "20210001", description = "GRR do solicitante")
    private String grr;

    @Schema(example = "Necessidade de equipamento para estudos", description = "Motivo da solicitação")
    private String motivo;

    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDate dataCadastro;

    @Enumerated(EnumType.STRING)
    @Schema(example = "PENDENTE", description = "Status atual da solicitação")
    private Status status;
    
    @Schema(example = "true", description = "Indica aluno tem matrícula ativa")
    private boolean ativo = true;

    @Schema(example = "true", description = "Indica se o solicitante não possui computador")
    private boolean sem_computador = true;

    @OneToMany(mappedBy = "solicitacao", cascade = CascadeType.ALL)
    private List<HistoricoSolicitacao> historico = new ArrayList<>(); 

    @OneToMany(mappedBy = "solicitacao", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Doacao> doacoes = new ArrayList<>();

    public Solicitacao(Equipamento equipamento, Curso curso, String grr, String motivo, LocalDate dataCadastro, Status status, boolean ativo,
            boolean sem_computador, List<HistoricoSolicitacao> historico, List<Doacao> doacoes) {
        this.equipamento = equipamento;
        this.curso = curso;
        this.grr = grr;
        this.motivo = motivo;
        this.dataCadastro = dataCadastro;
        this.status = status;
        this.ativo = ativo;
        this.sem_computador = sem_computador;
        this.historico = historico;
        this.doacoes = doacoes;
    }

    public Solicitacao(Long id, Long usuarioId, Equipamento equipamento, Curso curso, String grr, String motivo, LocalDate dataCadastro,
            Status status, boolean ativo, boolean sem_computador, List<HistoricoSolicitacao> historico,
            List<Doacao> doacoes) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.equipamento = equipamento;
        this.curso = curso;
        this.grr = grr;
        this.motivo = motivo;
        this.dataCadastro = dataCadastro;
        this.status = status;
        this.ativo = ativo;
        this.sem_computador = sem_computador;
        this.historico = historico;
        this.doacoes = doacoes;
    }

    public Solicitacao() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public Equipamento getEquipamento() {
        return equipamento;
    }

    public void setEquipamento(Equipamento equipamento) {
        this.equipamento = equipamento;
    }

    public Curso getCurso() {
        return curso;
    }

    public void setCurso(Curso curso) {
        this.curso = curso;
    }

    public String getGrr() {
        return grr;
    }

    public void setGrr(String grr) {
        this.grr = grr;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public LocalDate getDataCadastro() {
        return dataCadastro;
    }

    public void setDataCadastro(LocalDate dataCadastro) {
        this.dataCadastro = dataCadastro;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }

    public boolean isSem_computador() {
        return sem_computador;
    }

    public void setSem_computador(boolean sem_computador) {
        this.sem_computador = sem_computador;
    }

    public List<HistoricoSolicitacao> getHistorico() {
        return historico;
    }

    public void setHistorico(List<HistoricoSolicitacao> historico) {
        this.historico = historico;
    }

    public List<Doacao> getDoacoes() {
        return doacoes;
    }

    public void setDoacoes(List<Doacao> doacoes) {
        this.doacoes = doacoes;
    }

    

}
