
package com.nostalgi.snap;
import org.springframework.context.annotation.*; import org.springframework.web.servlet.config.annotation.*;
@Configuration public class CorsConfig { @Bean public WebMvcConfigurer corsConfigurer(){ return new WebMvcConfigurer(){ @Override public void addCorsMappings(CorsRegistry r){ r.addMapping("/**").allowedOrigins("*").allowedMethods("GET","POST","DELETE","PUT","OPTIONS").allowedHeaders("*"); } }; } }
