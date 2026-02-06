package com.turntabl.bonarda.domain.document.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateDocumentRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String documentType;
    private boolean companyWide;
    private boolean requiresSignature;
    private String signatureDeadline;

    // SharePoint fields (optional)
    private String sharepointSiteId;
    private String sharepointDriveId;
    private String sharepointItemId;
    private String sharepointWebUrl;
    private String sharepointFileName;
    private Long sharepointFileSize;
    private String sharepointMimeType;
}
