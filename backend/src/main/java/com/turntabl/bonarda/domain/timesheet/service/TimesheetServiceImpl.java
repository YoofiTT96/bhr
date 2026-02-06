package com.turntabl.bonarda.domain.timesheet.service;

import com.turntabl.bonarda.domain.employee.model.Employee;
import com.turntabl.bonarda.domain.employee.repository.EmployeeRepository;
import com.turntabl.bonarda.domain.timesheet.dto.*;
import com.turntabl.bonarda.domain.timesheet.model.Timesheet;
import com.turntabl.bonarda.domain.timesheet.model.TimesheetEntry;
import com.turntabl.bonarda.domain.timesheet.model.TimesheetStatus;
import com.turntabl.bonarda.domain.timesheet.repository.TimesheetEntryRepository;
import com.turntabl.bonarda.domain.timesheet.repository.TimesheetRepository;
import com.turntabl.bonarda.exception.BadRequestException;
import com.turntabl.bonarda.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class TimesheetServiceImpl implements TimesheetService {

    private final TimesheetRepository timesheetRepository;
    private final TimesheetEntryRepository entryRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public TimesheetDto getOrCreateTimesheet(UUID employeePublicId, CreateTimesheetRequest request) {
        Employee employee = resolveEmployeeByPublicId(employeePublicId);

        LocalDate weekStart = request.getWeekStart();
        if (weekStart.getDayOfWeek() != DayOfWeek.MONDAY) {
            throw new BadRequestException("Week start date must be a Monday");
        }

        validateWithinEditWindow(weekStart);

        // Find existing or create new
        Timesheet timesheet = timesheetRepository.findByEmployeeIdAndWeekStartWithDetails(
                employee.getId(), weekStart)
                .orElseGet(() -> {
                    Timesheet newTimesheet = Timesheet.builder()
                            .employee(employee)
                            .weekStart(weekStart)
                            .build();
                    return timesheetRepository.save(newTimesheet);
                });

        return toDto(timesheet);
    }

    @Override
    public TimesheetDto updateEntries(UUID timesheetPublicId, UpdateTimesheetEntriesRequest request, UUID currentUserPublicId) {
        Timesheet timesheet = timesheetRepository.findByPublicIdForUpdate(timesheetPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Timesheet", "publicId", timesheetPublicId));

        Employee currentUser = resolveEmployeeByPublicId(currentUserPublicId);

        // Validate ownership
        if (!timesheet.getEmployee().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only update your own timesheets");
        }

        // Validate status allows editing
        if (timesheet.getStatus() != TimesheetStatus.DRAFT && timesheet.getStatus() != TimesheetStatus.REJECTED) {
            throw new BadRequestException("Only DRAFT or REJECTED timesheets can be edited");
        }

        validateWithinEditWindow(timesheet.getWeekStart());

        // If rejected, reset back to draft on edit
        if (timesheet.getStatus() == TimesheetStatus.REJECTED) {
            timesheet.setStatus(TimesheetStatus.DRAFT);
        }

        LocalDate weekStart = timesheet.getWeekStart();
        LocalDate weekEnd = weekStart.plusDays(6);

        // Validate all entry dates are within the week
        for (TimesheetEntryRequest entryReq : request.getEntries()) {
            if (entryReq.getEntryDate().isBefore(weekStart) || entryReq.getEntryDate().isAfter(weekEnd)) {
                throw new BadRequestException("Entry date " + entryReq.getEntryDate() +
                        " is outside the timesheet week (" + weekStart + " to " + weekEnd + ")");
            }
        }

        // Clear existing entries and replace
        timesheet.getEntries().clear();

        for (TimesheetEntryRequest entryReq : request.getEntries()) {
            TimesheetEntry entry = TimesheetEntry.builder()
                    .timesheet(timesheet)
                    .entryDate(entryReq.getEntryDate())
                    .clockIn(entryReq.getClockIn())
                    .clockOut(entryReq.getClockOut())
                    .hours(entryReq.getHours())
                    .build();
            timesheet.getEntries().add(entry);
        }

        timesheet.recalculateTotalHours();
        Timesheet saved = timesheetRepository.save(timesheet);
        return toDto(saved);
    }

    @Override
    public TimesheetDto clockIn(UUID employeePublicId) {
        Employee employee = resolveEmployeeByPublicId(employeePublicId);

        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(DayOfWeek.MONDAY);

        // Get or create this week's timesheet
        Timesheet timesheet = timesheetRepository.findByEmployeeIdAndWeekStartWithDetails(
                employee.getId(), weekStart)
                .orElseGet(() -> {
                    Timesheet newTimesheet = Timesheet.builder()
                            .employee(employee)
                            .weekStart(weekStart)
                            .build();
                    return timesheetRepository.save(newTimesheet);
                });

        if (timesheet.getStatus() != TimesheetStatus.DRAFT && timesheet.getStatus() != TimesheetStatus.REJECTED) {
            throw new BadRequestException("Cannot clock in — this week's timesheet has already been " +
                    timesheet.getStatus().name().toLowerCase());
        }

        // Check if today already has an entry with clockIn
        entryRepository.findByTimesheetIdAndEntryDate(timesheet.getId(), today)
                .ifPresent(existing -> {
                    if (existing.getClockIn() != null) {
                        throw new BadRequestException("You have already clocked in today");
                    }
                });

        // Create or update today's entry
        TimesheetEntry entry = entryRepository.findByTimesheetIdAndEntryDate(timesheet.getId(), today)
                .orElse(TimesheetEntry.builder()
                        .timesheet(timesheet)
                        .entryDate(today)
                        .hours(BigDecimal.ZERO)
                        .build());

        entry.setClockIn(LocalTime.now());
        entryRepository.save(entry);

        // Reload with details
        Timesheet reloaded = timesheetRepository.findByPublicIdWithDetails(timesheet.getPublicId())
                .orElseThrow();
        reloaded.recalculateTotalHours();
        timesheetRepository.save(reloaded);

        return toDto(reloaded);
    }

    @Override
    public TimesheetDto clockOut(UUID employeePublicId) {
        Employee employee = resolveEmployeeByPublicId(employeePublicId);

        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(DayOfWeek.MONDAY);

        Timesheet timesheet = timesheetRepository.findByEmployeeIdAndWeekStartWithDetails(
                employee.getId(), weekStart)
                .orElseThrow(() -> new BadRequestException("No timesheet found for this week. Please clock in first."));

        TimesheetEntry entry = entryRepository.findByTimesheetIdAndEntryDate(timesheet.getId(), today)
                .orElseThrow(() -> new BadRequestException("No entry found for today. Please clock in first."));

        if (entry.getClockIn() == null) {
            throw new BadRequestException("You have not clocked in today");
        }

        if (entry.getClockOut() != null) {
            throw new BadRequestException("You have already clocked out today");
        }

        LocalTime clockOut = LocalTime.now();
        entry.setClockOut(clockOut);

        // Compute hours from duration
        Duration duration = Duration.between(entry.getClockIn(), clockOut);
        BigDecimal hours = BigDecimal.valueOf(duration.toMinutes())
                .divide(BigDecimal.valueOf(60), 1, RoundingMode.HALF_UP);
        entry.setHours(hours);
        entryRepository.save(entry);

        // Recalculate total
        Timesheet reloaded = timesheetRepository.findByPublicIdWithDetails(timesheet.getPublicId())
                .orElseThrow();
        reloaded.recalculateTotalHours();
        timesheetRepository.save(reloaded);

        return toDto(reloaded);
    }

    @Override
    public TimesheetDto submit(UUID timesheetPublicId, UUID employeePublicId) {
        Timesheet timesheet = timesheetRepository.findByPublicIdForUpdate(timesheetPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Timesheet", "publicId", timesheetPublicId));

        Employee employee = resolveEmployeeByPublicId(employeePublicId);

        if (!timesheet.getEmployee().getId().equals(employee.getId())) {
            throw new BadRequestException("You can only submit your own timesheets");
        }

        if (timesheet.getStatus() != TimesheetStatus.DRAFT && timesheet.getStatus() != TimesheetStatus.REJECTED) {
            throw new BadRequestException("Only DRAFT or REJECTED timesheets can be submitted");
        }

        validateWithinEditWindow(timesheet.getWeekStart());

        if (timesheet.getEntries().isEmpty()) {
            throw new BadRequestException("Cannot submit a timesheet with no entries");
        }

        timesheet.setStatus(TimesheetStatus.SUBMITTED);
        timesheet.setSubmittedAt(LocalDateTime.now());

        // Clear any previous review data if resubmitting after rejection
        timesheet.setReviewer(null);
        timesheet.setReviewNote(null);
        timesheet.setReviewedAt(null);

        Timesheet saved = timesheetRepository.save(timesheet);
        return toDto(saved);
    }

    @Override
    public TimesheetDto review(UUID timesheetPublicId, UUID reviewerPublicId, ReviewTimesheetRequest request) {
        Timesheet timesheet = timesheetRepository.findByPublicIdForUpdate(timesheetPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Timesheet", "publicId", timesheetPublicId));

        if (timesheet.getStatus() != TimesheetStatus.SUBMITTED) {
            throw new BadRequestException("Only submitted timesheets can be reviewed");
        }

        Employee reviewer = resolveEmployeeByPublicId(reviewerPublicId);

        if (timesheet.getEmployee().getId().equals(reviewer.getId())) {
            throw new BadRequestException("You cannot review your own timesheet");
        }

        TimesheetStatus decision;
        try {
            decision = TimesheetStatus.valueOf(request.getDecision());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Decision must be APPROVED or REJECTED");
        }

        if (decision != TimesheetStatus.APPROVED && decision != TimesheetStatus.REJECTED) {
            throw new BadRequestException("Decision must be APPROVED or REJECTED");
        }

        timesheet.setStatus(decision);
        timesheet.setReviewer(reviewer);
        timesheet.setReviewNote(request.getNote());
        timesheet.setReviewedAt(LocalDateTime.now());

        Timesheet saved = timesheetRepository.save(timesheet);
        return toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimesheetDto> getMyTimesheets(UUID employeePublicId) {
        Employee employee = resolveEmployeeByPublicId(employeePublicId);
        return timesheetRepository.findByEmployeeIdOrderByWeekStartDesc(employee.getId()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TimesheetDto getCurrentWeekTimesheet(UUID employeePublicId) {
        Employee employee = resolveEmployeeByPublicId(employeePublicId);
        LocalDate weekStart = LocalDate.now().with(DayOfWeek.MONDAY);

        return timesheetRepository.findByEmployeeIdAndWeekStartWithDetails(employee.getId(), weekStart)
                .map(this::toDto)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimesheetDto> getTeamTimesheets(UUID managerPublicId) {
        Employee manager = resolveEmployeeByPublicId(managerPublicId);
        return timesheetRepository.findByEmployeeReportsToId(manager.getId()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TimesheetDto> getAllTimesheets(Pageable pageable) {
        return timesheetRepository.findAllWithAssociations(pageable).map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public TimesheetDto getTimesheetById(UUID publicId, UUID callerPublicId, Set<String> callerPermissions) {
        Timesheet timesheet = timesheetRepository.findByPublicIdWithDetails(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Timesheet", "publicId", publicId));

        Employee caller = resolveEmployeeByPublicId(callerPublicId);

        boolean isOwner = timesheet.getEmployee().getId().equals(caller.getId());
        boolean isTeamManager = timesheet.getEmployee().getReportsTo() != null
                && timesheet.getEmployee().getReportsTo().getId().equals(caller.getId());
        boolean hasReadAll = callerPermissions.contains("TIMESHEET_READ_ALL");

        if (!isOwner && !isTeamManager && !hasReadAll) {
            throw new BadRequestException("You do not have permission to view this timesheet");
        }

        return toDto(timesheet);
    }

    // --- Private helpers ---

    private static final int MAX_EDIT_WEEKS_AGO = 2;

    private void validateWithinEditWindow(LocalDate weekStart) {
        LocalDate cutoff = LocalDate.now().with(DayOfWeek.MONDAY).minusWeeks(MAX_EDIT_WEEKS_AGO);
        if (weekStart.isBefore(cutoff)) {
            throw new BadRequestException("Cannot edit timesheets older than " + MAX_EDIT_WEEKS_AGO + " weeks");
        }
    }

    private Employee resolveEmployeeByPublicId(UUID publicId) {
        return employeeRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "publicId", publicId));
    }

    private TimesheetDto toDto(Timesheet timesheet) {
        List<TimesheetEntryDto> entryDtos = null;
        if (timesheet.getEntries() != null) {
            entryDtos = timesheet.getEntries().stream()
                    .map(this::toEntryDto)
                    .collect(Collectors.toList());
        }

        return TimesheetDto.builder()
                .id(timesheet.getPublicId().toString())
                .employeeId(timesheet.getEmployee().getPublicId().toString())
                .employeeName(timesheet.getEmployee().getFullName())
                .weekStart(timesheet.getWeekStart().toString())
                .status(timesheet.getStatus().name())
                .totalHours(timesheet.getTotalHours())
                .entries(entryDtos)
                .submittedAt(timesheet.getSubmittedAt())
                .reviewerName(timesheet.getReviewer() != null ? timesheet.getReviewer().getFullName() : null)
                .reviewNote(timesheet.getReviewNote())
                .reviewedAt(timesheet.getReviewedAt())
                .createdAt(timesheet.getCreatedAt())
                .build();
    }

    private TimesheetEntryDto toEntryDto(TimesheetEntry entry) {
        return TimesheetEntryDto.builder()
                .id(entry.getPublicId().toString())
                .entryDate(entry.getEntryDate().toString())
                .clockIn(entry.getClockIn() != null ? entry.getClockIn().toString() : null)
                .clockOut(entry.getClockOut() != null ? entry.getClockOut().toString() : null)
                .hours(entry.getHours())
                .build();
    }
}
