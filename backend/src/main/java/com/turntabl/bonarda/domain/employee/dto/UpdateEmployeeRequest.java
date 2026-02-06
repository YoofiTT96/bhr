package com.turntabl.bonarda.domain.employee.dto;

import com.turntabl.bonarda.domain.employee.model.EmployeeStatus;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UpdateEmployeeRequest {

    @Size(max = 100, message = "First name must be at most 100 characters")
    private String firstName;

    @Size(max = 100, message = "Last name must be at most 100 characters")
    private String lastName;

    @Size(max = 20, message = "Phone number must be at most 20 characters")
    private String phoneNumber;

    @Size(max = 100, message = "Position must be at most 100 characters")
    private String position;

    @Size(max = 100, message = "Location must be at most 100 characters")
    private String location;

    private LocalDate birthday;
    private LocalDate hireDate;
    private EmployeeStatus status;
    private String reportsToId;
    private String departmentId;
}
