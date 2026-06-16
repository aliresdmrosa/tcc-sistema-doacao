package com.sistemadoacao.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

// CORRETO
private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    @Autowired
    private JavaMailSender mailSender;

    public void enviarEmailCadastro(String email, String nome, String senha) {
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Cadastro realizado com sucesso!");
            message.setText("Olá " + nome + ",\n\nSeu cadastro no sistema de doações foi realizado com sucesso!\n\nObrigado por se juntar a nós.\n\nAtenciosamente,\nEquipe do Sistema de Doações");
            if(!senha.isBlank()){
                message.setText("Olá \" + nome + \",\\n" + //
                                        "\\n" + //
                                        "Seu cadastro no sistema de doações foi realizado com sucesso!\\n" + //
                                        "\\n" + //
                                        "\\Sua senha temporaria é: "+ senha + //
                                        "\\Obrigado por se juntar a nós.\\n" + //
                                        "\\n" + //
                                        "Atenciosamente,\\n" + //
                                        "Equipe do Sistema de Doaçõessenha temporaria:" + senha);
            }
            mailSender.send(message);



            logger.info("Email enviado com sucesso para " + email);
            
        } catch (MailException e) {
            logger.error("Erro ao enviar email para " + email + ": " + e.getMessage());
        }
    }

    public void enviarEmailAvaliacaoIA(String email, String nome, String resultado) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if(email != null && !email.isBlank()) {
                message.setTo(email);
            }else {
                logger.warn("Email do destinatário está vazio ou nulo. Não será possível enviar o email de avaliação da IA., destinatário: " + nome);
                return;
            }
            message.setSubject("Avaliação da IA para sua doação");
            message.setText("Olá " + nome + ",\n\nA avaliação da IA para a sua doação foi concluída. O resultado é: " + resultado + ".\n\nObrigado por contribuir com o nosso sistema de doações.\n\nAtenciosamente,\nEquipe do Sistema de Doações");
            mailSender.send(message);
            logger.info("Email de avaliação da IA enviado com sucesso para " + email);
        } catch (MailException e) {
            logger.error("Erro ao enviar email de avaliação da IA para " + email + ": " + e.getMessage());
        }
    }

    public void enviarEmailStatusDoacao(String email, String nome, String status) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if(email != null && !email.isBlank()) {
                message.setTo(email);
            }else {
                logger.warn("Email do destinatário está vazio ou nulo. Não será possível enviar o email de status da doação., destinatário: " + nome);
                return;
            }
            message.setSubject("Atualização do status da sua doação");
            message.setText("Olá " + nome + ",\n\nO status da sua doação foi atualizado para: " + status + ".\n\nObrigado por contribuir com o nosso sistema de doações.\n\nAtenciosamente,\nEquipe do Sistema de Doações");
            mailSender.send(message);
            logger.info("Email de atualização de status da doação enviado com sucesso para " + email);
        } catch (MailException e) {
            logger.error("Erro ao enviar email de atualização de status da doação para " + email + ": " + e.getMessage());
        }
    }

    public void enviarEmailRecuperacaoSenha(String email, String nome, String link) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Recuperação de senha");
            message.setText("Olá " + nome + ",\n\nRecebemos uma solicitação para redefinir sua senha.\n\nAcesse o link abaixo para criar uma nova senha:\n" + link + "\n\nEste link expira em 30 minutos.\n\nAtenciosamente,\nEquipe do Sistema de Doações");
            mailSender.send(message);
            logger.info("Email de recuperação de senha enviado com sucesso para " + email);
        } catch (MailException e) {
            logger.error("Erro ao enviar email de recuperação de senha para " + email + ": " + e.getMessage());
        }
    }
}
