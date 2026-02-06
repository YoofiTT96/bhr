package com.turntabl.bonarda.domain.document.service;

import com.turntabl.bonarda.domain.document.dto.SharePointDriveDto;
import com.turntabl.bonarda.domain.document.dto.SharePointItemDto;
import com.turntabl.bonarda.domain.document.dto.SharePointLibraryDto;
import com.turntabl.bonarda.domain.document.dto.SharePointPreviewDto;
import com.turntabl.bonarda.domain.document.dto.SharePointSiteDto;

import java.io.InputStream;
import java.util.List;

public interface SharePointService {
    boolean isConfigured();
    List<SharePointSiteDto> getSites();
    List<SharePointDriveDto> getDrives(String siteId);
    List<SharePointItemDto> getItems(String siteId, String driveId, String folderId);
    SharePointItemDto getItem(String siteId, String driveId, String itemId);
    SharePointItemDto uploadFile(String driveId, String folderId, String fileName,
                                 InputStream content, long contentLength);
    SharePointPreviewDto getPreviewUrl(String driveId, String itemId);
    List<SharePointLibraryDto> getConfiguredLibraries();
}
