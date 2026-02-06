package com.turntabl.bonarda.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.oidc.IdTokenClaimNames;

@Configuration
@ConditionalOnProperty(name = "azure.ad.enabled", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
public class AzureAdOAuth2Config {

    private final AzureAdProperties properties;

    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        log.info("Azure AD SSO is ENABLED — registering OAuth2 client for tenant: {}", properties.getTenantId());
        return new InMemoryClientRegistrationRepository(azureClientRegistration());
    }

    private ClientRegistration azureClientRegistration() {
        String tenantId = properties.getTenantId();
        return ClientRegistration.withRegistrationId("azure")
                .clientId(properties.getClientId())
                .clientSecret(properties.getClientSecret())
                .scope("openid", "profile", "email")
                .authorizationUri("https://login.microsoftonline.com/" + tenantId + "/oauth2/v2.0/authorize")
                .tokenUri("https://login.microsoftonline.com/" + tenantId + "/oauth2/v2.0/token")
                .userInfoUri("https://graph.microsoft.com/oidc/userinfo")
                .jwkSetUri("https://login.microsoftonline.com/" + tenantId + "/discovery/v2.0/keys")
                .userNameAttributeName(IdTokenClaimNames.SUB)
                .redirectUri(properties.getRedirectUri())
                .clientName("Microsoft Azure AD")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .build();
    }
}
