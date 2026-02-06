package com.turntabl.bonarda.domain.project.repository;

import com.turntabl.bonarda.domain.project.model.ProjectAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectAssignmentRepository extends JpaRepository<ProjectAssignment, Long> {

    Optional<ProjectAssignment> findByPublicId(UUID publicId);

    @Query("SELECT a FROM ProjectAssignment a JOIN FETCH a.employee WHERE a.project.id = :projectId ORDER BY a.role ASC, a.assignedAt ASC")
    List<ProjectAssignment> findByProjectIdWithEmployee(@Param("projectId") Long projectId);

    Optional<ProjectAssignment> findByProjectIdAndEmployeeId(Long projectId, Long employeeId);

    boolean existsByProjectIdAndEmployeeId(Long projectId, Long employeeId);
}
