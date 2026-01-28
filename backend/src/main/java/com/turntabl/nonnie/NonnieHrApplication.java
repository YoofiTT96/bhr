package com.turntabl.nonnie;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class NonnieHrApplication {

    public static void main(String[] args) {
        SpringApplication.run(NonnieHrApplication.class, args);
    }
}
