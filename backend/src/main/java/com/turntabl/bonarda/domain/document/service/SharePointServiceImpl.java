package com.turntabl.bonarda.domain.document.service;

import com.azure.identity.ClientSecretCredential;
import com.azure.identity.ClientSecretCredentialBuilder;
import com.microsoft.graph.serviceclient.GraphServiceClient;
import com.microsoft.graph.drives.item.items.item.preview.PreviewPostRequestBody;
import com.microsoft.graph.models.DriveItem;
import com.microsoft.graph.models.Site;
import com.microsoft.graph.models.Drive;
import com.microsoft.graph.models.UploadSession;
import com.microsoft.graph.drives.item.items.item.createuploadsession.CreateUploadSessionPostRequestBody;
import com.turntabl.bonarda.config.SharePointProperties;
import com.turntabl.bonarda.domain.document.dto.*;
import com.turntabl.bonarda.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;

@Service
@ConditionalOnProperty(name = "microsoft.graph.mock-enabled", havingValue = "false")
@Slf4j
@RequiredArgsConstructor
public class SharePointServiceImpl implements SharePointService {

    private static final long SIMPLE_UPLOAD_LIMIT = 4L * 1024 * 1024; // 4MB

    private final SharePointProperties properties;
    private GraphServiceClient graphClient;

    @PostConstruct
    public void init() {
        if (isConfigured()) {
            try {
                ClientSecretCredential credential = new ClientSecretCredentialBuilder()
                        .tenantId(properties.getTenantId())
                        .clientId(properties.getClientId())
                        .clientSecret(properties.getClientSecret())
                        .build();
                graphClient = new GraphServiceClient(credential,
                        properties.getScopes().toArray(new String[0]));
                log.info("Microsoft Graph client initialized — SharePoint integration available");
            } catch (Exception e) {
                log.error("Failed to initialize Microsoft Graph client: {}", e.getMessage());
                graphClient = null;
            }
        } else {
            log.warn("Microsoft Graph not configured — SharePoint features will be unavailable");
        }
    }

    @Override
    public boolean isConfigured() {
        return properties.getTenantId() != null && !properties.getTenantId().isBlank()
                && properties.getClientId() != null && !properties.getClientId().isBlank()
                && properties.getClientSecret() != null && !properties.getClientSecret().isBlank();
    }

    @Override
    public List<SharePointSiteDto> getSites() {
        if (graphClient == null) return Collections.emptyList();
        try {
            var response = graphClient.sites().get(config -> {
                config.queryParameters.search = "*";
            });
            if (response == null || response.getValue() == null) return Collections.emptyList();
            return response.getValue().stream()
                    .map(this::toSiteDto)
                    .toList();
        } catch (Exception e) {
            log.error("Failed to fetch SharePoint sites: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public List<SharePointDriveDto> getDrives(String siteId) {
        if (graphClient == null) return Collections.emptyList();
        try {
            var response = graphClient.sites().bySiteId(siteId).drives().get();
            if (response == null || response.getValue() == null) return Collections.emptyList();
            return response.getValue().stream()
                    .map(this::toDriveDto)
                    .toList();
        } catch (Exception e) {
            log.error("Failed to fetch drives for site {}: {}", siteId, e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public List<SharePointItemDto> getItems(String siteId, String driveId, String folderId) {
        if (graphClient == null) return Collections.emptyList();
        try {
            String itemId = (folderId == null || folderId.isBlank()) ? "root" : folderId;
            var response = graphClient.drives().byDriveId(driveId)
                    .items().byDriveItemId(itemId).children().get();
            if (response == null || response.getValue() == null) return Collections.emptyList();
            return response.getValue().stream()
                    .map(this::toItemDto)
                    .toList();
        } catch (Exception e) {
            log.error("Failed to fetch items for drive {}: {}", driveId, e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public SharePointItemDto getItem(String siteId, String driveId, String itemId) {
        if (graphClient == null) return null;
        try {
            DriveItem item = graphClient.drives().byDriveId(driveId)
                    .items().byDriveItemId(itemId).get();
            return item != null ? toItemDto(item) : null;
        } catch (Exception e) {
            log.error("Failed to fetch item {} in drive {}: {}", itemId, driveId, e.getMessage());
            return null;
        }
    }

    @Override
    public SharePointItemDto uploadFile(String driveId, String folderId, String fileName,
                                         InputStream content, long contentLength) {
        if (graphClient == null) {
            throw new BadRequestException("SharePoint is not configured");
        }
        try {
            String parentRef = (folderId != null && !folderId.isBlank()) ? folderId : "root";

            // v6 SDK path syntax: "root:/filename:" or "itemId:/filename:"
            String pathRef = parentRef + ":/" + fileName + ":";

            if (contentLength <= SIMPLE_UPLOAD_LIMIT) {
                DriveItem result = graphClient.drives().byDriveId(driveId)
                        .items().byDriveItemId(pathRef).content()
                        .put(content);
                return toItemDto(result);
            } else {
                CreateUploadSessionPostRequestBody body = new CreateUploadSessionPostRequestBody();
                UploadSession session = graphClient.drives().byDriveId(driveId)
                        .items().byDriveItemId(pathRef)
                        .createUploadSession().post(body);

                if (session == null || session.getUploadUrl() == null) {
                    throw new BadRequestException("Failed to create upload session");
                }

                com.microsoft.graph.core.tasks.LargeFileUploadTask<DriveItem> task =
                        new com.microsoft.graph.core.tasks.LargeFileUploadTask<>(
                                graphClient.getRequestAdapter(),
                                session,
                                content,
                                contentLength,
                                DriveItem::createFromDiscriminatorValue);
                var result = task.upload(10, null);
                if (result.isUploadSuccessful() && result.itemResponse != null) {
                    return toItemDto(result.itemResponse);
                }
                throw new BadRequestException("Large file upload failed");
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to upload file {} to drive {}: {}", fileName, driveId, e.getMessage());
            throw new BadRequestException("Failed to upload file: " + e.getMessage());
        }
    }

    @Override
    public SharePointPreviewDto getPreviewUrl(String driveId, String itemId) {
        if (graphClient == null) {
            return SharePointPreviewDto.builder().available(false).build();
        }
        try {
            var preview = graphClient.drives().byDriveId(driveId)
                    .items().byDriveItemId(itemId)
                    .preview().post(new PreviewPostRequestBody());
            if (preview != null && preview.getGetUrl() != null) {
                return SharePointPreviewDto.builder()
                        .previewUrl(preview.getGetUrl())
                        .available(true)
                        .build();
            }
        } catch (Exception e) {
            log.warn("Preview endpoint not available for item {}: {}", itemId, e.getMessage());
        }

        // Fallback: construct interactive preview from webUrl
        try {
            DriveItem item = graphClient.drives().byDriveId(driveId)
                    .items().byDriveItemId(itemId).get();
            if (item != null && item.getWebUrl() != null) {
                return SharePointPreviewDto.builder()
                        .previewUrl(item.getWebUrl() + "?action=interactivepreview")
                        .available(true)
                        .build();
            }
        } catch (Exception fallbackEx) {
            log.warn("Fallback preview also failed for item {}: {}", itemId, fallbackEx.getMessage());
        }

        return SharePointPreviewDto.builder().available(false).build();
    }

    @Override
    public List<SharePointLibraryDto> getConfiguredLibraries() {
        if (properties.getLibraries() == null || properties.getLibraries().isEmpty()) {
            return Collections.emptyList();
        }
        return properties.getLibraries().entrySet().stream()
                .map(entry -> {
                    SharePointProperties.LibraryConfig config = entry.getValue();
                    boolean configured = config.getSiteId() != null && !config.getSiteId().isBlank()
                            && config.getDriveId() != null && !config.getDriveId().isBlank();
                    return SharePointLibraryDto.builder()
                            .key(entry.getKey())
                            .name(config.getName())
                            .siteId(config.getSiteId())
                            .driveId(config.getDriveId())
                            .configured(configured)
                            .build();
                })
                .toList();
    }

    // --- Mapping helpers ---

    private SharePointSiteDto toSiteDto(Site site) {
        return SharePointSiteDto.builder()
                .siteId(site.getId())
                .displayName(site.getDisplayName())
                .webUrl(site.getWebUrl())
                .build();
    }

    private SharePointDriveDto toDriveDto(Drive drive) {
        return SharePointDriveDto.builder()
                .driveId(drive.getId())
                .name(drive.getName())
                .driveType(drive.getDriveType())
                .webUrl(drive.getWebUrl())
                .build();
    }

    private SharePointItemDto toItemDto(DriveItem item) {
        OffsetDateTime lastModified = item.getLastModifiedDateTime();
        String lastModifiedBy = null;
        if (item.getLastModifiedBy() != null && item.getLastModifiedBy().getUser() != null) {
            lastModifiedBy = item.getLastModifiedBy().getUser().getDisplayName();
        }
        return SharePointItemDto.builder()
                .itemId(item.getId())
                .name(item.getName())
                .webUrl(item.getWebUrl())
                .size(item.getSize())
                .mimeType(item.getFile() != null ? item.getFile().getMimeType() : null)
                .folder(item.getFolder() != null)
                .lastModified(lastModified != null ? lastModified.toString() : null)
                .lastModifiedBy(lastModifiedBy)
                .build();
    }
}
