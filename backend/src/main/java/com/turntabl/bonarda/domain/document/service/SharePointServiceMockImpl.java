package com.turntabl.bonarda.domain.document.service;

import com.turntabl.bonarda.config.SharePointProperties;
import com.turntabl.bonarda.domain.document.dto.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@ConditionalOnProperty(name = "microsoft.graph.mock-enabled", havingValue = "true", matchIfMissing = true)
@Slf4j
@RequiredArgsConstructor
public class SharePointServiceMockImpl implements SharePointService {

    private final SharePointProperties properties;

    private static final String BASE_URL = "https://mock-sharepoint.example.com";

    // In-memory storage for uploaded files
    private final Map<String, List<SharePointItemDto>> uploadedItems = new ConcurrentHashMap<>();
    private final AtomicInteger uploadCounter = new AtomicInteger(1);

    // --- Static mock data ---

    private static final List<SharePointSiteDto> SITES = List.of(
            SharePointSiteDto.builder()
                    .siteId("mock-site-hr")
                    .displayName("HR Portal")
                    .webUrl(BASE_URL + "/sites/hr-portal")
                    .build(),
            SharePointSiteDto.builder()
                    .siteId("mock-site-intranet")
                    .displayName("Company Intranet")
                    .webUrl(BASE_URL + "/sites/intranet")
                    .build()
    );

    private static final Map<String, List<SharePointDriveDto>> DRIVES = Map.of(
            "mock-site-hr", List.of(
                    SharePointDriveDto.builder()
                            .driveId("mock-drive-hr-docs")
                            .name("Documents")
                            .driveType("documentLibrary")
                            .webUrl(BASE_URL + "/sites/hr-portal/Documents")
                            .build()
            ),
            "mock-site-intranet", List.of(
                    SharePointDriveDto.builder()
                            .driveId("mock-drive-intranet-docs")
                            .name("Documents")
                            .driveType("documentLibrary")
                            .webUrl(BASE_URL + "/sites/intranet/Documents")
                            .build()
            )
    );

    // Root items per drive
    private static final Map<String, List<SharePointItemDto>> DRIVE_ROOT_ITEMS = Map.of(
            "mock-drive-hr-docs", List.of(
                    folder("mock-folder-policies", "Policies"),
                    folder("mock-folder-personnel", "Personnel"),
                    file("mock-file-handbook", "Employee Handbook 2025.pdf",
                            "application/pdf", 2_516_582L, "hr-portal/Documents"),
                    file("mock-file-onboarding", "Onboarding Checklist.xlsx",
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                            46_080L, "hr-portal/Documents")
            ),
            "mock-drive-intranet-docs", List.of(
                    folder("mock-folder-announcements", "Announcements"),
                    file("mock-file-org-chart", "Organization Chart.pdf",
                            "application/pdf", 892_416L, "intranet/Documents"),
                    file("mock-file-brand-guide", "Brand Guidelines.pdf",
                            "application/pdf", 3_145_728L, "intranet/Documents")
            )
    );

    // Folder contents
    private static final Map<String, List<SharePointItemDto>> FOLDER_ITEMS = Map.of(
            "mock-folder-policies", List.of(
                    file("mock-file-coc", "Code of Conduct.docx",
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                            159_744L, "hr-portal/Documents/Policies"),
                    file("mock-file-benefits", "Benefits Guide.pdf",
                            "application/pdf", 1_887_436L, "hr-portal/Documents/Policies"),
                    file("mock-file-nda", "NDA Template.docx",
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                            91_136L, "hr-portal/Documents/Policies")
            ),
            "mock-folder-personnel", List.of(
                    file("mock-file-review-template", "Performance Review Template.docx",
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                            72_704L, "hr-portal/Documents/Personnel"),
                    file("mock-file-timesheet", "Timesheet Template.xlsx",
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                            35_840L, "hr-portal/Documents/Personnel")
            ),
            "mock-folder-announcements", List.of(
                    file("mock-file-q4-update", "Q4 Company Update.pdf",
                            "application/pdf", 524_288L, "intranet/Documents/Announcements"),
                    file("mock-file-holiday", "Holiday Schedule 2025.pdf",
                            "application/pdf", 204_800L, "intranet/Documents/Announcements")
            )
    );

    // All items indexed by ID for getItem lookups
    private static final Map<String, SharePointItemDto> ALL_ITEMS = new HashMap<>();

    static {
        DRIVE_ROOT_ITEMS.values().forEach(items -> items.forEach(item -> ALL_ITEMS.put(item.getItemId(), item)));
        FOLDER_ITEMS.values().forEach(items -> items.forEach(item -> ALL_ITEMS.put(item.getItemId(), item)));
    }

    @PostConstruct
    public void init() {
        log.info("SharePoint mock service active — returning fake data for local development");
    }

    @Override
    public boolean isConfigured() {
        return true;
    }

    @Override
    public List<SharePointSiteDto> getSites() {
        return SITES;
    }

    @Override
    public List<SharePointDriveDto> getDrives(String siteId) {
        return DRIVES.getOrDefault(siteId, Collections.emptyList());
    }

    @Override
    public List<SharePointItemDto> getItems(String siteId, String driveId, String folderId) {
        // Check for uploaded items first
        String key = driveId + ":" + (folderId != null && !folderId.isBlank() ? folderId : "root");

        if (folderId != null && !folderId.isBlank()) {
            List<SharePointItemDto> folderContents = FOLDER_ITEMS.getOrDefault(folderId, Collections.emptyList());
            List<SharePointItemDto> uploaded = uploadedItems.getOrDefault(key, Collections.emptyList());
            if (uploaded.isEmpty()) return folderContents;
            List<SharePointItemDto> combined = new ArrayList<>(folderContents);
            combined.addAll(uploaded);
            return combined;
        }

        List<SharePointItemDto> rootItems = DRIVE_ROOT_ITEMS.getOrDefault(driveId, Collections.emptyList());
        List<SharePointItemDto> uploaded = uploadedItems.getOrDefault(key, Collections.emptyList());
        if (uploaded.isEmpty()) return rootItems;
        List<SharePointItemDto> combined = new ArrayList<>(rootItems);
        combined.addAll(uploaded);
        return combined;
    }

    @Override
    public SharePointItemDto getItem(String siteId, String driveId, String itemId) {
        SharePointItemDto staticItem = ALL_ITEMS.get(itemId);
        if (staticItem != null) return staticItem;

        // Search uploaded items
        for (List<SharePointItemDto> items : uploadedItems.values()) {
            for (SharePointItemDto item : items) {
                if (item.getItemId().equals(itemId)) return item;
            }
        }
        return null;
    }

    @Override
    public SharePointItemDto uploadFile(String driveId, String folderId, String fileName,
                                        InputStream content, long contentLength) {
        int num = uploadCounter.getAndIncrement();
        String itemId = "mock-upload-" + num;

        String mimeType = guessMimeType(fileName);
        String pathSegment = driveId.contains("hr") ? "hr-portal/Documents" : "intranet/Documents";

        SharePointItemDto uploaded = SharePointItemDto.builder()
                .itemId(itemId)
                .name(fileName)
                .webUrl(BASE_URL + "/sites/" + pathSegment + "/" + fileName.replace(" ", "%20"))
                .size(contentLength)
                .mimeType(mimeType)
                .folder(false)
                .lastModified(OffsetDateTime.now().toString())
                .lastModifiedBy("Mock User")
                .build();

        String key = driveId + ":" + (folderId != null && !folderId.isBlank() ? folderId : "root");
        uploadedItems.computeIfAbsent(key, k -> Collections.synchronizedList(new ArrayList<>())).add(uploaded);
        ALL_ITEMS.put(itemId, uploaded);

        log.info("Mock upload: {} → {} ({})", fileName, itemId, formatBytes(contentLength));
        return uploaded;
    }

    @Override
    public SharePointPreviewDto getPreviewUrl(String driveId, String itemId) {
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

    // --- Helpers ---

    private static SharePointItemDto folder(String id, String name) {
        return SharePointItemDto.builder()
                .itemId(id)
                .name(name)
                .webUrl(BASE_URL + "/folder/" + id)
                .size(0)
                .folder(true)
                .lastModified(OffsetDateTime.now().minusDays(7).toString())
                .lastModifiedBy("HR Admin")
                .build();
    }

    private static SharePointItemDto file(String id, String name, String mimeType, long size, String path) {
        return SharePointItemDto.builder()
                .itemId(id)
                .name(name)
                .webUrl(BASE_URL + "/sites/" + path + "/" + name.replace(" ", "%20"))
                .size(size)
                .mimeType(mimeType)
                .folder(false)
                .lastModified(OffsetDateTime.now().minusDays(14).toString())
                .lastModifiedBy("HR Admin")
                .build();
    }

    private String guessMimeType(String fileName) {
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".pdf")) return "application/pdf";
        if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        if (lower.endsWith(".xlsx")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        if (lower.endsWith(".pptx")) return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        return "application/octet-stream";
    }

    private String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        return String.format("%.1f %s", bytes / Math.pow(1024, exp), new String[]{"B", "KB", "MB", "GB"}[exp]);
    }
}
