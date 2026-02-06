package com.turntabl.bonarda.domain.document.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SharePointLibraryDto {
    private String key;
    private String name;
    private String siteId;
    private String driveId;
    private boolean configured;
}
