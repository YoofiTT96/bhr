package com.turntabl.bonarda.domain.event.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateEventRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Event date is required")
    private String eventDate;

    private String startTime;
    private String endTime;
    private String location;

    @NotBlank(message = "Event type is required")
    private String eventType;
}
