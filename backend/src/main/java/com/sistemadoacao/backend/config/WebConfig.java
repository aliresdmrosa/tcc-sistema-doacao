package com.sistemadoacao.backend.config;

import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${upload.path}")
    private String uploadPath;

    @Override
    public void addResourceHandlers(@SuppressWarnings("null") ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
            .addResourceLocations(Paths.get(uploadPath).toAbsolutePath().normalize().toUri().toString());
    }

}
