package com.turntabl.bonarda;

import com.turntabl.bonarda.config.AzureAdProperties;
import com.turntabl.bonarda.config.SharePointProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
@EnableConfigurationProperties({SharePointProperties.class, AzureAdProperties.class})
public class BonardaHrApplication {

    public static void main(String[] args) {
        SpringApplication.run(BonardaHrApplication.class, args);
    }
}
