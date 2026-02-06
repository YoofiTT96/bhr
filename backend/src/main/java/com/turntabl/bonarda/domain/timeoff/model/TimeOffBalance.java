package com.turntabl.bonarda.domain.timeoff.model;

import com.turntabl.bonarda.domain.common.model.AuditableEntity;
import com.turntabl.bonarda.domain.employee.model.Employee;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "time_off_balances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeOffBalance extends AuditableEntity {

    @Column(name = "public_id", nullable = false, updatable = false, unique = true)
    private UUID publicId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "time_off_type_id", nullable = false)
    private TimeOffType timeOffType;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "total_allocated", nullable = false, precision = 5, scale = 1)
    @Builder.Default
    private BigDecimal totalAllocated = BigDecimal.ZERO;

    @Column(nullable = false, precision = 5, scale = 1)
    @Builder.Default
    private BigDecimal used = BigDecimal.ZERO;

    @Column(nullable = false, precision = 5, scale = 1)
    @Builder.Default
    private BigDecimal pending = BigDecimal.ZERO;

    @Column(name = "carry_over", nullable = false, precision = 5, scale = 1)
    @Builder.Default
    private BigDecimal carryOver = BigDecimal.ZERO;

    @Transient
    public BigDecimal getRemaining() {
        return totalAllocated.add(carryOver).subtract(used).subtract(pending);
    }

    @PrePersist
    protected void ensurePublicId() {
        if (publicId == null) {
            publicId = UUID.randomUUID();
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TimeOffBalance)) return false;
        TimeOffBalance that = (TimeOffBalance) o;
        return getId() != null && getId().equals(that.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
