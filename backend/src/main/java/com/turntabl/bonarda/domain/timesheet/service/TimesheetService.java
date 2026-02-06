package com.turntabl.bonarda.domain.timesheet.service;

import com.turntabl.bonarda.domain.timesheet.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface TimesheetService {

    TimesheetDto getOrCreateTimesheet(UUID employeePublicId, CreateTimesheetRequest request);

    TimesheetDto updateEntries(UUID timesheetPublicId, UpdateTimesheetEntriesRequest request, UUID currentUserPublicId);

    TimesheetDto clockIn(UUID employeePublicId);

    TimesheetDto clockOut(UUID employeePublicId);

    TimesheetDto submit(UUID timesheetPublicId, UUID employeePublicId);

    TimesheetDto review(UUID timesheetPublicId, UUID reviewerPublicId, ReviewTimesheetRequest request);

    List<TimesheetDto> getMyTimesheets(UUID employeePublicId);

    TimesheetDto getCurrentWeekTimesheet(UUID employeePublicId);

    List<TimesheetDto> getTeamTimesheets(UUID managerPublicId);

    Page<TimesheetDto> getAllTimesheets(Pageable pageable);

    TimesheetDto getTimesheetById(UUID publicId, UUID callerPublicId, Set<String> callerPermissions);
}
