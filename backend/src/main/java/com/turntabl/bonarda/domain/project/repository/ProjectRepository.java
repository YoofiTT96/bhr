package com.turntabl.bonarda.domain.project.repository;

import com.turntabl.bonarda.domain.project.model.Project;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    Optional<Project> findByPublicId(UUID publicId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Project p JOIN FETCH p.client WHERE p.publicId = :publicId")
    Optional<Project> findByPublicIdForUpdate(@Param("publicId") UUID publicId);

    @Query("SELECT p FROM Project p JOIN FETCH p.client LEFT JOIN FETCH p.assignments WHERE p.publicId = :publicId")
    Optional<Project> findByPublicIdWithDetails(@Param("publicId") UUID publicId);

    @Query("SELECT p FROM Project p JOIN FETCH p.client WHERE p.client.id = :clientId ORDER BY p.name ASC")
    List<Project> findByClientId(@Param("clientId") Long clientId);

    @Query(value = "SELECT p FROM Project p JOIN FETCH p.client",
           countQuery = "SELECT count(p) FROM Project p")
    Page<Project> findAllWithClient(Pageable pageable);

    @Query("SELECT p FROM Project p JOIN FETCH p.client JOIN p.assignments a WHERE a.employee.id = :employeeId ORDER BY p.name ASC")
    List<Project> findByAssignedEmployeeId(@Param("employeeId") Long employeeId);

    @Query("SELECT p FROM Project p JOIN FETCH p.client JOIN p.assignments a WHERE a.employee.id = :employeeId AND a.role = 'LEAD' ORDER BY p.name ASC")
    List<Project> findByLeadEmployeeId(@Param("employeeId") Long employeeId);
}
