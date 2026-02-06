package com.turntabl.bonarda.domain.timeoff.repository;

import com.turntabl.bonarda.domain.timeoff.model.TimeOffType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TimeOffTypeRepository extends JpaRepository<TimeOffType, Long> {
    Optional<TimeOffType> findByPublicId(UUID publicId);
    List<TimeOffType> findByIsActiveTrue();
    Optional<TimeOffType> findByName(String name);
    boolean existsByName(String name);
    boolean existsByNameAndIsActiveTrue(String name);
}
