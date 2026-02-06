package com.turntabl.bonarda.domain.timeoff.repository;

import com.turntabl.bonarda.domain.timeoff.model.TimeOffBalance;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TimeOffBalanceRepository extends JpaRepository<TimeOffBalance, Long> {
    Optional<TimeOffBalance> findByPublicId(UUID publicId);

    List<TimeOffBalance> findByEmployeeIdAndYear(Long employeeId, int year);

    Optional<TimeOffBalance> findByEmployeeIdAndTimeOffTypeIdAndYear(
            Long employeeId, Long timeOffTypeId, int year);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM TimeOffBalance b WHERE b.employee.id = :employeeId AND b.timeOffType.id = :typeId AND b.year = :year")
    Optional<TimeOffBalance> findByEmployeeIdAndTimeOffTypeIdAndYearForUpdate(
            @Param("employeeId") Long employeeId, @Param("typeId") Long typeId, @Param("year") int year);

    @Query("SELECT b FROM TimeOffBalance b JOIN FETCH b.timeOffType WHERE b.employee.id = :employeeId AND b.year = :year")
    List<TimeOffBalance> findByEmployeeIdAndYearWithType(
            @Param("employeeId") Long employeeId, @Param("year") int year);
}
