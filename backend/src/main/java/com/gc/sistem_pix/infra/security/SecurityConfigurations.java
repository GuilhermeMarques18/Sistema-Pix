package com.gc.sistem_pix.infra.security;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfigurations {

    private final SecurityFilter securityFilter;

    @Value("${app.cors.allowed-origins:http://localhost:3001,http://127.0.0.1:3001}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/users/pessoa-fisica", "/api/users/pessoa-juridica")
                        .permitAll()
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/error").permitAll()

                        // 1. Exclusivo OWNER
                        .requestMatchers("/api/admin/users/**").hasRole("OWNER")

                        // 2. Moderação e Administração do Sistema (ADMIN e OWNER)
                        .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "OWNER")

                        // Rotas próprias do correntista (prioridade sobre os curingas de id)
                        .requestMatchers("/api/users/me").hasAnyRole("USER", "ADMIN", "OWNER")
                        .requestMatchers("/accounts/me", "/accounts/me/**").hasAnyRole("USER", "ADMIN", "OWNER")
                        .requestMatchers("/api/pix/transactions/me", "/api/pix/transactions/extrato", "/api/pix/transactions/history").hasAnyRole("USER", "ADMIN", "OWNER")
                        .requestMatchers(HttpMethod.POST, "/api/pix/transactions").hasAnyRole("USER", "ADMIN", "OWNER")

                        // Rotas administrativas de auditoria e gestão (ADMIN e OWNER)
                        .requestMatchers(HttpMethod.GET, "/api/users", "/api/users/*").hasAnyRole("ADMIN", "OWNER")
                        .requestMatchers(HttpMethod.DELETE, "/api/users/*").hasAnyRole("ADMIN", "OWNER")

                        .requestMatchers(HttpMethod.GET, "/accounts", "/accounts/*", "/accounts/user/*").hasAnyRole("ADMIN", "OWNER")
                        .requestMatchers(HttpMethod.PATCH, "/accounts/*/block", "/accounts/*/unblock").hasAnyRole("ADMIN", "OWNER")
                        .requestMatchers(HttpMethod.DELETE, "/accounts/*").hasAnyRole("ADMIN", "OWNER")

                        .requestMatchers(HttpMethod.GET, "/api/pix/transactions", "/api/pix/transactions/user/*").hasAnyRole("ADMIN", "OWNER")

                        // 3. Demais rotas autenticadas do sistema
                        .requestMatchers("/api/pix/**").hasAnyRole("USER", "ADMIN", "OWNER")
                        .requestMatchers("/accounts/**").hasAnyRole("USER", "ADMIN", "OWNER")
                        .requestMatchers("/api/users/**").hasAnyRole("USER", "ADMIN", "OWNER")

                        .anyRequest().authenticated())
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .toList());
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
