package com.turntabl.bonarda.domain.project.service;

import com.turntabl.bonarda.domain.common.service.EntityResolutionService;
import com.turntabl.bonarda.domain.common.service.EnumParser;
import com.turntabl.bonarda.domain.employee.model.Employee;
import com.turntabl.bonarda.domain.project.dto.*;
import com.turntabl.bonarda.domain.project.model.*;
import com.turntabl.bonarda.domain.project.repository.ClientRepository;
import com.turntabl.bonarda.domain.project.repository.ProjectAssignmentRepository;
import com.turntabl.bonarda.domain.project.repository.ProjectRepository;
import com.turntabl.bonarda.domain.project.repository.ProjectTimeLogRepository;
import com.turntabl.bonarda.exception.BadRequestException;
import com.turntabl.bonarda.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;
    private final ProjectAssignmentRepository projectAssignmentRepository;
    private final ProjectTimeLogRepository projectTimeLogRepository;
    private final EntityResolutionService entityResolution;
    private final EnumParser enumParser;

    @Override
    public ProjectDto create(CreateProjectRequest request) {
        Client client = clientRepository.findByPublicId(request.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client", "publicId", request.getClientId()));

        Project project = Project.builder()
                .client(client)
                .name(request.getName())
                .description(request.getDescription())
                .budget(request.getBudget())
                .build();

        if (request.getStartDate() != null) {
            project.setStartDate(LocalDate.parse(request.getStartDate()));
        }
        if (request.getEndDate() != null) {
            project.setEndDate(LocalDate.parse(request.getEndDate()));
        }

        Project saved = projectRepository.save(project);
        return toDto(saved);
    }

    @Override
    public ProjectDto update(UUID publicId, UpdateProjectRequest request) {
        Project project = projectRepository.findByPublicIdForUpdate(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "publicId", publicId));

        if (request.getName() != null) {
            project.setName(request.getName());
        }
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }
        if (request.getBudget() != null) {
            project.setBudget(request.getBudget());
        }
        if (request.getStartDate() != null) {
            project.setStartDate(LocalDate.parse(request.getStartDate()));
        }
        if (request.getEndDate() != null) {
            project.setEndDate(LocalDate.parse(request.getEndDate()));
        }
        if (request.getStatus() != null) {
            project.setStatus(enumParser.parse(ProjectStatus.class, request.getStatus(), "project status"));
        }
        if (request.getClientId() != null) {
            Client client = clientRepository.findByPublicId(request.getClientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Client", "publicId", request.getClientId()));
            project.setClient(client);
        }

        Project saved = projectRepository.save(project);
        return toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectDto getById(UUID publicId) {
        Project project = projectRepository.findByPublicIdWithDetails(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "publicId", publicId));

        BigDecimal totalHours = projectTimeLogRepository.getTotalHoursForProject(project.getId());

        List<ProjectAssignment> assignments = projectAssignmentRepository.findByProjectIdWithEmployee(project.getId());

        List<ProjectAssignmentDto> assignmentDtos = assignments.stream()
                .map(a -> toAssignmentDto(a, project.getId()))
                .collect(Collectors.toList());

        return ProjectDto.builder()
                .id(project.getPublicId().toString())
                .clientId(project.getClient().getPublicId().toString())
                .clientName(project.getClient().getName())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus().name())
                .startDate(project.getStartDate() != null ? project.getStartDate().toString() : null)
                .endDate(project.getEndDate() != null ? project.getEndDate().toString() : null)
                .budget(project.getBudget())
                .memberCount(assignments.size())
                .totalHours(totalHours)
                .assignments(assignmentDtos)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProjectDto> getAll(Pageable pageable) {
        return projectRepository.findAllWithClient(pageable).map(this::toListDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectDto> getMyProjects(UUID employeePublicId) {
        Employee employee = entityResolution.resolveEmployee(employeePublicId);
        return projectRepository.findByAssignedEmployeeId(employee.getId()).stream()
                .map(this::toListDto)
                .collect(Collectors.toList());
    }

    @Override
    public ProjectAssignmentDto assignEmployee(UUID projectPublicId, AssignEmployeeRequest request) {
        Project project = projectRepository.findByPublicId(projectPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "publicId", projectPublicId));

        Employee employee = entityResolution.resolveEmployee(request.getEmployeeId());

        if (projectAssignmentRepository.existsByProjectIdAndEmployeeId(project.getId(), employee.getId())) {
            throw new BadRequestException("Employee is already assigned to this project");
        }

        ProjectAssignmentRole role = request.getRole() != null
                ? enumParser.parse(ProjectAssignmentRole.class, request.getRole(), "assignment role")
                : ProjectAssignmentRole.MEMBER;

        ProjectAssignment assignment = ProjectAssignment.builder()
                .project(project)
                .employee(employee)
                .role(role)
                .build();

        ProjectAssignment saved = projectAssignmentRepository.save(assignment);
        return toAssignmentDto(saved, project.getId());
    }

    @Override
    public void removeAssignment(UUID projectPublicId, UUID assignmentPublicId) {
        Project project = projectRepository.findByPublicId(projectPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "publicId", projectPublicId));

        ProjectAssignment assignment = projectAssignmentRepository.findByPublicId(assignmentPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("ProjectAssignment", "publicId", assignmentPublicId));

        if (!assignment.getProject().getId().equals(project.getId())) {
            throw new BadRequestException("Assignment does not belong to this project");
        }

        projectAssignmentRepository.delete(assignment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectAssignmentDto> getAssignments(UUID projectPublicId) {
        Project project = projectRepository.findByPublicId(projectPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "publicId", projectPublicId));

        return projectAssignmentRepository.findByProjectIdWithEmployee(project.getId()).stream()
                .map(a -> toAssignmentDto(a, project.getId()))
                .collect(Collectors.toList());
    }

    @Override
    public void delete(UUID publicId) {
        Project project = projectRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "publicId", publicId));
        projectRepository.delete(project);
    }

    // --- Private helpers ---

    private ProjectDto toDto(Project project) {
        BigDecimal totalHours = projectTimeLogRepository.getTotalHoursForProject(project.getId());

        List<ProjectAssignment> assignments = projectAssignmentRepository.findByProjectIdWithEmployee(project.getId());

        List<ProjectAssignmentDto> assignmentDtos = assignments.stream()
                .map(a -> toAssignmentDto(a, project.getId()))
                .collect(Collectors.toList());

        return ProjectDto.builder()
                .id(project.getPublicId().toString())
                .clientId(project.getClient().getPublicId().toString())
                .clientName(project.getClient().getName())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus().name())
                .startDate(project.getStartDate() != null ? project.getStartDate().toString() : null)
                .endDate(project.getEndDate() != null ? project.getEndDate().toString() : null)
                .budget(project.getBudget())
                .memberCount(assignments.size())
                .totalHours(totalHours)
                .assignments(assignmentDtos)
                .build();
    }

    private ProjectDto toListDto(Project project) {
        return ProjectDto.builder()
                .id(project.getPublicId().toString())
                .clientId(project.getClient().getPublicId().toString())
                .clientName(project.getClient().getName())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus().name())
                .startDate(project.getStartDate() != null ? project.getStartDate().toString() : null)
                .endDate(project.getEndDate() != null ? project.getEndDate().toString() : null)
                .budget(project.getBudget())
                .memberCount(project.getAssignments() != null ? project.getAssignments().size() : 0)
                .totalHours(null)
                .assignments(null)
                .build();
    }

    private ProjectAssignmentDto toAssignmentDto(ProjectAssignment assignment, Long projectId) {
        BigDecimal hoursLogged = projectTimeLogRepository.getTotalHoursForProjectByEmployee(
                projectId, assignment.getEmployee().getId());

        return ProjectAssignmentDto.builder()
                .id(assignment.getPublicId().toString())
                .employeeId(assignment.getEmployee().getPublicId().toString())
                .employeeName(assignment.getEmployee().getFullName())
                .employeePosition(assignment.getEmployee().getPosition())
                .role(assignment.getRole().name())
                .assignedAt(assignment.getAssignedAt() != null ? assignment.getAssignedAt().toString() : null)
                .hoursLogged(hoursLogged)
                .build();
    }
}
