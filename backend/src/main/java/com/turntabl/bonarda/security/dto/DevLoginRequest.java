package com.turntabl.bonarda.security.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DevLoginRequest {

    @NotBlank(message = "Employee ID is required")
    private String employeeId;
}
