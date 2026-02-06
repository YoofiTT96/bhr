package com.turntabl.bonarda.domain.project.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateClientRequest {
    private String name;
    private String industry;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String website;
    private String notes;
    private Boolean isActive;
}
