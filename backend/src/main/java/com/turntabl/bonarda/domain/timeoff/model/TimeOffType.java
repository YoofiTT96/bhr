package com.turntabl.bonarda.domain.timeoff.model;

import com.turntabl.bonarda.domain.common.model.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "time_off_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeOffType extends AuditableEntity {

    @Column(name = "public_id", nullable = false, updatable = false, unique = true)
    private UUID publicId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "default_days_per_year", nullable = false)
    @Builder.Default
    private Integer defaultDaysPerYear = 0;

    @Column(name = "carry_over_allowed", nullable = false)
    @Builder.Default
    private Boolean carryOverAllowed = false;

    @Column(name = "max_carry_over_days", nullable = false)
    @Builder.Default
    private Integer maxCarryOverDays = 0;

    @Column(name = "requires_approval", nullable = false)
    @Builder.Default
    private Boolean requiresApproval = true;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_unlimited", nullable = false)
    @Builder.Default
    private Boolean isUnlimited = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "attachment_requirement", nullable = false, length = 20)
    @Builder.Default
    private AttachmentRequirement attachmentRequirement = AttachmentRequirement.NEVER;

    @Column(name = "attachment_required_after_days")
    private Integer attachmentRequiredAfterDays;

    @PrePersist
    protected void ensurePublicId() {
        if (publicId == null) {
            publicId = UUID.randomUUID();
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TimeOffType)) return false;
        TimeOffType that = (TimeOffType) o;
        return getId() != null && getId().equals(that.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
