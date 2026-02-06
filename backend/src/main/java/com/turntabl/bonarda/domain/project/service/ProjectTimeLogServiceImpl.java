package com.turntabl.bonarda.domain.project.service;

import com.turntabl.bonarda.domain.employee.model.Employee;
import com.turntabl.bonarda.domain.employee.repository.EmployeeRepository;
import com.turntabl.bonarda.domain.project.dto.*;
import com.turntabl.bonarda.domain.project.model.Project;
import com.turntabl.bonarda.domain.project.model.ProjectTimeLog;
import com.turntabl.bonarda.domain.project.repository.ProjectAssignmentRepository;
import com.turntabl.bonarda.domain.project.repository.ProjectRepository;
import com.turntabl.bonarda.domain.project.repository.ProjectTimeLogRepository;
import com.turntabl.bonarda.exception.BadRequestException;
import com.turntabl.bonarda.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ProjectTimeLogServiceImpl implements ProjectTimeLogService {

    private final ProjectTimeLogRepository projectTimeLogRepository;
    private final ProjectRepository projectRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectAssignmentRepository projectAssignmentRepository;

    @Override
    public ProjectTimeLogDto logTime(UUID employeePublicId, CreateTimeLogRequest request) {
        Employee employee = resolveEmployeeByPublicId(employeePublicId);

        Project project = projectRepository.findByPublicId(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", "publicId", request.getProjectId()));

        if (!projectAssignmentRepository.existsByProjectIdAndEmployeeId(project.getId(), employee.getId())) {
            throw new BadRequestException("Employee is not assigned to this project");
        }

        projectTimeLogRepository.findByProjectIdAndEmployeeIdAndLogDate(
                project.getId(), employee.getId(), request.getLogDate())
                .ifPresent(existing -> {
                    throw new BadRequestException("A time log already exists for this project on " + request.getLogDate());
                });

        ProjectTimeLog log = ProjectTimeLog.builder()
                .project(project)
                .employee(employee)
                .logDate(request.getLogDate())
                .hours(request.getHours())
                .description(request.getDescription())
                .build();

        ProjectTimeLog saved = projectTimeLogRepository.save(log);
        return toDto(saved);
    }

    @Override
    public ProjectTimeLogDto updateLog(UUID logPublicId, UUID employeePublicId, CreateTimeLogRequest request) {
        ProjectTimeLog log = projectTimeLogRepository.findByPublicId(logPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("ProjectTimeLog", "publicId", logPublicId));

        Employee employee = resolveEmployeeByPublicId(employeePublicId);

        if (!log.getEmployee().getId().equals(employee.getId())) {
            throw new BadRequestException("You can only update your own time logs");
        }

        if (request.getLogDate() != null) {
            log.setLogDate(request.getLogDate());
        }
        if (request.getHours() != null) {
            log.setHours(request.getHours());
        }
        if (request.getDescription() != null) {
            log.setDescription(request.getDescription());
        }

        ProjectTimeLog saved = projectTimeLogRepository.save(log);
        return toDto(saved);
    }

    @Override
    public void deleteLog(UUID logPublicId, UUID employeePublicId) {
        ProjectTimeLog log = projectTimeLogRepository.findByPublicId(logPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("ProjectTimeLog", "publicId", logPublicId));

        Employee employee = resolveEmployeeByPublicId(employeePublicId);

        if (!log.getEmployee().getId().equals(employee.getId())) {
            throw new BadRequestException("You can only delete your own time logs");
        }

        projectTimeLogRepository.delete(log);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectTimeLogDto> getLogsForProject(UUID projectPublicId) {
        Project project = projectRepository.findByPublicId(projectPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "publicId", projectPublicId));

        return projectTimeLogRepository.findByProjectIdWithEmployee(project.getId()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectTimeLogDto> getMyLogs(UUID employeePublicId) {
        Employee employee = resolveEmployeeByPublicId(employeePublicId);

        return projectTimeLogRepository.findByEmployeeIdWithProject(employee.getId()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // --- Private helpers ---

    private Employee resolveEmployeeByPublicId(UUID publicId) {
        return employeeRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "publicId", publicId));
    }

    private ProjectTimeLogDto toDto(ProjectTimeLog log) {
        return ProjectTimeLogDto.builder()
                .id(log.getPublicId().toString())
                .projectId(log.getProject().getPublicId().toString())
                .projectName(log.getProject().getName())
                .employeeId(log.getEmployee().getPublicId().toString())
                .employeeName(log.getEmployee().getFullName())
                .logDate(log.getLogDate().toString())
                .hours(log.getHours())
                .description(log.getDescription())
                .build();
    }
}
