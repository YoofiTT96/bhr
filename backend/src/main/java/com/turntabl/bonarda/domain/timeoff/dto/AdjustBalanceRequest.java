package com.turntabl.bonarda.domain.timeoff.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class AdjustBalanceRequest {

    @NotNull(message = "Adjustment amount is required")
    private BigDecimal adjustment;

    private String reason;
}
