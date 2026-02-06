package com.turntabl.bonarda.domain.document.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignDocumentRequest {

    @NotBlank(message = "Signature data is required")
    private String signatureData;
}
