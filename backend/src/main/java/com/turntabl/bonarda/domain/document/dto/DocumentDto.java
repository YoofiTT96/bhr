package com.turntabl.bonarda.domain.document.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class DocumentDto {
    private String id;
    private String title;
    private String description;
    private String documentType;
    private String status;
    private boolean companyWide;
    private boolean requiresSignature;
    private String signatureDeadline;
    private String sharepointWebUrl;
    private String sharepointFileName;
    private Long sharepointFileSize;
    private String sharepointMimeType;
    private String sharepointSiteId;
    private String sharepointDriveId;
    private String sharepointItemId;
    private boolean sharePointDocument;
    private String uploadedById;
    private String uploadedByName;
    private int shareCount;
    private int signedCount;
    private int pendingSignatureCount;
    private String mySignatureStatus;
    private String mySignatureId;
    private String createdAt;
}
