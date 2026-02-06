package com.turntabl.bonarda.domain.document.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SharePointItemDto {
    private String itemId;
    private String name;
    private String webUrl;
    private long size;
    private String mimeType;
    private boolean folder;
    private String lastModified;
    private String lastModifiedBy;
}
