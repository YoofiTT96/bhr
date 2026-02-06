package com.turntabl.bonarda.domain.document.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SharePointDriveDto {
    private String driveId;
    private String name;
    private String driveType;
    private String webUrl;
}
