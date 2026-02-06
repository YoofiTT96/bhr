package com.turntabl.bonarda.domain.timesheet.repository;

import com.turntabl.bonarda.domain.timesheet.model.TimesheetEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TimesheetEntryRepository extends JpaRepository<TimesheetEntry, Long> {

    Optional<TimesheetEntry> findByPublicId(UUID publicId);

    List<TimesheetEntry> findByTimesheetIdOrderByEntryDateAsc(Long timesheetId);

    Optional<TimesheetEntry> findByTimesheetIdAndEntryDate(Long timesheetId, LocalDate entryDate);
}
