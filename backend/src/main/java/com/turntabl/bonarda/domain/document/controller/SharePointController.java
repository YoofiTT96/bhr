package com.turntabl.bonarda.domain.document.controller;

import com.turntabl.bonarda.domain.document.dto.*;
import com.turntabl.bonarda.domain.document.service.SharePointService;
import com.turntabl.bonarda.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/sharepoint")
@RequiredArgsConstructor
public class SharePointController {

    private final SharePointService sharePointService;

    @GetMapping("/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("configured", sharePointService.isConfigured());
        status.put("libraries", sharePointService.getConfiguredLibraries());
        return ResponseEntity.ok(status);
    }

    @GetMapping("/sites")
    @PreAuthorize("hasAuthority('SHAREPOINT_BROWSE')")
    public ResponseEntity<List<SharePointSiteDto>> getSites() {
        return ResponseEntity.ok(sharePointService.getSites());
    }

    @GetMapping("/sites/{siteId}/drives")
    @PreAuthorize("hasAuthority('SHAREPOINT_BROWSE')")
    public ResponseEntity<List<SharePointDriveDto>> getDrives(@PathVariable String siteId) {
        return ResponseEntity.ok(sharePointService.getDrives(siteId));
    }

    @GetMapping("/sites/{siteId}/drives/{driveId}/items")
    @PreAuthorize("hasAuthority('SHAREPOINT_BROWSE')")
    public ResponseEntity<List<SharePointItemDto>> getItems(@PathVariable String siteId,
                                                             @PathVariable String driveId,
                                                             @RequestParam(required = false) String folderId) {
        return ResponseEntity.ok(sharePointService.getItems(siteId, driveId, folderId));
    }

    @GetMapping("/sites/{siteId}/drives/{driveId}/items/{itemId}")
    @PreAuthorize("hasAuthority('SHAREPOINT_BROWSE')")
    public ResponseEntity<SharePointItemDto> getItem(@PathVariable String siteId,
                                                      @PathVariable String driveId,
                                                      @PathVariable String itemId) {
        return ResponseEntity.ok(sharePointService.getItem(siteId, driveId, itemId));
    }

    @PostMapping("/drives/{driveId}/upload")
    @PreAuthorize("hasAuthority('DOCUMENT_CREATE')")
    public ResponseEntity<SharePointItemDto> uploadFile(@PathVariable String driveId,
                                                         @RequestPart("file") MultipartFile file,
                                                         @RequestParam(required = false) String folderId) {
        if (file.isEmpty()) {
            throw new BadRequestException("File must not be empty");
        }
        try {
            SharePointItemDto result = sharePointService.uploadFile(
                    driveId, folderId, file.getOriginalFilename(),
                    file.getInputStream(), file.getSize());
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            throw new BadRequestException("Failed to read uploaded file: " + e.getMessage());
        }
    }

    @GetMapping("/drives/{driveId}/items/{itemId}/preview")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SharePointPreviewDto> getPreviewUrl(@PathVariable String driveId,
                                                               @PathVariable String itemId) {
        return ResponseEntity.ok(sharePointService.getPreviewUrl(driveId, itemId));
    }
}
