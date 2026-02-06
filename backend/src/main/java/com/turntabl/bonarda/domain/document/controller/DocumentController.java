package com.turntabl.bonarda.domain.document.controller;

import com.turntabl.bonarda.domain.document.dto.*;
import com.turntabl.bonarda.domain.document.service.DocumentService;
import com.turntabl.bonarda.security.CurrentUser;
import com.turntabl.bonarda.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping
    @PreAuthorize("hasAuthority('DOCUMENT_READ_ALL')")
    public ResponseEntity<Page<DocumentDto>> getAll(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(documentService.getAll(pageable));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('DOCUMENT_READ_OWN')")
    public ResponseEntity<List<DocumentDto>> getMyDocuments(@CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(documentService.getMyDocuments(currentUser.getPublicId()));
    }

    @GetMapping("/company-wide")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<DocumentDto>> getCompanyWide(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(documentService.getCompanyWideDocuments(pageable));
    }

    @GetMapping("/my-uploads")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DocumentDto>> getMyUploads(@CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(documentService.getMyUploads(currentUser.getPublicId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('DOCUMENT_READ_OWN')")
    public ResponseEntity<DocumentDto> getById(@PathVariable UUID id,
                                                @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(documentService.getById(id, currentUser));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('DOCUMENT_CREATE')")
    public ResponseEntity<DocumentDto> create(@Valid @RequestBody CreateDocumentRequest request,
                                               @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(documentService.create(request, currentUser));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('DOCUMENT_UPDATE')")
    public ResponseEntity<DocumentDto> update(@PathVariable UUID id,
                                               @Valid @RequestBody CreateDocumentRequest request,
                                               @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(documentService.update(id, request, currentUser));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('DOCUMENT_DELETE')")
    public ResponseEntity<Void> delete(@PathVariable UUID id,
                                        @CurrentUser UserPrincipal currentUser) {
        documentService.delete(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/shares")
    @PreAuthorize("hasAuthority('DOCUMENT_SHARE')")
    public ResponseEntity<List<DocumentShareDto>> shareDocument(@PathVariable UUID id,
                                                                 @Valid @RequestBody ShareDocumentRequest request,
                                                                 @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(documentService.shareDocument(id, request, currentUser));
    }

    @GetMapping("/{id}/shares")
    @PreAuthorize("hasAuthority('DOCUMENT_READ_ALL')")
    public ResponseEntity<List<DocumentShareDto>> getShares(@PathVariable UUID id) {
        return ResponseEntity.ok(documentService.getShares(id));
    }

    @DeleteMapping("/{id}/shares/{shareId}")
    @PreAuthorize("hasAuthority('DOCUMENT_SHARE')")
    public ResponseEntity<Void> removeShare(@PathVariable UUID id, @PathVariable UUID shareId) {
        documentService.removeShare(id, shareId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/viewed")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markViewed(@PathVariable UUID id, @CurrentUser UserPrincipal currentUser) {
        documentService.markViewed(id, currentUser);
        return ResponseEntity.ok().build();
    }
}
