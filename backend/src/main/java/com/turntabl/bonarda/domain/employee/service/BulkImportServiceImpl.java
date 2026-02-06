package com.turntabl.bonarda.domain.employee.service;

import com.turntabl.bonarda.domain.employee.dto.BulkImportResult;
import com.turntabl.bonarda.domain.employee.dto.ImportRowResult;
import com.turntabl.bonarda.domain.employee.model.Employee;
import com.turntabl.bonarda.domain.employee.model.Role;
import com.turntabl.bonarda.domain.employee.repository.EmployeeRepository;
import com.turntabl.bonarda.domain.employee.repository.RoleRepository;
import com.turntabl.bonarda.domain.timeoff.service.TimeOffBalanceService;
import com.turntabl.bonarda.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class BulkImportServiceImpl implements BulkImportService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private static final String[] HEADERS = {
            "firstName", "lastName", "email", "hireDate",
            "phoneNumber", "position", "location", "birthday",
            "role", "managerEmail"
    };

    private static final Set<String> REQUIRED_HEADERS = Set.of(
            "firstname", "lastname", "email", "hiredate");

    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;
    private final TimeOffBalanceService timeOffBalanceService;

    @Override
    public BulkImportResult importEmployees(MultipartFile file) {
        validateFile(file);

        List<CSVRecord> records;
        Set<String> headerNames;
        try (CSVParser parser = new CSVParser(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8),
                CSVFormat.DEFAULT.builder()
                        .setHeader()
                        .setIgnoreHeaderCase(true)
                        .setTrim(true)
                        .setSkipHeaderRecord(true)
                        .build())) {

            headerNames = parser.getHeaderMap().keySet();
            records = parser.getRecords();
        } catch (IOException e) {
            throw new BadRequestException("Failed to parse CSV file: " + e.getMessage());
        }

        validateHeaders(headerNames);

        if (records.isEmpty()) {
            throw new BadRequestException("CSV file contains no data rows");
        }

        // Pass 1: Validate all rows
        List<ParsedRow> parsedRows = new ArrayList<>();
        Set<String> seenEmails = new HashSet<>();

        for (CSVRecord record : records) {
            parsedRows.add(validateRow(record, seenEmails, headerNames));
        }

        // Pass 2: Persist valid rows
        List<ImportRowResult> results = new ArrayList<>();
        int successCount = 0;
        int failureCount = 0;

        for (ParsedRow row : parsedRows) {
            if (!row.errors.isEmpty()) {
                String status = row.skipped ? "SKIPPED" : "FAILED";
                results.add(ImportRowResult.builder()
                        .rowNumber(row.rowNumber)
                        .email(row.email)
                        .status(status)
                        .errors(row.errors)
                        .build());
                failureCount++;
                continue;
            }

            try {
                Employee employee = Employee.builder()
                        .firstName(row.firstName)
                        .lastName(row.lastName)
                        .email(row.email)
                        .phoneNumber(row.phoneNumber)
                        .position(row.position)
                        .location(row.location)
                        .birthday(row.birthday)
                        .hireDate(row.hireDate)
                        .build();

                if (row.role != null) {
                    employee.setRoles(Set.of(row.role));
                }
                if (row.manager != null) {
                    employee.setReportsTo(row.manager);
                }

                Employee saved = employeeRepository.save(employee);
                timeOffBalanceService.initializeBalancesForEmployee(saved, LocalDate.now().getYear());

                results.add(ImportRowResult.builder()
                        .rowNumber(row.rowNumber)
                        .email(row.email)
                        .status("SUCCESS")
                        .employeeId(saved.getPublicId().toString())
                        .errors(List.of())
                        .build());
                successCount++;
            } catch (Exception e) {
                log.error("Failed to save employee at row {}: {}", row.rowNumber, e.getMessage());
                results.add(ImportRowResult.builder()
                        .rowNumber(row.rowNumber)
                        .email(row.email)
                        .status("FAILED")
                        .errors(List.of("Failed to save: " + e.getMessage()))
                        .build());
                failureCount++;
            }
        }

        log.info("Bulk import complete: {} total, {} succeeded, {} failed",
                results.size(), successCount, failureCount);

        return BulkImportResult.builder()
                .totalRows(results.size())
                .successCount(successCount)
                .failureCount(failureCount)
                .results(results)
                .build();
    }

    @Override
    public byte[] generateTemplate() {
        StringWriter writer = new StringWriter();
        try (CSVPrinter printer = new CSVPrinter(writer,
                CSVFormat.DEFAULT.builder().setHeader(HEADERS).build())) {
            printer.printRecord(
                    "Jane", "Doe", "jane.doe@company.com", "2024-01-15",
                    "+1234567890", "Software Engineer", "Accra, Ghana", "1990-05-20",
                    "EMPLOYEE", "manager@company.com");
            printer.printRecord(
                    "John", "Smith", "john.smith@company.com", "2024-02-01",
                    "", "Product Manager", "London, UK", "",
                    "MANAGER", "");
        } catch (IOException e) {
            throw new BadRequestException("Failed to generate CSV template");
        }
        return writer.toString().getBytes(StandardCharsets.UTF_8);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("CSV file is required");
        }
        String filename = file.getOriginalFilename();
        if (filename != null && !filename.toLowerCase().endsWith(".csv")) {
            throw new BadRequestException("File must be a CSV (.csv)");
        }
    }

    private void validateHeaders(Set<String> headerNames) {
        Set<String> lowerHeaders = new HashSet<>();
        for (String h : headerNames) {
            lowerHeaders.add(h.toLowerCase());
        }
        List<String> missing = new ArrayList<>();
        for (String required : REQUIRED_HEADERS) {
            if (!lowerHeaders.contains(required)) {
                missing.add(required);
            }
        }
        if (!missing.isEmpty()) {
            throw new BadRequestException("CSV is missing required headers: " + String.join(", ", missing));
        }
    }

    private ParsedRow validateRow(CSVRecord record, Set<String> seenEmails, Set<String> headerNames) {
        ParsedRow row = new ParsedRow();
        row.rowNumber = (int) record.getRecordNumber();
        row.errors = new ArrayList<>();

        // Required fields
        row.firstName = getField(record, "firstName", headerNames);
        if (row.firstName == null || row.firstName.isBlank()) {
            row.errors.add("firstName is required");
        }

        row.lastName = getField(record, "lastName", headerNames);
        if (row.lastName == null || row.lastName.isBlank()) {
            row.errors.add("lastName is required");
        }

        row.email = getField(record, "email", headerNames);
        if (row.email == null || row.email.isBlank()) {
            row.errors.add("email is required");
        } else {
            row.email = row.email.toLowerCase();
            if (!EMAIL_PATTERN.matcher(row.email).matches()) {
                row.errors.add("Invalid email format");
            } else if (!seenEmails.add(row.email)) {
                row.errors.add("Duplicate email within CSV");
            } else if (employeeRepository.existsByEmail(row.email)) {
                row.errors.add("Employee with this email already exists");
                row.skipped = true;
            }
        }

        String hireDateStr = getField(record, "hireDate", headerNames);
        if (hireDateStr == null || hireDateStr.isBlank()) {
            row.errors.add("hireDate is required");
        } else {
            try {
                row.hireDate = LocalDate.parse(hireDateStr);
            } catch (DateTimeParseException e) {
                row.errors.add("Invalid hireDate format (expected yyyy-MM-dd)");
            }
        }

        // Optional fields
        row.phoneNumber = getField(record, "phoneNumber", headerNames);
        row.position = getField(record, "position", headerNames);
        row.location = getField(record, "location", headerNames);

        String birthdayStr = getField(record, "birthday", headerNames);
        if (birthdayStr != null && !birthdayStr.isBlank()) {
            try {
                row.birthday = LocalDate.parse(birthdayStr);
            } catch (DateTimeParseException e) {
                row.errors.add("Invalid birthday format (expected yyyy-MM-dd)");
            }
        }

        String roleName = getField(record, "role", headerNames);
        if (roleName != null && !roleName.isBlank()) {
            Optional<Role> roleOpt = roleRepository.findByName(roleName.toUpperCase());
            if (roleOpt.isEmpty()) {
                row.errors.add("Role '" + roleName + "' not found");
            } else {
                row.role = roleOpt.get();
            }
        }

        String managerEmail = getField(record, "managerEmail", headerNames);
        if (managerEmail != null && !managerEmail.isBlank()) {
            Optional<Employee> managerOpt = employeeRepository.findByEmail(managerEmail.toLowerCase());
            if (managerOpt.isEmpty()) {
                row.errors.add("Manager with email '" + managerEmail + "' not found");
            } else {
                row.manager = managerOpt.get();
            }
        }

        return row;
    }

    private String getField(CSVRecord record, String name, Set<String> headerNames) {
        // Find the actual header name (case-insensitive match)
        for (String h : headerNames) {
            if (h.equalsIgnoreCase(name)) {
                try {
                    String value = record.get(h);
                    if (value == null || value.isBlank()) return null;
                    return sanitizeCsvValue(value.trim());
                } catch (IllegalArgumentException e) {
                    return null;
                }
            }
        }
        return null;
    }

    /**
     * Prevent CSV injection by stripping leading characters that trigger formula
     * execution in spreadsheet applications (=, +, -, @, tab, carriage return).
     */
    private String sanitizeCsvValue(String value) {
        if (value.isEmpty()) return value;
        char first = value.charAt(0);
        if (first == '=' || first == '+' || first == '-' || first == '@' || first == '\t' || first == '\r') {
            return "'" + value;
        }
        return value;
    }

    private static class ParsedRow {
        int rowNumber;
        String firstName;
        String lastName;
        String email;
        LocalDate hireDate;
        String phoneNumber;
        String position;
        String location;
        LocalDate birthday;
        Role role;
        Employee manager;
        boolean skipped;
        List<String> errors;
    }
}
