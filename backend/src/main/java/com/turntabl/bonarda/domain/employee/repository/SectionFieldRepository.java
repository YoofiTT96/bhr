package com.turntabl.bonarda.domain.employee.repository;

import com.turntabl.bonarda.domain.employee.model.SectionField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SectionFieldRepository extends JpaRepository<SectionField, Long> {

    List<SectionField> findBySectionIdOrderByDisplayOrderAsc(Long sectionId);

    Optional<SectionField> findBySectionIdAndFieldName(Long sectionId, String fieldName);

    @Query("SELECT f FROM SectionField f WHERE f.section.name = :sectionName ORDER BY f.displayOrder ASC")
    List<SectionField> findBySectionName(@Param("sectionName") String sectionName);

    boolean existsBySectionIdAndFieldName(Long sectionId, String fieldName);

    Optional<SectionField> findByPublicId(UUID publicId);
}
