package com.turntabl.bonarda.domain.document.service;

import com.turntabl.bonarda.domain.document.dto.*;
import com.turntabl.bonarda.security.UserPrincipal;

import java.util.List;
import java.util.UUID;

public interface DocumentSignatureService {
    List<DocumentSignatureDto> getPendingSignatures(UUID employeePublicId);
    List<DocumentSignatureDto> getAllMySignatures(UUID employeePublicId);
    List<DocumentSignatureDto> getSignaturesForDocument(UUID documentPublicId);
    DocumentSignatureDto sign(UUID signaturePublicId, SignDocumentRequest request,
                              String ipAddress, String userAgent, UserPrincipal currentUser);
    DocumentSignatureDto decline(UUID signaturePublicId, String declineReason, UserPrincipal currentUser);
    List<DocumentSignatureDto> requestSignatures(UUID documentPublicId, RequestSignatureRequest request, UserPrincipal currentUser);
}
