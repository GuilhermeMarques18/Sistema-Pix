package com.gc.sistem_pix.infra.openapi;

import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.tags.Tag;

@Configuration
@OpenAPIDefinition(info = @Info(title = "Sistema Pix API", version = "v1", description = "API do Sistema Pix"), tags = {
        @Tag(name = "Autenticação", description = "Login e autenticação"),
        @Tag(name = "Usuários", description = "Cadastro e gerenciamento de usuários"),
        @Tag(name = "Contas bancárias", description = "Operações de contas"),
        @Tag(name = "Chaves Pix", description = "Gerenciamento de chaves Pix"),
        @Tag(name = "Transações Pix", description = "Transferências Pix")
})
@SecurityScheme(name = "bearerAuth", description = "Informe o token JWT retornado pelo endpoint de login.", type = SecuritySchemeType.HTTP, in = SecuritySchemeIn.HEADER, scheme = "bearer", bearerFormat = "JWT")
public class OpenApiConfiguration {
}
