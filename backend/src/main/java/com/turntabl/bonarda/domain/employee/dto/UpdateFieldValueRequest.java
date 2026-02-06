package com.turntabl.bonarda.domain.employee.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class UpdateFieldValueRequest {

    @NotNull(message = "Value is required")
    private Map<String, Object> value;
}
