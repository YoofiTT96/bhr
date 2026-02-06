package com.turntabl.bonarda.domain.employee.service;

import com.turntabl.bonarda.domain.common.service.EntityResolutionService;
import com.turntabl.bonarda.domain.employee.dto.*;
import com.turntabl.bonarda.domain.employee.model.Employee;
import com.turntabl.bonarda.domain.employee.model.EmployeeFieldValue;
import com.turntabl.bonarda.domain.employee.model.SectionField;
import com.turntabl.bonarda.domain.employee.repository.EmployeeFieldValueRepository;
import com.turntabl.bonarda.domain.employee.repository.EmployeeRepository;
import com.turntabl.bonarda.domain.employee.repository.SectionFieldRepository;
import com.turntabl.bonarda.domain.organization.model.Department;
import com.turntabl.bonarda.domain.organization.repository.DepartmentRepository;
import com.turntabl.bonarda.exception.BadRequestException;
import com.turntabl.bonarda.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Period;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final SectionFieldRepository sectionFieldRepository;
    private final EmployeeFieldValueRepository fieldValueRepository;
    private final EntityResolutionService entityResolution;
    private final DepartmentRepository departmentRepository;

    @Override
    public EmployeeDto createEmployee(CreateEmployeeRequest request) {
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Employee with email " + request.getEmail() + " already exists");
        }

        Employee employee = Employee.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .position(request.getPosition())
                .location(request.getLocation())
                .birthday(request.getBirthday())
                .hireDate(request.getHireDate())
                .microsoftUserId(request.getMicrosoftUserId())
                .build();

        if (request.getReportsToId() != null) {
            UUID managerPublicId = UUID.fromString(request.getReportsToId());
            Employee manager = entityResolution.resolveEmployee(managerPublicId);
            employee.setReportsTo(manager);
        }

        if (request.getDepartmentId() != null) {
            UUID deptPublicId = UUID.fromString(request.getDepartmentId());
            Department department = departmentRepository.findByPublicId(deptPublicId)
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "publicId", deptPublicId));
            employee.setDepartment(department);
        }

        Employee saved = employeeRepository.save(employee);
        return toDto(saved);
    }

    @Override
    public EmployeeDto updateEmployee(UUID publicId, UpdateEmployeeRequest request) {
        Employee employee = entityResolution.resolveEmployee(publicId);

        if (request.getFirstName() != null) employee.setFirstName(request.getFirstName());
        if (request.getLastName() != null) employee.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) employee.setPhoneNumber(request.getPhoneNumber());
        if (request.getPosition() != null) employee.setPosition(request.getPosition());
        if (request.getLocation() != null) employee.setLocation(request.getLocation());
        if (request.getBirthday() != null) employee.setBirthday(request.getBirthday());
        if (request.getHireDate() != null) employee.setHireDate(request.getHireDate());
        if (request.getStatus() != null) employee.setStatus(request.getStatus());

        if (request.getReportsToId() != null) {
            UUID managerPublicId = UUID.fromString(request.getReportsToId());
            validateReportsTo(employee.getId(), managerPublicId);
            Employee manager = entityResolution.resolveEmployee(managerPublicId);
            employee.setReportsTo(manager);
        }

        if (request.getDepartmentId() != null) {
            UUID deptPublicId = UUID.fromString(request.getDepartmentId());
            Department department = departmentRepository.findByPublicId(deptPublicId)
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "publicId", deptPublicId));
            employee.setDepartment(department);
        }

        Employee updated = employeeRepository.save(employee);
        return toDto(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeDto getEmployeeById(UUID publicId) {
        Employee employee = entityResolution.resolveEmployee(publicId);
        return toDto(employee);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EmployeeDto> getAllEmployees(Pageable pageable) {
        return employeeRepository.findAll(pageable).map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeDto> searchEmployees(String searchTerm) {
        return employeeRepository.searchEmployees(searchTerm).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeDto> getDirectReports(UUID publicId) {
        Employee manager = entityResolution.resolveEmployee(publicId);
        return employeeRepository.findByReportsToId(manager.getId()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeHierarchyDto getEmployeeHierarchy(UUID publicId) {
        Employee employee = entityResolution.resolveEmployee(publicId);
        Employee withReports = employeeRepository.findByIdWithDirectReports(employee.getId())
                .orElse(employee);
        return buildHierarchy(withReports);
    }

    @Override
    public void deleteEmployee(UUID publicId) {
        Employee employee = entityResolution.resolveEmployee(publicId);
        employeeRepository.delete(employee);
    }

    @Override
    public FieldValueDto updateFieldValue(UUID employeePublicId, Long fieldId, UpdateFieldValueRequest request) {
        Employee employee = entityResolution.resolveEmployee(employeePublicId);

        SectionField field = sectionFieldRepository.findById(fieldId)
                .orElseThrow(() -> new ResourceNotFoundException("SectionField", "id", fieldId));

        EmployeeFieldValue fieldValue = fieldValueRepository
                .findByEmployeeIdAndSectionFieldId(employee.getId(), fieldId)
                .orElseGet(() -> EmployeeFieldValue.builder()
                        .employee(employee)
                        .sectionField(field)
                        .build());

        fieldValue.setValue(request.getValue());
        EmployeeFieldValue saved = fieldValueRepository.save(fieldValue);

        return FieldValueDto.builder()
                .id(saved.getId())
                .sectionFieldId(field.getId())
                .fieldName(field.getFieldName())
                .fieldLabel(field.getFieldLabel())
                .value(saved.getValue())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FieldValueDto> getEmployeeFieldValues(UUID employeePublicId, String sectionName) {
        Employee employee = entityResolution.resolveEmployee(employeePublicId);
        Long employeeId = employee.getId();

        List<SectionField> sectionFields = sectionFieldRepository.findBySectionName(sectionName);
        List<EmployeeFieldValue> values = fieldValueRepository
                .findByEmployeeIdAndSectionName(employeeId, sectionName);

        return sectionFields.stream().map(field -> {
            EmployeeFieldValue existing = values.stream()
                    .filter(v -> v.getSectionField().getId().equals(field.getId()))
                    .findFirst()
                    .orElse(null);

            return FieldValueDto.builder()
                    .id(existing != null ? existing.getId() : null)
                    .sectionFieldId(field.getId())
                    .fieldName(field.getFieldName())
                    .fieldLabel(field.getFieldLabel())
                    .value(existing != null ? existing.getValue() : null)
                    .build();
        }).collect(Collectors.toList());
    }

    // --- Private helpers ---

    private void validateReportsTo(Long employeeId, UUID reportsToPublicId) {
        Employee reportsToEmployee = entityResolution.resolveEmployee(reportsToPublicId);
        if (employeeId.equals(reportsToEmployee.getId())) {
            throw new BadRequestException("An employee cannot report to themselves");
        }

        // Walk up the chain to detect circular references
        Employee current = reportsToEmployee;
        while (current.getReportsTo() != null) {
            if (current.getReportsTo().getId().equals(employeeId)) {
                throw new BadRequestException("Circular reporting relationship detected");
            }
            current = current.getReportsTo();
        }
    }

    private EmployeeHierarchyDto buildHierarchy(Employee employee) {
        List<EmployeeHierarchyDto> reports = new ArrayList<>();
        if (employee.getDirectReports() != null) {
            for (Employee report : employee.getDirectReports()) {
                Employee withReports = employeeRepository.findByIdWithDirectReports(report.getId())
                        .orElse(report);
                reports.add(buildHierarchy(withReports));
            }
        }

        return EmployeeHierarchyDto.builder()
                .id(employee.getPublicId().toString())
                .name(employee.getFullName())
                .position(employee.getPosition())
                .email(employee.getEmail())
                .directReports(reports)
                .build();
    }

    private EmployeeDto toDto(Employee employee) {
        Period tenure = employee.getTenure();
        int directReportCount = employee.getDirectReports() != null
                ? employee.getDirectReports().size() : 0;

        return EmployeeDto.builder()
                .id(employee.getPublicId().toString())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .email(employee.getEmail())
                .phoneNumber(employee.getPhoneNumber())
                .position(employee.getPosition())
                .location(employee.getLocation())
                .birthday(employee.getBirthday())
                .hireDate(employee.getHireDate())
                .status(employee.getStatus())
                .microsoftUserId(employee.getMicrosoftUserId())
                .reportsToId(employee.getReportsTo() != null ? employee.getReportsTo().getPublicId().toString() : null)
                .reportsToName(employee.getReportsTo() != null ? employee.getReportsTo().getFullName() : null)
                .departmentId(employee.getDepartment() != null ? employee.getDepartment().getPublicId().toString() : null)
                .departmentName(employee.getDepartment() != null ? employee.getDepartment().getName() : null)
                .tenure(EmployeeDto.TenureDto.builder()
                        .years(tenure.getYears())
                        .months(tenure.getMonths())
                        .days(tenure.getDays())
                        .build())
                .directReportCount(directReportCount)
                .build();
    }
}
