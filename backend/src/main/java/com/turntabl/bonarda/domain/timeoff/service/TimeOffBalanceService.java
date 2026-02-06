package com.turntabl.bonarda.domain.timeoff.service;

import com.turntabl.bonarda.domain.employee.model.Employee;
import com.turntabl.bonarda.domain.timeoff.dto.AdjustBalanceRequest;
import com.turntabl.bonarda.domain.timeoff.dto.TimeOffBalanceDto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface TimeOffBalanceService {

    List<TimeOffBalanceDto> getBalancesForEmployee(UUID employeePublicId, Integer year);

    TimeOffBalanceDto adjustBalance(UUID employeePublicId, UUID typePublicId,
                                    Integer year, AdjustBalanceRequest request);

    void initializeBalancesForEmployee(Employee employee, Integer year);

    void updatePending(Long employeeId, Long typeId, Integer year, BigDecimal delta);

    void updateUsed(Long employeeId, Long typeId, Integer year, BigDecimal delta);
}
