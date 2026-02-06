package com.turntabl.bonarda.domain.timeoff.service;

import com.turntabl.bonarda.domain.common.service.EntityResolutionService;
import com.turntabl.bonarda.domain.employee.model.Employee;
import com.turntabl.bonarda.domain.timeoff.dto.AdjustBalanceRequest;
import com.turntabl.bonarda.domain.timeoff.dto.TimeOffBalanceDto;
import com.turntabl.bonarda.domain.timeoff.model.TimeOffBalance;
import com.turntabl.bonarda.domain.timeoff.model.TimeOffType;
import com.turntabl.bonarda.domain.timeoff.repository.TimeOffBalanceRepository;
import com.turntabl.bonarda.domain.timeoff.repository.TimeOffTypeRepository;
import com.turntabl.bonarda.exception.BadRequestException;
import com.turntabl.bonarda.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class TimeOffBalanceServiceImpl implements TimeOffBalanceService {

    private final TimeOffBalanceRepository balanceRepository;
    private final TimeOffTypeRepository typeRepository;
    private final EntityResolutionService entityResolution;

    @Override
    @Transactional(readOnly = true)
    public List<TimeOffBalanceDto> getBalancesForEmployee(UUID employeePublicId, Integer year) {
        Employee employee = entityResolution.resolveEmployee(employeePublicId);
        return balanceRepository.findByEmployeeIdAndYearWithType(employee.getId(), year).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public TimeOffBalanceDto adjustBalance(UUID employeePublicId, UUID typePublicId,
                                           Integer year, AdjustBalanceRequest request) {
        Employee employee = entityResolution.resolveEmployee(employeePublicId);
        TimeOffType type = resolveTypeByPublicId(typePublicId);

        TimeOffBalance balance = balanceRepository
                .findByEmployeeIdAndTimeOffTypeIdAndYear(employee.getId(), type.getId(), year)
                .orElseGet(() -> TimeOffBalance.builder()
                        .employee(employee)
                        .timeOffType(type)
                        .year(year)
                        .build());

        BigDecimal newTotal = balance.getTotalAllocated().add(request.getAdjustment());
        if (newTotal.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Adjustment would result in negative total allocation");
        }
        balance.setTotalAllocated(newTotal);
        TimeOffBalance saved = balanceRepository.save(balance);
        return toDto(saved);
    }

    @Override
    public void initializeBalancesForEmployee(Employee employee, Integer year) {
        List<TimeOffType> activeTypes = typeRepository.findByIsActiveTrue();
        for (TimeOffType type : activeTypes) {
            boolean exists = balanceRepository
                    .findByEmployeeIdAndTimeOffTypeIdAndYear(employee.getId(), type.getId(), year)
                    .isPresent();
            if (!exists) {
                balanceRepository.save(TimeOffBalance.builder()
                        .employee(employee)
                        .timeOffType(type)
                        .year(year)
                        .totalAllocated(BigDecimal.valueOf(type.getDefaultDaysPerYear()))
                        .build());
            }
        }
    }

    @Override
    public void updatePending(Long employeeId, Long typeId, Integer year, BigDecimal delta) {
        TimeOffBalance balance = balanceRepository
                .findByEmployeeIdAndTimeOffTypeIdAndYearForUpdate(employeeId, typeId, year)
                .orElseThrow(() -> new ResourceNotFoundException("TimeOffBalance", "employee/type/year",
                        employeeId + "/" + typeId + "/" + year));
        BigDecimal newPending = balance.getPending().add(delta);
        if (newPending.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Pending balance cannot be negative");
        }
        // When incrementing pending, verify sufficient remaining balance (skip for unlimited types)
        if (delta.compareTo(BigDecimal.ZERO) > 0 && !Boolean.TRUE.equals(balance.getTimeOffType().getIsUnlimited())) {
            BigDecimal remaining = balance.getTotalAllocated().add(balance.getCarryOver())
                    .subtract(balance.getUsed()).subtract(newPending);
            if (remaining.compareTo(BigDecimal.ZERO) < 0) {
                throw new BadRequestException("Insufficient balance");
            }
        }
        balance.setPending(newPending);
        balanceRepository.save(balance);
    }

    @Override
    public void updateUsed(Long employeeId, Long typeId, Integer year, BigDecimal delta) {
        TimeOffBalance balance = balanceRepository
                .findByEmployeeIdAndTimeOffTypeIdAndYearForUpdate(employeeId, typeId, year)
                .orElseThrow(() -> new ResourceNotFoundException("TimeOffBalance", "employee/type/year",
                        employeeId + "/" + typeId + "/" + year));
        BigDecimal newUsed = balance.getUsed().add(delta);
        if (newUsed.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Used balance cannot be negative");
        }
        balance.setUsed(newUsed);
        balanceRepository.save(balance);
    }

    private TimeOffType resolveTypeByPublicId(UUID publicId) {
        return typeRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("TimeOffType", "publicId", publicId));
    }

    private TimeOffBalanceDto toDto(TimeOffBalance balance) {
        return TimeOffBalanceDto.builder()
                .id(balance.getPublicId().toString())
                .employeeId(balance.getEmployee().getPublicId().toString())
                .timeOffTypeId(balance.getTimeOffType().getPublicId().toString())
                .timeOffTypeName(balance.getTimeOffType().getName())
                .year(balance.getYear())
                .totalAllocated(balance.getTotalAllocated())
                .used(balance.getUsed())
                .pending(balance.getPending())
                .carryOver(balance.getCarryOver())
                .remaining(balance.getRemaining())
                .isUnlimited(balance.getTimeOffType().getIsUnlimited())
                .build();
    }
}
