package com.turntabl.nonnie.domain.employee.repository;

import com.turntabl.nonnie.domain.employee.model.EmployeeSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeSectionRepository extends JpaRepository<EmployeeSection, Long> {

    Optional<EmployeeSection> findByName(String name);

    List<EmployeeSection> findByIsActiveTrue();

    List<EmployeeSection> findAllByOrderByDisplayOrderAsc();

    @Query("SELECT s FROM EmployeeSection s LEFT JOIN FETCH s.fields WHERE s.id = :id")
    Optional<EmployeeSection> findByIdWithFields(@Param("id") Long id);

    @Query("SELECT s FROM EmployeeSection s LEFT JOIN FETCH s.fields WHERE s.name = :name")
    Optional<EmployeeSection> findByNameWithFields(@Param("name") String name);

    boolean existsByName(String name);
}
