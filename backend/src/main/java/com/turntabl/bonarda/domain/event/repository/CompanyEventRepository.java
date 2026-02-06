package com.turntabl.bonarda.domain.event.repository;

import com.turntabl.bonarda.domain.event.model.CompanyEvent;
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
public interface CompanyEventRepository extends JpaRepository<CompanyEvent, Long> {

    Optional<CompanyEvent> findByPublicId(UUID publicId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM CompanyEvent e LEFT JOIN FETCH e.createdByEmployee WHERE e.publicId = :publicId")
    Optional<CompanyEvent> findByPublicIdForUpdate(@Param("publicId") UUID publicId);

    @Query("SELECT e FROM CompanyEvent e LEFT JOIN FETCH e.createdByEmployee " +
           "WHERE e.eventDate BETWEEN :startDate AND :endDate " +
           "ORDER BY e.eventDate ASC, e.startTime ASC")
    List<CompanyEvent> findByEventDateBetween(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query(value = "SELECT e FROM CompanyEvent e LEFT JOIN FETCH e.createdByEmployee ORDER BY e.eventDate DESC",
           countQuery = "SELECT count(e) FROM CompanyEvent e")
    Page<CompanyEvent> findAllWithCreator(Pageable pageable);
}
