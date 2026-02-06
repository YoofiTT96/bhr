package com.turntabl.bonarda.domain.document.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SharePointSiteDto {
    private String siteId;
    private String displayName;
    private String webUrl;
}
