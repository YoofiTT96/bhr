package com.turntabl.nonnie.domain.employee.repository;

import com.turntabl.nonnie.domain.employee.model.Employee;
import com.turntabl.nonnie.domain.employee.model.EmployeeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmail(String email);

    Optional<Employee> findByMicrosoftUserId(String microsoftUserId);

    List<Employee> findByReportsToId(Long managerId);

    List<Employee> findByStatus(EmployeeStatus status);

    @Query("SELECT e FROM Employee e LEFT JOIN FETCH e.fieldValues WHERE e.id = :id")
    Optional<Employee> findByIdWithFieldValues(@Param("id") Long id);

    @Query("SELECT e FROM Employee e LEFT JOIN FETCH e.directReports WHERE e.id = :id")
    Optional<Employee> findByIdWithDirectReports(@Param("id") Long id);

    @Query("SELECT e FROM Employee e WHERE LOWER(e.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(e.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Employee> searchEmployees(@Param("searchTerm") String searchTerm);

    boolean existsByEmail(String email);
}
