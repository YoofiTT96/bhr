package com.turntabl.bonarda.domain.document.service;

import com.turntabl.bonarda.domain.document.dto.*;
import com.turntabl.bonarda.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface DocumentService {
    DocumentDto create(CreateDocumentRequest request, UserPrincipal currentUser);
    DocumentDto update(UUID publicId, CreateDocumentRequest request, UserPrincipal currentUser);
    DocumentDto getById(UUID publicId, UserPrincipal currentUser);
    Page<DocumentDto> getAll(Pageable pageable);
    List<DocumentDto> getMyDocuments(UUID employeePublicId);
    Page<DocumentDto> getCompanyWideDocuments(Pageable pageable);
    List<DocumentDto> getMyUploads(UUID employeePublicId);
    void delete(UUID publicId, UserPrincipal currentUser);
    List<DocumentShareDto> shareDocument(UUID documentPublicId, ShareDocumentRequest request, UserPrincipal currentUser);
    List<DocumentShareDto> getShares(UUID documentPublicId);
    void removeShare(UUID documentPublicId, UUID sharePublicId);
    void markViewed(UUID documentPublicId, UserPrincipal currentUser);
}
