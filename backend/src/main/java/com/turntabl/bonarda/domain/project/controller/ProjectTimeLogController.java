package com.turntabl.bonarda.domain.project.controller;

import com.turntabl.bonarda.domain.project.dto.*;
import com.turntabl.bonarda.domain.project.service.ProjectTimeLogService;
import com.turntabl.bonarda.security.CurrentUser;
import com.turntabl.bonarda.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/project-time-logs")
@RequiredArgsConstructor
public class ProjectTimeLogController {

    private final ProjectTimeLogService timeLogService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectTimeLogDto> logTime(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody CreateTimeLogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(timeLogService.logTime(currentUser.getPublicId(), request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectTimeLogDto> updateLog(
            @PathVariable UUID id,
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody CreateTimeLogRequest request) {
        return ResponseEntity.ok(timeLogService.updateLog(id, currentUser.getPublicId(), request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteLog(
            @PathVariable UUID id,
            @CurrentUser UserPrincipal currentUser) {
        timeLogService.deleteLog(id, currentUser.getPublicId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ProjectTimeLogDto>> getMyLogs(@CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(timeLogService.getMyLogs(currentUser.getPublicId()));
    }

    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasAuthority('PROJECT_READ')")
    public ResponseEntity<List<ProjectTimeLogDto>> getProjectLogs(@PathVariable UUID projectId) {
        return ResponseEntity.ok(timeLogService.getLogsForProject(projectId));
    }
}
