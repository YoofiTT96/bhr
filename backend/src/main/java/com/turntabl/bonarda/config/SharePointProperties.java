package com.turntabl.bonarda.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@ConfigurationProperties(prefix = "microsoft.graph")
public class SharePointProperties {
    private String tenantId;
    private String clientId;
    private String clientSecret;
    private List<String> scopes;
    private boolean mockEnabled = true;
    private Map<String, LibraryConfig> libraries = new HashMap<>();

    @Data
    public static class LibraryConfig {
        private String siteId;
        private String driveId;
        private String name;
    }
}
