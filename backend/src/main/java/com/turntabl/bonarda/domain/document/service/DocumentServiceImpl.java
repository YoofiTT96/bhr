package com.turntabl.bonarda.domain.document.service;

import com.turntabl.bonarda.domain.common.service.EntityResolutionService;
import com.turntabl.bonarda.domain.common.service.EnumParser;
import com.turntabl.bonarda.domain.document.dto.*;
import com.turntabl.bonarda.domain.document.model.*;
import com.turntabl.bonarda.domain.document.repository.DocumentRepository;
import com.turntabl.bonarda.domain.document.repository.DocumentShareRepository;
import com.turntabl.bonarda.domain.document.repository.DocumentSignatureRepository;
import com.turntabl.bonarda.domain.employee.model.Employee;
import com.turntabl.bonarda.exception.BadRequestException;
import com.turntabl.bonarda.exception.ForbiddenException;
import com.turntabl.bonarda.exception.ResourceNotFoundException;
import com.turntabl.bonarda.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentShareRepository shareRepository;
    private final DocumentSignatureRepository signatureRepository;
    private final EntityResolutionService entityResolution;
    private final EnumParser enumParser;

    @Override
    public DocumentDto create(CreateDocumentRequest request, UserPrincipal currentUser) {
        if (request.isCompanyWide() && request.isRequiresSignature()) {
            throw new BadRequestException("Company-wide documents cannot require signatures");
        }

        Employee uploader = entityResolution.resolveEmployee(currentUser.getPublicId());

        Document document = Document.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .documentType(request.getDocumentType() != null
                        ? enumParser.parse(DocumentType.class, request.getDocumentType(), "document type")
                        : DocumentType.GENERAL)
                .companyWide(request.isCompanyWide())
                .requiresSignature(request.isCompanyWide() ? false : request.isRequiresSignature())
                .signatureDeadline(request.getSignatureDeadline() != null
                        ? LocalDate.parse(request.getSignatureDeadline())
                        : null)
                .sharepointSiteId(request.getSharepointSiteId())
                .sharepointDriveId(request.getSharepointDriveId())
                .sharepointItemId(request.getSharepointItemId())
                .sharepointWebUrl(request.getSharepointWebUrl())
                .sharepointFileName(request.getSharepointFileName())
                .sharepointFileSize(request.getSharepointFileSize())
                .sharepointMimeType(request.getSharepointMimeType())
                .uploadedBy(uploader)
                .build();

        Document saved = documentRepository.save(document);
        return toDto(saved);
    }

    @Override
    public DocumentDto update(UUID publicId, CreateDocumentRequest request, UserPrincipal currentUser) {
        Document document = documentRepository.findByPublicIdForUpdate(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "publicId", publicId));

        verifyDocumentAccess(document, currentUser, true);

        if (request.isCompanyWide() && request.isRequiresSignature()) {
            throw new BadRequestException("Company-wide documents cannot require signatures");
        }

        document.setTitle(request.getTitle());
        if (request.getDescription() != null) document.setDescription(request.getDescription());
        if (request.getDocumentType() != null) document.setDocumentType(enumParser.parse(DocumentType.class, request.getDocumentType(), "document type"));
        document.setCompanyWide(request.isCompanyWide());
        if (Boolean.TRUE.equals(request.isCompanyWide())) {
            document.setRequiresSignature(false);
        } else {
            document.setRequiresSignature(request.isRequiresSignature());
        }
        if (request.getSignatureDeadline() != null) {
            document.setSignatureDeadline(LocalDate.parse(request.getSignatureDeadline()));
        }
        if (request.getSharepointWebUrl() != null) document.setSharepointWebUrl(request.getSharepointWebUrl());
        if (request.getSharepointFileName() != null) document.setSharepointFileName(request.getSharepointFileName());

        Document updated = documentRepository.save(document);
        return toDto(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public DocumentDto getById(UUID publicId, UserPrincipal currentUser) {
        Document document = documentRepository.findByPublicIdWithUploader(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "publicId", publicId));

        verifyDocumentAccess(document, currentUser, false);

        return toDto(document);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DocumentDto> getAll(Pageable pageable) {
        return documentRepository.findAllActive(pageable).map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentDto> getMyDocuments(UUID employeePublicId) {
        Employee employee = entityResolution.resolveEmployee(employeePublicId);
        List<DocumentShare> shares = shareRepository.findByEmployeeIdWithDocument(employee.getId());
        return shares.stream()
                .map(share -> {
                    DocumentDto dto = toDto(share.getDocument());
                    // Enrich with this employee's personal signature status
                    signatureRepository.findByDocumentIdAndEmployeeId(
                            share.getDocument().getId(), employee.getId()
                    ).ifPresent(sig -> {
                        dto.setMySignatureStatus(sig.getStatus().name());
                        dto.setMySignatureId(sig.getPublicId().toString());
                    });
                    return dto;
                })
                .toList();
    }

    @Override
    public void delete(UUID publicId, UserPrincipal currentUser) {
        Document document = documentRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "publicId", publicId));

        verifyDocumentAccess(document, currentUser, true);

        documentRepository.delete(document);
    }

    @Override
    public List<DocumentShareDto> shareDocument(UUID documentPublicId, ShareDocumentRequest request, UserPrincipal currentUser) {
        Document document = documentRepository.findByPublicId(documentPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "publicId", documentPublicId));

        if (Boolean.TRUE.equals(document.getCompanyWide())) {
            throw new BadRequestException("Company-wide documents cannot be shared individually");
        }

        Employee sharer = entityResolution.resolveEmployee(currentUser.getPublicId());

        List<DocumentShareDto> results = new ArrayList<>();
        for (UUID empPublicId : request.getEmployeeIds()) {
            Employee emp = entityResolution.resolveEmployee(empPublicId);

            if (shareRepository.existsByDocumentIdAndEmployeeId(document.getId(), emp.getId())) {
                continue; // skip already shared
            }

            DocumentShare share = shareRepository.save(DocumentShare.builder()
                    .document(document)
                    .employee(emp)
                    .sharedBy(sharer)
                    .build());

            // If document requires signature, create a PENDING signature record
            if (Boolean.TRUE.equals(document.getRequiresSignature())
                    && !signatureRepository.existsByDocumentIdAndEmployeeId(document.getId(), emp.getId())) {
                signatureRepository.save(DocumentSignature.builder()
                        .document(document)
                        .employee(emp)
                        .status(SignatureStatus.PENDING)
                        .build());
            }

            results.add(toShareDto(share));
        }
        return results;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentShareDto> getShares(UUID documentPublicId) {
        Document document = documentRepository.findByPublicId(documentPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "publicId", documentPublicId));
        return shareRepository.findByDocumentIdWithEmployee(document.getId()).stream()
                .map(this::toShareDto)
                .toList();
    }

    @Override
    public void removeShare(UUID documentPublicId, UUID sharePublicId) {
        DocumentShare share = shareRepository.findByPublicId(sharePublicId)
                .orElseThrow(() -> new ResourceNotFoundException("DocumentShare", "publicId", sharePublicId));
        if (!share.getDocument().getPublicId().equals(documentPublicId)) {
            throw new BadRequestException("Share does not belong to this document");
        }
        shareRepository.delete(share);
    }

    @Override
    public void markViewed(UUID documentPublicId, UserPrincipal currentUser) {
        Document document = documentRepository.findByPublicId(documentPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "publicId", documentPublicId));
        Employee employee = entityResolution.resolveEmployee(currentUser.getPublicId());

        shareRepository.findByDocumentIdAndEmployeeId(document.getId(), employee.getId())
                .ifPresent(share -> {
                    if (share.getViewedAt() == null) {
                        share.setViewedAt(LocalDateTime.now());
                        shareRepository.save(share);
                    }
                });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DocumentDto> getCompanyWideDocuments(Pageable pageable) {
        return documentRepository.findCompanyWide(pageable).map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentDto> getMyUploads(UUID employeePublicId) {
        return documentRepository.findByUploaderPublicId(employeePublicId).stream()
                .map(this::toDto)
                .toList();
    }

    // --- Access Control ---

    /**
     * Verify the current user can access a document.
     * For write operations (update/delete), only the uploader or users with DOCUMENT_READ_ALL can proceed.
     * For read operations, the user must be the uploader, have a share, or hold DOCUMENT_READ_ALL.
     */
    private void verifyDocumentAccess(Document document, UserPrincipal currentUser, boolean writeAccess) {
        Set<String> permissions = currentUser.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        // Users with DOCUMENT_READ_ALL (admin/HR) can access any document
        if (permissions.contains("DOCUMENT_READ_ALL")) {
            return;
        }

        Employee caller = entityResolution.resolveEmployee(currentUser.getPublicId());

        // Uploader has full access
        if (document.getUploadedBy() != null
                && document.getUploadedBy().getId().equals(caller.getId())) {
            return;
        }

        // Company-wide documents are readable by any authenticated user
        if (!writeAccess && Boolean.TRUE.equals(document.getCompanyWide())) {
            return;
        }

        // For read access, check if user has a share
        if (!writeAccess
                && shareRepository.existsByDocumentIdAndEmployeeId(document.getId(), caller.getId())) {
            return;
        }

        throw new ForbiddenException("You do not have permission to access this document");
    }

    // --- Helpers ---

    private DocumentDto toDto(Document doc) {
        long signedCount = signatureRepository.countByDocumentIdAndStatus(doc.getId(), SignatureStatus.SIGNED);
        long pendingCount = signatureRepository.countByDocumentIdAndStatus(doc.getId(), SignatureStatus.PENDING);

        return DocumentDto.builder()
                .id(doc.getPublicId().toString())
                .title(doc.getTitle())
                .description(doc.getDescription())
                .documentType(doc.getDocumentType().name())
                .status(doc.getStatus().name())
                .companyWide(Boolean.TRUE.equals(doc.getCompanyWide()))
                .requiresSignature(Boolean.TRUE.equals(doc.getRequiresSignature()))
                .signatureDeadline(doc.getSignatureDeadline() != null ? doc.getSignatureDeadline().toString() : null)
                .sharepointWebUrl(doc.getSharepointWebUrl())
                .sharepointFileName(doc.getSharepointFileName())
                .sharepointFileSize(doc.getSharepointFileSize())
                .sharepointMimeType(doc.getSharepointMimeType())
                .sharepointSiteId(doc.getSharepointSiteId())
                .sharepointDriveId(doc.getSharepointDriveId())
                .sharepointItemId(doc.getSharepointItemId())
                .sharePointDocument(doc.isSharePointDocument())
                .uploadedById(doc.getUploadedBy().getPublicId().toString())
                .uploadedByName(doc.getUploadedBy().getFirstName() + " " + doc.getUploadedBy().getLastName())
                .shareCount(doc.getShares() != null ? doc.getShares().size() : 0)
                .signedCount((int) signedCount)
                .pendingSignatureCount((int) pendingCount)
                .createdAt(doc.getCreatedAt() != null ? doc.getCreatedAt().toString() : null)
                .build();
    }

    private DocumentShareDto toShareDto(DocumentShare share) {
        return DocumentShareDto.builder()
                .id(share.getPublicId().toString())
                .documentId(share.getDocument().getPublicId().toString())
                .documentTitle(share.getDocument().getTitle())
                .employeeId(share.getEmployee().getPublicId().toString())
                .employeeName(share.getEmployee().getFirstName() + " " + share.getEmployee().getLastName())
                .sharedById(share.getSharedBy().getPublicId().toString())
                .sharedByName(share.getSharedBy().getFirstName() + " " + share.getSharedBy().getLastName())
                .viewedAt(share.getViewedAt() != null ? share.getViewedAt().toString() : null)
                .sharedAt(share.getCreatedAt() != null ? share.getCreatedAt().toString() : null)
                .build();
    }
}
