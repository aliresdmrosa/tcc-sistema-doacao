package com.sistemadoacao.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.tika.Tika;

import com.sistemadoacao.backend.exception.FileStorageException;
import com.sistemadoacao.backend.exception.ImageErroLerException;
import com.sistemadoacao.backend.exception.ImageInvalidException;
import com.sistemadoacao.backend.exception.ImageNullException;
import com.sistemadoacao.backend.exception.MaxUploadSizeException;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class FileService {

    @Value("${upload.path}")
    private String PASTA;

    private final Tika tika = new Tika();

    private final int tamanhoMaximo = 5 * 1024 * 1024; // 5MB
    // Lista de tipos permitidos (MIME Types)
    private static final List<String> tipos = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf");

    public String salvarArquivo(MultipartFile arquivo) {

        // Validacao imagem
        if (arquivo == null || arquivo.isEmpty() || arquivo.getOriginalFilename() == null) {
            throw new ImageNullException("Arquivo imagem vazio. Por favor, selecione um arquivo para upload.");
        }

        try {
            // validar tipo e tamanho do arquivo
            String tipoDetectado = tika.detect(arquivo.getInputStream());

            if (!tipos.contains(tipoDetectado)) {
                throw new ImageInvalidException("Tipo de arquivo não permitido: " + tipoDetectado);
            }

            if (arquivo.getSize() > tamanhoMaximo) {
                throw new MaxUploadSizeException("O arquivo excede o tamanho máximo permitido de 5MB.");
            }

            String nomeOriginal = Paths.get(arquivo.getOriginalFilename()).getFileName().toString();
            String nomeArquivo = UUID.randomUUID() + "_" + nomeOriginal;

            // Criar o diretório se não existir
            Path diretorio = Paths.get(PASTA).toAbsolutePath().normalize();
            Files.createDirectories(diretorio);
            Path caminhoCompleto = diretorio.resolve(nomeArquivo);
            Files.write(caminhoCompleto, arquivo.getBytes());

            log.info("Tipo de arquivo detectado: " + tipoDetectado);
            log.info("Arquivo salvo com sucesso: " + nomeArquivo);
            return "/uploads/" + nomeArquivo;
        } catch (IOException e) {
            throw new ImageErroLerException("Erro ao ler o arquivo: " + e.getMessage());
        } catch(SecurityException e) {
            throw new FileStorageException("Permissão negada para salvar o arquivo: " + e.getMessage());
        }


    }

    public void deletarArquivo(String nomeArquivo) {
        try {
            String nome = Paths.get(nomeArquivo).getFileName().toString();
            Path caminhoImagem = Paths.get(PASTA).toAbsolutePath().normalize().resolve(nome);
            Files.deleteIfExists(caminhoImagem);
        } catch (IOException e) {
            log.error("Erro ao deletar imagem: " + e.getMessage());
        }
    }

}
