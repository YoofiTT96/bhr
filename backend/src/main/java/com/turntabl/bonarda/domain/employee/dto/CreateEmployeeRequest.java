package com.turntabl.bonarda.domain.employee.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateEmployeeRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must be at most 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must be at most 100 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @Size(max = 20, message = "Phone number must be at most 20 characters")
    private String phoneNumber;

    @Size(max = 100, message = "Position must be at most 100 characters")
    private String position;

    @Size(max = 100, message = "Location must be at most 100 characters")
    private String location;

    private LocalDate birthday;

    @NotNull(message = "Hire date is required")
    private LocalDate hireDate;

    private String reportsToId;

    private String departmentId;

    private String microsoftUserId;
}
