package com.turntabl.bonarda.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "azure.ad")
public class AzureAdProperties {
    private boolean enabled = false;
    private String tenantId;
    private String clientId;
    private String clientSecret;
    private String redirectUri = "{baseUrl}/login/oauth2/code/azure";
    private String frontendCallbackUrl = "http://localhost:5173/auth/callback";
}
