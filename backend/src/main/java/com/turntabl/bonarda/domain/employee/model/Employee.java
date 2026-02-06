package com.turntabl.bonarda.domain.employee.model;

import com.turntabl.bonarda.domain.common.model.AuditableEntity;
import com.turntabl.bonarda.domain.organization.model.Department;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.Period;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "employees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee extends AuditableEntity {

    @Column(name = "public_id", nullable = false, updatable = false, unique = true)
    private UUID publicId;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(length = 100)
    private String position;

    @Column(length = 100)
    private String location;

    private LocalDate birthday;

    @Column(name = "hire_date", nullable = false)
    private LocalDate hireDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    @Builder.Default
    private EmployeeStatus status = EmployeeStatus.ACTIVE;

    // Self-referencing relationship for hierarchical structure
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reports_to_id")
    private Employee reportsTo;

    @OneToMany(mappedBy = "reportsTo", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Employee> directReports = new HashSet<>();

    // Configurable field values
    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<EmployeeFieldValue> fieldValues = new HashSet<>();

    // Roles
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "employee_roles",
            joinColumns = @JoinColumn(name = "employee_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    // Microsoft integration
    @Column(name = "microsoft_user_id", unique = true, length = 255)
    private String microsoftUserId;

    // Department
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    /**
     * Calculate tenure (time spent in company)
     * @return Period representing years, months, and days since hire date
     */
    @PrePersist
    protected void ensurePublicId() {
        if (publicId == null) {
            publicId = UUID.randomUUID();
        }
    }

    @Transient
    public Period getTenure() {
        return Period.between(hireDate, LocalDate.now());
    }

    /**
     * Get full name
     * @return firstName + lastName
     */
    @Transient
    public String getFullName() {
        if (firstName == null && lastName == null) return "";
        if (firstName == null) return lastName;
        if (lastName == null) return firstName;
        return firstName + " " + lastName;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Employee)) return false;
        Employee employee = (Employee) o;
        return getId() != null && getId().equals(employee.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
