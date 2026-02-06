package com.turntabl.bonarda.domain.employee.dto;

import com.turntabl.bonarda.domain.employee.model.EmployeeStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
public class EmployeeDto {

    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String position;
    private String location;
    private LocalDate birthday;
    private LocalDate hireDate;
    private EmployeeStatus status;
    private String microsoftUserId;

    // Manager info (flattened to avoid circular reference)
    private String reportsToId;
    private String reportsToName;

    // Department info
    private String departmentId;
    private String departmentName;

    // Computed
    private TenureDto tenure;
    private int directReportCount;

    @Getter
    @Builder
    public static class TenureDto {
        private int years;
        private int months;
        private int days;
    }
}
