package com.turntabl.bonarda.domain.employee.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class BulkImportResult {
    private int totalRows;
    private int successCount;
    private int failureCount;
    private List<ImportRowResult> results;
}
