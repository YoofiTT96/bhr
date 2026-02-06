package com.turntabl.bonarda.domain.common.service;

import com.turntabl.bonarda.domain.employee.model.Employee;
import com.turntabl.bonarda.domain.employee.repository.EmployeeRepository;
import com.turntabl.bonarda.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Centralized service for resolving entities by their public IDs.
 * <p>
 * This service eliminates the need for duplicate resolution methods
 * across domain services, providing a single source of truth for
 * entity lookups with consistent error handling.
 */
@Service
@RequiredArgsConstructor
public class EntityResolutionService {

    private final EmployeeRepository employeeRepository;

    /**
     * Resolves an Employee by their public UUID.
     *
     * @param publicId the public UUID of the employee
     * @return the Employee entity
     * @throws ResourceNotFoundException if no employee exists with the given public ID
     */
    public Employee resolveEmployee(UUID publicId) {
        return employeeRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "publicId", publicId));
    }

    /**
     * Resolves an Employee by their public UUID string.
     * Convenience method that parses the string to UUID.
     *
     * @param publicIdStr the public UUID as a string
     * @return the Employee entity
     * @throws IllegalArgumentException if the string is not a valid UUID
     * @throws ResourceNotFoundException if no employee exists with the given public ID
     */
    public Employee resolveEmployee(String publicIdStr) {
        return resolveEmployee(UUID.fromString(publicIdStr));
    }
}
