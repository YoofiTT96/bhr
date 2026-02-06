package com.turntabl.bonarda.domain.document.model;

import com.turntabl.bonarda.domain.common.model.AuditableEntity;
import com.turntabl.bonarda.domain.employee.model.Employee;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document extends AuditableEntity {

    @Column(name = "public_id", nullable = false, updatable = false, unique = true)
    private UUID publicId;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", length = 30, nullable = false)
    @Builder.Default
    private DocumentType documentType = DocumentType.GENERAL;

    @Column(name = "sharepoint_site_id", length = 255)
    private String sharepointSiteId;

    @Column(name = "sharepoint_drive_id", length = 255)
    private String sharepointDriveId;

    @Column(name = "sharepoint_item_id", length = 255)
    private String sharepointItemId;

    @Column(name = "sharepoint_web_url", length = 2000)
    private String sharepointWebUrl;

    @Column(name = "sharepoint_file_name", length = 500)
    private String sharepointFileName;

    @Column(name = "sharepoint_file_size")
    private Long sharepointFileSize;

    @Column(name = "sharepoint_mime_type", length = 255)
    private String sharepointMimeType;

    @Column(name = "company_wide", nullable = false)
    @Builder.Default
    private Boolean companyWide = false;

    @Column(name = "requires_signature", nullable = false)
    @Builder.Default
    private Boolean requiresSignature = false;

    @Column(name = "signature_deadline")
    private LocalDate signatureDeadline;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    @Builder.Default
    private DocumentStatus status = DocumentStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by_id", nullable = false)
    private Employee uploadedBy;

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<DocumentShare> shares = new ArrayList<>();

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<DocumentSignature> signatures = new ArrayList<>();

    @PrePersist
    protected void ensurePublicId() {
        if (publicId == null) publicId = UUID.randomUUID();
    }

    @Transient
    public boolean isSharePointDocument() {
        return sharepointItemId != null && !sharepointItemId.isBlank();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Document)) return false;
        Document that = (Document) o;
        return getId() != null && getId().equals(that.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
