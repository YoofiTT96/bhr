package com.turntabl.bonarda.domain.employee.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class EmployeeHierarchyDto {

    private String id;
    private String name;
    private String position;
    private String email;
    private List<EmployeeHierarchyDto> directReports;
}
