package com.turntabl.bonarda.domain.project.repository;

import com.turntabl.bonarda.domain.project.model.ProjectTimeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectTimeLogRepository extends JpaRepository<ProjectTimeLog, Long> {

    Optional<ProjectTimeLog> findByPublicId(UUID publicId);

    Optional<ProjectTimeLog> findByProjectIdAndEmployeeIdAndLogDate(Long projectId, Long employeeId, LocalDate logDate);

    @Query("SELECT l FROM ProjectTimeLog l JOIN FETCH l.employee WHERE l.project.id = :projectId ORDER BY l.logDate DESC, l.employee.lastName ASC")
    List<ProjectTimeLog> findByProjectIdWithEmployee(@Param("projectId") Long projectId);

    @Query("SELECT l FROM ProjectTimeLog l JOIN FETCH l.project JOIN FETCH l.project.client WHERE l.employee.id = :employeeId ORDER BY l.logDate DESC")
    List<ProjectTimeLog> findByEmployeeIdWithProject(@Param("employeeId") Long employeeId);

    @Query("SELECT COALESCE(SUM(l.hours), 0) FROM ProjectTimeLog l WHERE l.project.id = :projectId")
    BigDecimal getTotalHoursForProject(@Param("projectId") Long projectId);

    @Query("SELECT COALESCE(SUM(l.hours), 0) FROM ProjectTimeLog l WHERE l.project.id = :projectId AND l.employee.id = :employeeId")
    BigDecimal getTotalHoursForProjectByEmployee(@Param("projectId") Long projectId, @Param("employeeId") Long employeeId);
}
