package com.clothic.backend.auth;

import java.util.List;

import jakarta.servlet.DispatcherType;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * /api/health만 공개하고 나머지 /api/** 는 검증된 토큰을 요구한다. 세션·CSRF는 사용하지 않는다.
 * 자체 인증(S-02)이 켜져 있을 때만 가입·로그인·갱신·로그아웃 경로를 토큰 없이 받는다.
 */
@Configuration
@EnableConfigurationProperties({ AuthProperties.class, LocalAuthProperties.class, WebCorsProperties.class })
public class SecurityConfig {

    @Bean
    JwtDecoder jwtDecoder(AuthProperties properties, LocalAuthProperties local) {
        return SupabaseJwtDecoderFactory.create(properties, local);
    }

    @Bean
    UrlBasedCorsConfigurationSource corsConfigurationSource(WebCorsProperties properties) {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(properties.allowedOrigins());
        configuration.setAllowedMethods(List.of("GET", "POST", "PATCH"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        configuration.setMaxAge(600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, JwtDecoder jwtDecoder,
            UrlBasedCorsConfigurationSource corsConfigurationSource, LocalAuthProperties local) throws Exception {
        String[] publicAuthPaths = local.enabled()
                ? new String[] { "/api/auth/signup", "/api/auth/login", "/api/auth/refresh", "/api/auth/logout" }
                : new String[0];
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(requests -> requests
                        // 오류 응답을 만드는 서버 내부 전달이다. 막으면 토큰 없는 공개 경로의 400·409가 401로 바뀐다.
                        .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/health").permitAll()
                        .requestMatchers(HttpMethod.POST, publicAuthPaths).permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.decoder(jwtDecoder)))
                .httpBasic(basic -> basic.disable())
                .formLogin(form -> form.disable())
                .logout(logout -> logout.disable())
                .build();
    }
}
