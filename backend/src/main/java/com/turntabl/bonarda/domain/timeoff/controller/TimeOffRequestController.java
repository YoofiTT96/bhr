package com.turntabl.bonarda.domain.timeoff.controller;

import com.turntabl.bonarda.domain.timeoff.dto.CreateTimeOffRequestDto;
import com.turntabl.bonarda.domain.timeoff.dto.ReviewTimeOffRequestDto;
import com.turntabl.bonarda.domain.timeoff.dto.TimeOffRequestDto;
import com.turntabl.bonarda.domain.timeoff.service.TimeOffRequestService;
import com.turntabl.bonarda.security.CurrentUser;
import com.turntabl.bonarda.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/time-off-requests")
@RequiredArgsConstructor
public class TimeOffRequestController {

    private final TimeOffRequestService requestService;

    @PostMapping
    @PreAuthorize("hasAuthority('TIME_OFF_REQUEST_CREATE')")
    public ResponseEntity<TimeOffRequestDto> createRequest(
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody CreateTimeOffRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(requestService.create(currentUser.getPublicId(), request));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('TIME_OFF_REQUEST_READ_OWN')")
    public ResponseEntity<List<TimeOffRequestDto>> getMyRequests(
            @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(requestService.getMyRequests(currentUser.getPublicId()));
    }

    @GetMapping("/team")
    @PreAuthorize("hasAuthority('TIME_OFF_REQUEST_READ_TEAM')")
    public ResponseEntity<List<TimeOffRequestDto>> getTeamRequests(
            @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(requestService.getTeamRequests(currentUser.getPublicId()));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('TIME_OFF_REQUEST_READ_ALL')")
    public ResponseEntity<Page<TimeOffRequestDto>> getAllRequests(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(requestService.getAllRequests(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('TIME_OFF_REQUEST_READ_OWN', 'TIME_OFF_REQUEST_READ_TEAM', 'TIME_OFF_REQUEST_READ_ALL')")
    public ResponseEntity<TimeOffRequestDto> getRequest(
            @PathVariable UUID id,
            @CurrentUser UserPrincipal currentUser) {
        var permissions = currentUser.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .collect(Collectors.toSet());
        return ResponseEntity.ok(requestService.getById(id,
                currentUser.getPublicId(), permissions));
    }

    @PutMapping("/{id}/review")
    @PreAuthorize("hasAuthority('TIME_OFF_REQUEST_APPROVE')")
    public ResponseEntity<TimeOffRequestDto> reviewRequest(
            @PathVariable UUID id,
            @CurrentUser UserPrincipal currentUser,
            @Valid @RequestBody ReviewTimeOffRequestDto request) {
        return ResponseEntity.ok(requestService.review(id, currentUser.getPublicId(), request));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('TIME_OFF_REQUEST_CREATE')")
    public ResponseEntity<TimeOffRequestDto> cancelRequest(
            @PathVariable UUID id,
            @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(requestService.cancel(id, currentUser.getPublicId()));
    }

    @PostMapping("/{id}/attachment")
    @PreAuthorize("hasAuthority('TIME_OFF_REQUEST_CREATE')")
    public ResponseEntity<TimeOffRequestDto> uploadAttachment(
            @PathVariable UUID id,
            @CurrentUser UserPrincipal currentUser,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(requestService.uploadAttachment(id, currentUser.getPublicId(), file));
    }

    @GetMapping("/{id}/attachment")
    @PreAuthorize("hasAnyAuthority('TIME_OFF_REQUEST_READ_OWN', 'TIME_OFF_REQUEST_READ_TEAM', 'TIME_OFF_REQUEST_READ_ALL')")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable UUID id,
            @CurrentUser UserPrincipal currentUser) {
        var permissions = currentUser.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .collect(Collectors.toSet());

        Path filePath = requestService.getAttachmentPath(id, currentUser.getPublicId(), permissions);

        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = "application/octet-stream";
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + filePath.getFileName().toString() + "\"")
                    .body(resource);
        } catch (MalformedURLException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}/attachment")
    @PreAuthorize("hasAuthority('TIME_OFF_REQUEST_CREATE')")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable UUID id,
            @CurrentUser UserPrincipal currentUser) {
        requestService.deleteAttachment(id, currentUser.getPublicId());
        return ResponseEntity.noContent().build();
    }
}
