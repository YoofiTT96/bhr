package com.turntabl.bonarda.domain.employee.service;

import com.turntabl.bonarda.domain.employee.dto.BulkImportResult;
import org.springframework.web.multipart.MultipartFile;

public interface BulkImportService {
    BulkImportResult importEmployees(MultipartFile file);
    byte[] generateTemplate();
}
