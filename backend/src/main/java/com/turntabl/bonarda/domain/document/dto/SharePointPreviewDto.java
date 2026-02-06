package com.turntabl.bonarda.domain.document.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SharePointPreviewDto {
    private String previewUrl;
    private boolean available;
}
