package com.turntabl.bonarda.domain.document.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DocumentSignatureDto {
    private String id;
    private String documentId;
    private String documentTitle;
    private String documentSharepointUrl;
    private String employeeId;
    private String employeeName;
    private String status;
    private String signedAt;
    private String declineReason;
    private boolean hasSignatureData;
    private String createdAt;
}
