package com.turntabl.bonarda.domain.project.controller;

import com.turntabl.bonarda.domain.project.dto.*;
import com.turntabl.bonarda.domain.project.service.ProjectService;
import com.turntabl.bonarda.security.CurrentUser;
import com.turntabl.bonarda.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    @PreAuthorize("hasAuthority('PROJECT_READ')")
    public ResponseEntity<Page<ProjectDto>> getAll(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(projectService.getAll(pageable));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ProjectDto>> getMyProjects(@CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(projectService.getMyProjects(currentUser.getPublicId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PROJECT_READ')")
    public ResponseEntity<ProjectDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(projectService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PROJECT_CREATE')")
    public ResponseEntity<ProjectDto> create(@Valid @RequestBody CreateProjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PROJECT_UPDATE')")
    public ResponseEntity<ProjectDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProjectRequest request) {
        return ResponseEntity.ok(projectService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PROJECT_DELETE')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        projectService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/assignments")
    @PreAuthorize("hasAuthority('PROJECT_READ')")
    public ResponseEntity<List<ProjectAssignmentDto>> getAssignments(@PathVariable UUID id) {
        return ResponseEntity.ok(projectService.getAssignments(id));
    }

    @PostMapping("/{id}/assignments")
    @PreAuthorize("hasAuthority('PROJECT_ASSIGN')")
    public ResponseEntity<ProjectAssignmentDto> assignEmployee(
            @PathVariable UUID id,
            @Valid @RequestBody AssignEmployeeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.assignEmployee(id, request));
    }

    @DeleteMapping("/{id}/assignments/{assignmentId}")
    @PreAuthorize("hasAuthority('PROJECT_ASSIGN')")
    public ResponseEntity<Void> removeAssignment(
            @PathVariable UUID id,
            @PathVariable UUID assignmentId) {
        projectService.removeAssignment(id, assignmentId);
        return ResponseEntity.noContent().build();
    }
}
