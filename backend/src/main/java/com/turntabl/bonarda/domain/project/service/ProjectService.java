package com.turntabl.bonarda.domain.project.service;

import com.turntabl.bonarda.domain.project.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ProjectService {
    ProjectDto create(CreateProjectRequest request);
    ProjectDto update(UUID publicId, UpdateProjectRequest request);
    ProjectDto getById(UUID publicId);
    Page<ProjectDto> getAll(Pageable pageable);
    List<ProjectDto> getMyProjects(UUID employeePublicId);
    ProjectAssignmentDto assignEmployee(UUID projectPublicId, AssignEmployeeRequest request);
    void removeAssignment(UUID projectPublicId, UUID assignmentPublicId);
    List<ProjectAssignmentDto> getAssignments(UUID projectPublicId);
    void delete(UUID publicId);
}
