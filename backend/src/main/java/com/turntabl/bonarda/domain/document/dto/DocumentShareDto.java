package com.turntabl.bonarda.domain.document.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DocumentShareDto {
    private String id;
    private String documentId;
    private String documentTitle;
    private String employeeId;
    private String employeeName;
    private String sharedById;
    private String sharedByName;
    private String viewedAt;
    private String sharedAt;
}
