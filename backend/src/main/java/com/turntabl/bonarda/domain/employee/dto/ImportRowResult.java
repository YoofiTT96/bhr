package com.turntabl.bonarda.domain.employee.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ImportRowResult {
    private int rowNumber;
    private String email;
    private String status;
    private String employeeId;
    private List<String> errors;
}
