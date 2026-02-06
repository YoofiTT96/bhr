package com.turntabl.bonarda.security.dto;

import lombok.*;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private String tokenType;
    private String employeeId;
    private String email;
    private String name;
    private Set<String> roles;
    private Set<String> permissions;
}
