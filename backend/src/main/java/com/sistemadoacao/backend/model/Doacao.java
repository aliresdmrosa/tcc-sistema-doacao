package com.sistemadoacao.backend.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Doacao {

    public Doacao(Long id, Long doadorId, Equipamento equipamento, Integer quantidade,
            String descricao, Conservacao statusConservacao, LocalDate dataCadastro,
            String url_imagem, Status status) {
        this.id = id;
        this.doadorId = doadorId;
        this.equipamento = equipamento;
        this.quantidade = quantidade;
        this.descricao = descricao;
        this.statusConservacao = statusConservacao;
        this.dataCadastro = dataCadastro;
        this.status = status;

    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    private Long doadorId;

    @Enumerated(EnumType.STRING)
    @Schema(example = "Teclado", description = "Tipo de equipamento doado")
    private Equipamento equipamento;

    @Schema(example = "1", description = "Quantidade de equipamentos doados")
    private Integer quantidade;

    @Schema(example = "Equipamento em ótimo estado, pouco uso.", description = "Descrição do equipamento doado")
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Schema(example = "NOVO", description = "Estado de conservação do equipamento doado")
    private Conservacao statusConservacao;

    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDate dataCadastro;

    @Schema(accessMode = Schema.AccessMode.READ_ONLY)
    @Column
    private LocalDate dataEntrega;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "doacao_id")
    private List<ImagemDoacao> imagens = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Schema(example = "PENDENTE", description = "Status da doação")
    private Status status;

    @OneToMany(mappedBy = "doacao", cascade = CascadeType.ALL)
    private List<HistoricoDoacao> historico = new ArrayList<>();
    
    @OneToOne(mappedBy = "doacao", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("doacao")
    private Reparo reparo;

    @ManyToOne
    @JoinColumn(name = "solicitacao_id") 
    @JsonBackReference
    private Solicitacao solicitacao;

}
