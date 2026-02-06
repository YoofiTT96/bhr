package com.turntabl.bonarda.domain.employee.service;

import com.turntabl.bonarda.domain.employee.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface EmployeeService {

    EmployeeDto createEmployee(CreateEmployeeRequest request);

    EmployeeDto updateEmployee(UUID publicId, UpdateEmployeeRequest request);

    EmployeeDto getEmployeeById(UUID publicId);

    Page<EmployeeDto> getAllEmployees(Pageable pageable);

    List<EmployeeDto> searchEmployees(String searchTerm);

    List<EmployeeDto> getDirectReports(UUID publicId);

    EmployeeHierarchyDto getEmployeeHierarchy(UUID publicId);

    void deleteEmployee(UUID publicId);

    // Field value operations
    FieldValueDto updateFieldValue(UUID employeePublicId, Long fieldId, UpdateFieldValueRequest request);

    List<FieldValueDto> getEmployeeFieldValues(UUID employeePublicId, String sectionName);
}
