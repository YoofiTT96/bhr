package com.turntabl.bonarda.domain.timeoff.repository;

import com.turntabl.bonarda.domain.timeoff.model.TimeOffRequest;
import com.turntabl.bonarda.domain.timeoff.model.TimeOffRequestStatus;
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
public interface TimeOffRequestRepository extends JpaRepository<TimeOffRequest, Long> {
    Optional<TimeOffRequest> findByPublicId(UUID publicId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM TimeOffRequest r JOIN FETCH r.employee JOIN FETCH r.timeOffType LEFT JOIN FETCH r.reviewer WHERE r.publicId = :publicId")
    Optional<TimeOffRequest> findByPublicIdForUpdate(@Param("publicId") UUID publicId);

    @Query("SELECT r FROM TimeOffRequest r JOIN FETCH r.employee JOIN FETCH r.timeOffType LEFT JOIN FETCH r.reviewer " +
           "WHERE r.employee.id = :employeeId ORDER BY r.createdAt DESC")
    List<TimeOffRequest> findByEmployeeIdOrderByCreatedAtDesc(@Param("employeeId") Long employeeId);

    @Query("SELECT r FROM TimeOffRequest r JOIN FETCH r.employee JOIN FETCH r.timeOffType LEFT JOIN FETCH r.reviewer " +
           "WHERE r.employee.reportsTo.id = :managerId ORDER BY r.createdAt DESC")
    List<TimeOffRequest> findByEmployeeReportsToId(@Param("managerId") Long managerId);

    @Query("SELECT r FROM TimeOffRequest r WHERE r.employee.id = :employeeId " +
           "AND r.status IN :statuses " +
           "AND r.startDate <= :endDate AND r.endDate >= :startDate")
    List<TimeOffRequest> findOverlappingRequests(
            @Param("employeeId") Long employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("statuses") List<TimeOffRequestStatus> statuses);

    @Query(value = "SELECT r FROM TimeOffRequest r JOIN FETCH r.employee JOIN FETCH r.timeOffType LEFT JOIN FETCH r.reviewer",
           countQuery = "SELECT count(r) FROM TimeOffRequest r")
    Page<TimeOffRequest> findAllWithAssociations(Pageable pageable);

    @Query("SELECT r FROM TimeOffRequest r JOIN FETCH r.employee JOIN FETCH r.timeOffType " +
           "WHERE r.status = 'APPROVED' " +
           "AND r.startDate <= :endDate AND r.endDate >= :startDate " +
           "ORDER BY r.timeOffType.name ASC, r.employee.lastName ASC, r.employee.firstName ASC")
    List<TimeOffRequest> findApprovedRequestsOverlappingDateRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
