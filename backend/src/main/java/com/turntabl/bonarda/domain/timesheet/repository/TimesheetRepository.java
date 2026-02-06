package com.turntabl.bonarda.domain.timesheet.repository;

import com.turntabl.bonarda.domain.timesheet.model.Timesheet;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TimesheetRepository extends JpaRepository<Timesheet, Long> {

    Optional<Timesheet> findByPublicId(UUID publicId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Timesheet t JOIN FETCH t.employee LEFT JOIN FETCH t.reviewer LEFT JOIN FETCH t.entries WHERE t.publicId = :publicId")
    Optional<Timesheet> findByPublicIdForUpdate(@Param("publicId") UUID publicId);

    @Query("SELECT t FROM Timesheet t JOIN FETCH t.employee LEFT JOIN FETCH t.reviewer LEFT JOIN FETCH t.entries WHERE t.publicId = :publicId")
    Optional<Timesheet> findByPublicIdWithDetails(@Param("publicId") UUID publicId);

    Optional<Timesheet> findByEmployeeIdAndWeekStart(Long employeeId, LocalDate weekStart);

    @Query("SELECT t FROM Timesheet t JOIN FETCH t.employee LEFT JOIN FETCH t.reviewer LEFT JOIN FETCH t.entries " +
           "WHERE t.employee.id = :employeeId AND t.weekStart = :weekStart")
    Optional<Timesheet> findByEmployeeIdAndWeekStartWithDetails(@Param("employeeId") Long employeeId, @Param("weekStart") LocalDate weekStart);

    @Query("SELECT t FROM Timesheet t JOIN FETCH t.employee LEFT JOIN FETCH t.reviewer " +
           "WHERE t.employee.id = :employeeId ORDER BY t.weekStart DESC")
    List<Timesheet> findByEmployeeIdOrderByWeekStartDesc(@Param("employeeId") Long employeeId);

    @Query("SELECT t FROM Timesheet t JOIN FETCH t.employee LEFT JOIN FETCH t.reviewer " +
           "WHERE t.employee.reportsTo.id = :managerId ORDER BY t.weekStart DESC")
    List<Timesheet> findByEmployeeReportsToId(@Param("managerId") Long managerId);

    @Query(value = "SELECT t FROM Timesheet t JOIN FETCH t.employee LEFT JOIN FETCH t.reviewer",
           countQuery = "SELECT count(t) FROM Timesheet t")
    Page<Timesheet> findAllWithAssociations(Pageable pageable);
}
