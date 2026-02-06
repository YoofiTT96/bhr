package com.turntabl.bonarda.domain.employee.repository;

import com.turntabl.bonarda.domain.employee.model.EmployeeFieldValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeFieldValueRepository extends JpaRepository<EmployeeFieldValue, Long> {

    List<EmployeeFieldValue> findByEmployeeId(Long employeeId);

    List<EmployeeFieldValue> findBySectionFieldId(Long sectionFieldId);

    Optional<EmployeeFieldValue> findByEmployeeIdAndSectionFieldId(Long employeeId, Long sectionFieldId);

    @Query("SELECT v FROM EmployeeFieldValue v " +
           "JOIN FETCH v.sectionField f " +
           "JOIN FETCH f.section s " +
           "WHERE v.employee.id = :employeeId AND s.name = :sectionName")
    List<EmployeeFieldValue> findByEmployeeIdAndSectionName(
        @Param("employeeId") Long employeeId,
        @Param("sectionName") String sectionName
    );

    void deleteByEmployeeIdAndSectionFieldId(Long employeeId, Long sectionFieldId);
}
