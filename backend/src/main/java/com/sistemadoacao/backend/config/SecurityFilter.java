package com.sistemadoacao.backend.config;

import com.sistemadoacao.backend.repository.PessoaRepository;
import com.sistemadoacao.backend.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    private TokenService tokenService;
    private final PessoaRepository repository;

    public SecurityFilter(PessoaRepository repository) {
        this.repository = repository;
    }

    
    @Override
    protected void doFilterInternal( @SuppressWarnings("null") HttpServletRequest request, @SuppressWarnings("null") HttpServletResponse response, @SuppressWarnings("null") FilterChain filterChain)
            throws ServletException, IOException {

        var token = recuperarToken(request);
        if (token != null) {
            var email = tokenService.validarToken(token); // O subject aqui é o email
            var pessoa = repository.findByEmail(email).orElse(null);

            if (pessoa != null) {
                // Agora o primeiro argumento é o objeto 'pessoa', não apenas uma String
                var authentication = new UsernamePasswordAuthenticationToken(pessoa, null, pessoa.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }
        filterChain.doFilter(request, response);
    }

    private String recuperarToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");
        if (authHeader == null || authHeader.isBlank() || !authHeader.startsWith("Bearer "))
            return null;
        return authHeader.replace("Bearer ", "").trim();
    }
}