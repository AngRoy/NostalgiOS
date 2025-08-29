
package com.nostalgi.snap;
import org.springframework.context.annotation.*; import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity; import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
@Configuration
public class SecurityConfig {
  private final JwtFilter jwtFilter;
  public SecurityConfig(JwtFilter f){ this.jwtFilter=f; }
  @Bean PasswordEncoder encoder(){ return new BCryptPasswordEncoder(); }
  @Bean public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.csrf(csrf->csrf.disable())
        .headers(h->h.frameOptions(f->f.disable()))
        .authorizeHttpRequests(a->a
          .requestMatchers("/api/auth/**","/h2-console/**","/api/health","/api/leaderboard/**").permitAll()
          .anyRequest().permitAll()
        )
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
  }
}
