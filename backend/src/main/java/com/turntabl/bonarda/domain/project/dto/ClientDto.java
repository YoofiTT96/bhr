package com.turntabl.bonarda.domain.project.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ClientDto {
    private String id;
    private String name;
    private String industry;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String website;
    private String notes;
    private Boolean isActive;
    private int projectCount;
}
