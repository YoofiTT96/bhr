package com.turntabl.bonarda.domain.event.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CompanyEventDto {
    private String id;
    private String title;
    private String description;
    private String eventDate;
    private String startTime;
    private String endTime;
    private String location;
    private String eventType;
    private String createdByEmployeeId;
    private String createdByEmployeeName;
    private String createdAt;
}
