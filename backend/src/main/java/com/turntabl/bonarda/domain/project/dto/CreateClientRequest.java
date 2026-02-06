package com.turntabl.bonarda.domain.project.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateClientRequest {
    @NotBlank(message = "Client name is required")
    private String name;
    private String industry;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String website;
    private String notes;
}
