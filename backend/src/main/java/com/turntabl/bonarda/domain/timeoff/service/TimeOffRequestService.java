package com.turntabl.bonarda.domain.timeoff.service;

import com.turntabl.bonarda.domain.timeoff.dto.CreateTimeOffRequestDto;
import com.turntabl.bonarda.domain.timeoff.dto.ReviewTimeOffRequestDto;
import com.turntabl.bonarda.domain.timeoff.dto.TimeOffRequestDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface TimeOffRequestService {

    TimeOffRequestDto create(UUID employeePublicId, CreateTimeOffRequestDto request);

    TimeOffRequestDto review(UUID requestPublicId, UUID reviewerPublicId, ReviewTimeOffRequestDto request);

    TimeOffRequestDto cancel(UUID requestPublicId, UUID employeePublicId);

    TimeOffRequestDto getById(UUID publicId, UUID callerPublicId, Set<String> callerPermissions);

    List<TimeOffRequestDto> getMyRequests(UUID employeePublicId);

    List<TimeOffRequestDto> getTeamRequests(UUID managerPublicId);

    Page<TimeOffRequestDto> getAllRequests(Pageable pageable);

    List<TimeOffRequestDto> getApprovedRequestsForDateRange(LocalDate startDate, LocalDate endDate);

    TimeOffRequestDto uploadAttachment(UUID requestPublicId, UUID employeePublicId, MultipartFile file);

    Path getAttachmentPath(UUID requestPublicId, UUID callerPublicId, Set<String> callerPermissions);

    void deleteAttachment(UUID requestPublicId, UUID employeePublicId);
}
