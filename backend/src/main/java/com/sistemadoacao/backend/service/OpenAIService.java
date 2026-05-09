package com.sistemadoacao.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sistemadoacao.backend.dto.AnaliseIAResponse;
import com.sistemadoacao.backend.exception.RequestImageIaException;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import java.util.*;

@Service
public class OpenAIService {

    private final String apiKey;

    public OpenAIService(@Value("${open.ia.api.key:}") String apiKey) {
        this.apiKey = apiKey;
    }

    public AnaliseIAResponse analisarImagem(MultipartFile imagem) {

    try {

        String contentType = imagem.getContentType();
        // Converter imagem para base64
        String base64 = Base64.getEncoder().encodeToString(imagem.getBytes());

        // Criar JSON com Jackson
        ObjectMapper mapper = new ObjectMapper();

        Map<String, Object> textContent = new HashMap<>();
        textContent.put("type", "input_text");
        textContent.put("text",
                "Analise a imagem e se nao for de um computador ou periférico status deve ser REPROVADO caso contrario determine seu estado:\n" +
                "- APROVADO: funcionando normalmente\n" +
                "- REPARO: possui defeitos, mas pode ser consertado\n" +
                "- REPROVADO: não tem conserto\n\n" +
                "Responda formato com no maximo 20 caracteres:\n" +
                "{\n" +
                "  \"status\": \"APROVADO | REPARO | REPROVADO\",\n" +
                "  \"descricao\": \"Descreva o problema ou estado de forma resumida\",\n" +
                "  \"recomendacao\": \"escreva o que deve ser feito de forma resumida\"\n" +
                "}"
        );

        Map<String, Object> imageContent = new HashMap<>();
        imageContent.put("type", "input_image");
        imageContent.put("image_url", "data:" + contentType + ";base64," + base64);

        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", List.of(textContent, imageContent));

        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-4.1-mini");
        body.put("input", List.of(message));

        String requestBody = mapper.writeValueAsString(body);

        // request HTTP pois nao tem SDK oficial da OpenAI para Java (04/2026)
        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/responses"))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        //  request
        HttpResponse<String> response = client.send(
            request,
            HttpResponse.BodyHandlers.ofString()
        );
       

        //  Parse da resposta da OpenAI
        JsonNode root = mapper.readTree(response.body());

        
        String respostaTexto = root
                .path("output")
                .get(0)
                .path("content")
                .get(0)
                .path("text")
                .asText();

        //  JSON retornado pela IA para o formato do AnaliseIAResponse
        System.out.println("Análise da IA: " + respostaTexto);
        AnaliseIAResponse analise = mapper.readValue(respostaTexto.replace("```json```", "").replace("```", "").trim(), AnaliseIAResponse.class);

        return analise;

    } catch (JsonProcessingException e) {
        
        throw new RequestImageIaException("Erro ao processar análise da IA: " + e.getMessage());

    }
    catch (Exception e) {
        throw new RequestImageIaException("Erro ao solicitar análise da IA: " + e.getMessage());
    }
}

}