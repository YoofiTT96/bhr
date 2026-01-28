package com.turntabl.nonnie.domain.employee.model;

import com.turntabl.nonnie.domain.common.model.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.Period;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "employees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee extends AuditableEntity {

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

    // Microsoft integration
    @Column(name = "microsoft_user_id", unique = true, length = 255)
    private String microsoftUserId;

    /**
     * Calculate tenure (time spent in company)
     * @return Period representing years, months, and days since hire date
     */
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
