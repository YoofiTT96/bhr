package com.turntabl.bonarda.domain.timeoff.service;

import com.turntabl.bonarda.domain.common.service.EntityResolutionService;
import com.turntabl.bonarda.domain.common.service.EnumParser;
import com.turntabl.bonarda.domain.employee.model.Employee;
import com.turntabl.bonarda.domain.timeoff.dto.CreateTimeOffRequestDto;
import com.turntabl.bonarda.domain.timeoff.dto.ReviewTimeOffRequestDto;
import com.turntabl.bonarda.domain.timeoff.dto.TimeOffRequestDto;
import com.turntabl.bonarda.domain.timeoff.model.*;
import com.turntabl.bonarda.domain.timeoff.repository.TimeOffRequestRepository;
import com.turntabl.bonarda.domain.timeoff.repository.TimeOffTypeRepository;
import com.turntabl.bonarda.exception.BadRequestException;
import com.turntabl.bonarda.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class TimeOffRequestServiceImpl implements TimeOffRequestService {

    private final TimeOffRequestRepository requestRepository;
    private final TimeOffTypeRepository typeRepository;
    private final TimeOffBalanceService balanceService;
    private final CalendarService calendarService;
    private final EntityResolutionService entityResolution;
    private final EnumParser enumParser;

    @Override
    public TimeOffRequestDto create(UUID employeePublicId, CreateTimeOffRequestDto request) {
        Employee employee = entityResolution.resolveEmployee(employeePublicId);
        TimeOffType type = resolveTypeByPublicId(UUID.fromString(request.getTimeOffTypeId()));

        // Validate dates
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date must be on or after start date");
        }

        // Validate half-day
        Boolean halfDay = request.getHalfDay() != null && request.getHalfDay();
        HalfDayPeriod halfDayPeriod = null;
        if (halfDay) {
            if (!request.getStartDate().equals(request.getEndDate())) {
                throw new BadRequestException("Half day requests must be for a single day");
            }
            if (request.getHalfDayPeriod() == null) {
                throw new BadRequestException("Half day period (MORNING or AFTERNOON) is required for half-day requests");
            }
            halfDayPeriod = enumParser.parse(HalfDayPeriod.class, request.getHalfDayPeriod(), "halfDayPeriod");
        }

        // Calculate business days
        BigDecimal businessDays = calculateBusinessDays(request.getStartDate(), request.getEndDate(), halfDay);
        if (businessDays.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Request must include at least one business day");
        }

        // Check for overlapping requests
        List<TimeOffRequest> overlapping = requestRepository.findOverlappingRequests(
                employee.getId(), request.getStartDate(), request.getEndDate(),
                List.of(TimeOffRequestStatus.PENDING, TimeOffRequestStatus.APPROVED));

        // Allow MORNING + AFTERNOON half-day requests on the same day
        if (halfDay && !overlapping.isEmpty()) {
            final HalfDayPeriod period = halfDayPeriod;
            overlapping = overlapping.stream()
                    .filter(existing -> !(existing.getHalfDay()
                            && existing.getStartDate().equals(request.getStartDate())
                            && existing.getHalfDayPeriod() != period))
                    .collect(Collectors.toList());
        }

        if (!overlapping.isEmpty()) {
            throw new BadRequestException("You already have a pending or approved request overlapping these dates");
        }

        // Check balance (skip for unlimited types like Sick Leave)
        int year = request.getStartDate().getYear();
        if (!Boolean.TRUE.equals(type.getIsUnlimited())) {
            var balances = balanceService.getBalancesForEmployee(employeePublicId, year);
            var typeBalance = balances.stream()
                    .filter(b -> b.getTimeOffTypeId().equals(type.getPublicId().toString()))
                    .findFirst()
                    .orElseThrow(() -> new BadRequestException(
                            "No balance record found for " + type.getName() + " in " + year));
            if (typeBalance.getRemaining().compareTo(businessDays) < 0) {
                throw new BadRequestException("Insufficient balance. You have " +
                        typeBalance.getRemaining() + " days remaining but requested " + businessDays);
            }
        }

        // Save request
        TimeOffRequest timeOffRequest = TimeOffRequest.builder()
                .employee(employee)
                .timeOffType(type)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .halfDay(halfDay)
                .halfDayPeriod(halfDayPeriod)
                .businessDays(businessDays)
                .reason(request.getReason())
                .status(TimeOffRequestStatus.PENDING)
                .build();

        TimeOffRequest saved = requestRepository.save(timeOffRequest);

        // Update pending balance
        balanceService.updatePending(employee.getId(), type.getId(), year, businessDays);

        return toDto(saved);
    }

    @Override
    public TimeOffRequestDto review(UUID requestPublicId, UUID reviewerPublicId, ReviewTimeOffRequestDto request) {
        TimeOffRequest timeOffRequest = requestRepository.findByPublicIdForUpdate(requestPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("TimeOffRequest", "publicId", requestPublicId));

        if (timeOffRequest.getStatus() != TimeOffRequestStatus.PENDING) {
            throw new BadRequestException("Only pending requests can be reviewed");
        }

        Employee reviewer = entityResolution.resolveEmployee(reviewerPublicId);

        if (timeOffRequest.getEmployee().getId().equals(reviewer.getId())) {
            throw new BadRequestException("You cannot review your own time off request");
        }
        TimeOffRequestStatus decision = enumParser.parse(TimeOffRequestStatus.class, request.getDecision(), "decision");

        int year = timeOffRequest.getStartDate().getYear();
        Long employeeId = timeOffRequest.getEmployee().getId();
        Long typeId = timeOffRequest.getTimeOffType().getId();
        BigDecimal days = timeOffRequest.getBusinessDays();

        if (decision == TimeOffRequestStatus.APPROVED) {
            balanceService.updatePending(employeeId, typeId, year, days.negate());
            balanceService.updateUsed(employeeId, typeId, year, days);
        } else {
            balanceService.updatePending(employeeId, typeId, year, days.negate());
        }

        timeOffRequest.setStatus(decision);
        timeOffRequest.setReviewer(reviewer);
        timeOffRequest.setReviewNote(request.getNote());
        timeOffRequest.setReviewedAt(LocalDateTime.now());

        TimeOffRequest updated = requestRepository.save(timeOffRequest);

        // Calendar sync: create event on approval (best-effort)
        if (decision == TimeOffRequestStatus.APPROVED) {
            String eventId = calendarService.createEvent(updated);
            if (eventId != null) {
                updated.setCalendarEventId(eventId);
                requestRepository.save(updated);
            }
        }

        return toDto(updated);
    }

    @Override
    public TimeOffRequestDto cancel(UUID requestPublicId, UUID employeePublicId) {
        TimeOffRequest timeOffRequest = resolveRequestByPublicId(requestPublicId);
        Employee employee = entityResolution.resolveEmployee(employeePublicId);

        if (!timeOffRequest.getEmployee().getId().equals(employee.getId())) {
            throw new BadRequestException("You can only cancel your own requests");
        }

        TimeOffRequestStatus currentStatus = timeOffRequest.getStatus();
        if (currentStatus != TimeOffRequestStatus.PENDING && currentStatus != TimeOffRequestStatus.APPROVED) {
            throw new BadRequestException("Only pending or approved requests can be cancelled");
        }

        int year = timeOffRequest.getStartDate().getYear();
        Long employeeId = employee.getId();
        Long typeId = timeOffRequest.getTimeOffType().getId();
        BigDecimal days = timeOffRequest.getBusinessDays();

        if (currentStatus == TimeOffRequestStatus.PENDING) {
            // Reverse pending balance
            balanceService.updatePending(employeeId, typeId, year, days.negate());
        } else {
            // APPROVED: reverse used balance + delete calendar event
            balanceService.updateUsed(employeeId, typeId, year, days.negate());
            calendarService.deleteEvent(timeOffRequest);
        }

        timeOffRequest.setStatus(TimeOffRequestStatus.CANCELLED);
        timeOffRequest.setCalendarEventId(null);
        TimeOffRequest updated = requestRepository.save(timeOffRequest);
        return toDto(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public TimeOffRequestDto getById(UUID publicId, UUID callerPublicId, Set<String> callerPermissions) {
        TimeOffRequest timeOffRequest = resolveRequestByPublicId(publicId);
        Employee caller = entityResolution.resolveEmployee(callerPublicId);

        boolean isOwner = timeOffRequest.getEmployee().getId().equals(caller.getId());
        boolean isTeamManager = timeOffRequest.getEmployee().getReportsTo() != null
                && timeOffRequest.getEmployee().getReportsTo().getId().equals(caller.getId());
        boolean hasReadAll = callerPermissions.contains("TIME_OFF_REQUEST_READ_ALL");

        if (!isOwner && !isTeamManager && !hasReadAll) {
            throw new BadRequestException("You do not have permission to view this request");
        }

        return toDto(timeOffRequest);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimeOffRequestDto> getMyRequests(UUID employeePublicId) {
        Employee employee = entityResolution.resolveEmployee(employeePublicId);
        return requestRepository.findByEmployeeIdOrderByCreatedAtDesc(employee.getId()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimeOffRequestDto> getTeamRequests(UUID managerPublicId) {
        Employee manager = entityResolution.resolveEmployee(managerPublicId);
        return requestRepository.findByEmployeeReportsToId(manager.getId()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TimeOffRequestDto> getAllRequests(Pageable pageable) {
        return requestRepository.findAllWithAssociations(pageable).map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimeOffRequestDto> getApprovedRequestsForDateRange(LocalDate startDate, LocalDate endDate) {
        return requestRepository.findApprovedRequestsOverlappingDateRange(startDate, endDate).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // --- Private helpers ---

    private BigDecimal calculateBusinessDays(LocalDate start, LocalDate end, boolean halfDay) {
        if (halfDay) {
            return new BigDecimal("0.5");
        }
        long days = 0;
        LocalDate current = start;
        while (!current.isAfter(end)) {
            DayOfWeek dow = current.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                days++;
            }
            current = current.plusDays(1);
        }
        return BigDecimal.valueOf(days);
    }

    private TimeOffType resolveTypeByPublicId(UUID publicId) {
        return typeRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("TimeOffType", "publicId", publicId));
    }

    private TimeOffRequest resolveRequestByPublicId(UUID publicId) {
        return requestRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("TimeOffRequest", "publicId", publicId));
    }

    private TimeOffRequestDto toDto(TimeOffRequest request) {
        return TimeOffRequestDto.builder()
                .id(request.getPublicId().toString())
                .employeeId(request.getEmployee().getPublicId().toString())
                .employeeName(request.getEmployee().getFullName())
                .timeOffTypeId(request.getTimeOffType().getPublicId().toString())
                .timeOffTypeName(request.getTimeOffType().getName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .halfDay(request.getHalfDay())
                .halfDayPeriod(request.getHalfDayPeriod() != null ? request.getHalfDayPeriod().name() : null)
                .businessDays(request.getBusinessDays())
                .reason(request.getReason())
                .status(request.getStatus().name())
                .reviewerId(request.getReviewer() != null ? request.getReviewer().getPublicId().toString() : null)
                .reviewerName(request.getReviewer() != null ? request.getReviewer().getFullName() : null)
                .reviewNote(request.getReviewNote())
                .reviewedAt(request.getReviewedAt())
                .createdAt(request.getCreatedAt())
                .calendarEventId(request.getCalendarEventId())
                .calendarSynced(request.getCalendarEventId() != null)
                .build();
    }
}
