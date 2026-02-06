package com.turntabl.bonarda.domain.project.service;

import com.turntabl.bonarda.domain.project.dto.*;

import java.util.List;
import java.util.UUID;

public interface ProjectTimeLogService {
    ProjectTimeLogDto logTime(UUID employeePublicId, CreateTimeLogRequest request);
    ProjectTimeLogDto updateLog(UUID logPublicId, UUID employeePublicId, CreateTimeLogRequest request);
    void deleteLog(UUID logPublicId, UUID employeePublicId);
    List<ProjectTimeLogDto> getLogsForProject(UUID projectPublicId);
    List<ProjectTimeLogDto> getMyLogs(UUID employeePublicId);
}
