package com.sistemadoacao.backend.service;


import org.springframework.stereotype.Service;

import com.sistemadoacao.backend.dto.DashboardDTO;
import com.sistemadoacao.backend.dto.GraficoDTO;
import com.sistemadoacao.backend.dto.GraficoEquipamentoDTO;
import com.sistemadoacao.backend.model.Status;
import com.sistemadoacao.backend.repository.DoacaoRepository;
import com.sistemadoacao.backend.repository.UsuarioRepository;

@Service
public class DashboardService {

    private final UsuarioRepository usuarioRepository;

    private final DoacaoRepository doacaoRepository;

    DashboardService(UsuarioRepository usuarioRepository, DoacaoRepository doacaoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.doacaoRepository = doacaoRepository;
    }

    public DashboardDTO gerarRelatorioGeral() {
        return new DashboardDTO(
                usuarioRepository.count(),
                doacaoRepository.count(),
                doacaoRepository.countByStatus(Status.DOADO),
                doacaoRepository.countByStatus(Status.APROVADA),
                doacaoRepository.countByStatus(Status.APROVADA_REPARO),
                doacaoRepository.countByStatus(Status.REPROVADA),
                doacaoRepository.countByStatus(Status.REPARO),
                doacaoRepository.findDoacoesMensais().stream()
                        .map(p -> {
                            Object[] array = (Object[]) p; // Cast para array para acessar os índices
                            return new GraficoDTO((Integer) array[0], (Long) array[1]);
                        })
                        .toList(), // Transforma o Stream em List
                doacaoRepository.findTotalPorEquipamento().stream()
                        .map(p -> {
                            Object[] array = (Object[]) p; 
                            return new GraficoEquipamentoDTO(array[0].toString(), (Long) array[1]);
                        })
                        .toList() 
        );
    }

}
