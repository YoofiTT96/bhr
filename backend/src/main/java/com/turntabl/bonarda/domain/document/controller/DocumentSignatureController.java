package com.turntabl.bonarda.domain.document.controller;

import com.turntabl.bonarda.domain.document.dto.*;
import com.turntabl.bonarda.domain.document.service.DocumentSignatureService;
import com.turntabl.bonarda.security.CurrentUser;
import com.turntabl.bonarda.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/document-signatures")
@RequiredArgsConstructor
public class DocumentSignatureController {

    private final DocumentSignatureService signatureService;

    @GetMapping("/me/pending")
    @PreAuthorize("hasAuthority('DOCUMENT_SIGN_OWN')")
    public ResponseEntity<List<DocumentSignatureDto>> getMyPending(@CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(signatureService.getPendingSignatures(currentUser.getPublicId()));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('DOCUMENT_SIGN_OWN')")
    public ResponseEntity<List<DocumentSignatureDto>> getMySignatures(@CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(signatureService.getAllMySignatures(currentUser.getPublicId()));
    }

    @GetMapping("/document/{docId}")
    @PreAuthorize("hasAuthority('DOCUMENT_SIGN_READ')")
    public ResponseEntity<List<DocumentSignatureDto>> getDocumentSignatures(@PathVariable UUID docId) {
        return ResponseEntity.ok(signatureService.getSignaturesForDocument(docId));
    }

    @PostMapping("/{id}/sign")
    @PreAuthorize("hasAuthority('DOCUMENT_SIGN_OWN')")
    public ResponseEntity<DocumentSignatureDto> sign(@PathVariable UUID id,
                                                      @Valid @RequestBody SignDocumentRequest request,
                                                      @CurrentUser UserPrincipal currentUser,
                                                      HttpServletRequest httpRequest) {
        String ipAddress = httpRequest.getRemoteAddr();
        String userAgent = httpRequest.getHeader("User-Agent");
        return ResponseEntity.ok(signatureService.sign(id, request, ipAddress, userAgent, currentUser));
    }

    @PostMapping("/{id}/decline")
    @PreAuthorize("hasAuthority('DOCUMENT_SIGN_OWN')")
    public ResponseEntity<DocumentSignatureDto> decline(@PathVariable UUID id,
                                                         @RequestBody(required = false) DeclineSignatureRequest request,
                                                         @CurrentUser UserPrincipal currentUser) {
        String reason = request != null ? request.getDeclineReason() : null;
        return ResponseEntity.ok(signatureService.decline(id, reason, currentUser));
    }

    @PostMapping("/document/{docId}/request")
    @PreAuthorize("hasAuthority('DOCUMENT_SHARE')")
    public ResponseEntity<List<DocumentSignatureDto>> requestSignatures(@PathVariable UUID docId,
                                                                         @Valid @RequestBody RequestSignatureRequest request,
                                                                         @CurrentUser UserPrincipal currentUser) {
        return ResponseEntity.ok(signatureService.requestSignatures(docId, request, currentUser));
    }
}
