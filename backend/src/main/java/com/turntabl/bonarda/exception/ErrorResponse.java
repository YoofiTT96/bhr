package com.turntabl.bonarda.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private final int status;
    private final String message;
    private final Map<String, String> errors;

    @Builder.Default
    private final LocalDateTime timestamp = LocalDateTime.now();
}
