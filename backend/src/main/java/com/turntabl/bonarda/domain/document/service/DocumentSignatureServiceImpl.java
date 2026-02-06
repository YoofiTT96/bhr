package com.turntabl.bonarda.domain.document.service;

import com.turntabl.bonarda.domain.common.service.EntityResolutionService;
import com.turntabl.bonarda.domain.document.dto.*;
import com.turntabl.bonarda.domain.document.model.*;
import com.turntabl.bonarda.domain.document.repository.DocumentRepository;
import com.turntabl.bonarda.domain.document.repository.DocumentShareRepository;
import com.turntabl.bonarda.domain.document.repository.DocumentSignatureRepository;
import com.turntabl.bonarda.domain.employee.model.Employee;
import com.turntabl.bonarda.exception.BadRequestException;
import com.turntabl.bonarda.exception.ResourceNotFoundException;
import com.turntabl.bonarda.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class DocumentSignatureServiceImpl implements DocumentSignatureService {

    private final DocumentSignatureRepository signatureRepository;
    private final DocumentRepository documentRepository;
    private final DocumentShareRepository shareRepository;
    private final EntityResolutionService entityResolution;

    @Override
    @Transactional(readOnly = true)
    public List<DocumentSignatureDto> getPendingSignatures(UUID employeePublicId) {
        Employee employee = entityResolution.resolveEmployee(employeePublicId);
        return signatureRepository.findPendingByEmployeeId(employee.getId()).stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentSignatureDto> getAllMySignatures(UUID employeePublicId) {
        Employee employee = entityResolution.resolveEmployee(employeePublicId);
        return signatureRepository.findAllByEmployeeId(employee.getId()).stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentSignatureDto> getSignaturesForDocument(UUID documentPublicId) {
        Document document = documentRepository.findByPublicId(documentPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "publicId", documentPublicId));
        return signatureRepository.findByDocumentIdWithEmployee(document.getId()).stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public DocumentSignatureDto sign(UUID signaturePublicId, SignDocumentRequest request,
                                      String ipAddress, String userAgent, UserPrincipal currentUser) {
        DocumentSignature signature = signatureRepository.findByPublicId(signaturePublicId)
                .orElseThrow(() -> new ResourceNotFoundException("DocumentSignature", "publicId", signaturePublicId));

        if (signature.getStatus() != SignatureStatus.PENDING) {
            throw new BadRequestException("Only pending signatures can be signed");
        }

        Employee employee = entityResolution.resolveEmployee(currentUser.getPublicId());
        if (!signature.getEmployee().getId().equals(employee.getId())) {
            throw new BadRequestException("You can only sign your own signature requests");
        }

        signature.setStatus(SignatureStatus.SIGNED);
        signature.setSignatureData(request.getSignatureData());
        signature.setSignedAt(LocalDateTime.now());
        signature.setIpAddress(ipAddress);
        signature.setUserAgent(userAgent);

        DocumentSignature saved = signatureRepository.save(signature);
        return toDto(saved);
    }

    @Override
    public DocumentSignatureDto decline(UUID signaturePublicId, String declineReason, UserPrincipal currentUser) {
        DocumentSignature signature = signatureRepository.findByPublicId(signaturePublicId)
                .orElseThrow(() -> new ResourceNotFoundException("DocumentSignature", "publicId", signaturePublicId));

        if (signature.getStatus() != SignatureStatus.PENDING) {
            throw new BadRequestException("Only pending signatures can be declined");
        }

        Employee employee = entityResolution.resolveEmployee(currentUser.getPublicId());
        if (!signature.getEmployee().getId().equals(employee.getId())) {
            throw new BadRequestException("You can only decline your own signature requests");
        }

        signature.setStatus(SignatureStatus.DECLINED);
        signature.setDeclineReason(declineReason);

        DocumentSignature saved = signatureRepository.save(signature);
        return toDto(saved);
    }

    @Override
    public List<DocumentSignatureDto> requestSignatures(UUID documentPublicId,
                                                         RequestSignatureRequest request, UserPrincipal currentUser) {
        Document document = documentRepository.findByPublicId(documentPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "publicId", documentPublicId));
        Employee sharer = entityResolution.resolveEmployee(currentUser.getPublicId());

        List<DocumentSignatureDto> results = new ArrayList<>();
        for (UUID empPublicId : request.getEmployeeIds()) {
            Employee emp = entityResolution.resolveEmployee(empPublicId);

            if (signatureRepository.existsByDocumentIdAndEmployeeId(document.getId(), emp.getId())) {
                continue; // skip — already has signature request
            }

            // Ensure the employee has a share
            if (!shareRepository.existsByDocumentIdAndEmployeeId(document.getId(), emp.getId())) {
                shareRepository.save(DocumentShare.builder()
                        .document(document)
                        .employee(emp)
                        .sharedBy(sharer)
                        .build());
            }

            DocumentSignature sig = signatureRepository.save(DocumentSignature.builder()
                    .document(document)
                    .employee(emp)
                    .status(SignatureStatus.PENDING)
                    .build());

            results.add(toDto(sig));
        }
        return results;
    }

    // --- Helpers ---

    private DocumentSignatureDto toDto(DocumentSignature sig) {
        return DocumentSignatureDto.builder()
                .id(sig.getPublicId().toString())
                .documentId(sig.getDocument().getPublicId().toString())
                .documentTitle(sig.getDocument().getTitle())
                .documentSharepointUrl(sig.getDocument().getSharepointWebUrl())
                .employeeId(sig.getEmployee().getPublicId().toString())
                .employeeName(sig.getEmployee().getFirstName() + " " + sig.getEmployee().getLastName())
                .status(sig.getStatus().name())
                .signedAt(sig.getSignedAt() != null ? sig.getSignedAt().toString() : null)
                .declineReason(sig.getDeclineReason())
                .hasSignatureData(sig.getSignatureData() != null)
                .createdAt(sig.getCreatedAt() != null ? sig.getCreatedAt().toString() : null)
                .build();
    }
}
