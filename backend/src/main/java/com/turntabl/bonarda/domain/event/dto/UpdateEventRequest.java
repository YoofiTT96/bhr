package com.turntabl.bonarda.domain.event.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateEventRequest {
    private String title;
    private String description;
    private String eventDate;
    private String startTime;
    private String endTime;
    private String location;
    private String eventType;
}
