package com.turntabl.bonarda.config;

import com.turntabl.bonarda.domain.employee.model.Employee;
import com.turntabl.bonarda.domain.employee.model.EmployeeStatus;
import com.turntabl.bonarda.domain.employee.model.Role;
import com.turntabl.bonarda.domain.employee.repository.EmployeeRepository;
import com.turntabl.bonarda.domain.employee.repository.RoleRepository;
import com.turntabl.bonarda.domain.timeoff.model.*;
import com.turntabl.bonarda.domain.timeoff.repository.TimeOffBalanceRepository;
import com.turntabl.bonarda.domain.timeoff.repository.TimeOffRequestRepository;
import com.turntabl.bonarda.domain.timeoff.repository.TimeOffTypeRepository;
import com.turntabl.bonarda.domain.timesheet.model.Timesheet;
import com.turntabl.bonarda.domain.timesheet.model.TimesheetEntry;
import com.turntabl.bonarda.domain.timesheet.model.TimesheetStatus;
import com.turntabl.bonarda.domain.timesheet.repository.TimesheetRepository;
import com.turntabl.bonarda.domain.project.model.*;
import com.turntabl.bonarda.domain.project.repository.ClientRepository;
import com.turntabl.bonarda.domain.project.repository.ProjectRepository;
import com.turntabl.bonarda.domain.project.repository.ProjectAssignmentRepository;
import com.turntabl.bonarda.domain.project.repository.ProjectTimeLogRepository;
import com.turntabl.bonarda.domain.document.model.*;
import com.turntabl.bonarda.domain.document.repository.DocumentRepository;
import com.turntabl.bonarda.domain.document.repository.DocumentShareRepository;
import com.turntabl.bonarda.domain.document.repository.DocumentSignatureRepository;
import com.turntabl.bonarda.domain.event.model.CompanyEvent;
import com.turntabl.bonarda.domain.event.model.EventType;
import com.turntabl.bonarda.domain.event.repository.CompanyEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DevDataSeeder implements CommandLineRunner {

    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;
    private final TimeOffTypeRepository timeOffTypeRepository;
    private final TimeOffBalanceRepository timeOffBalanceRepository;
    private final TimeOffRequestRepository timeOffRequestRepository;
    private final TimesheetRepository timesheetRepository;
    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final ProjectAssignmentRepository projectAssignmentRepository;
    private final ProjectTimeLogRepository projectTimeLogRepository;
    private final DocumentRepository documentRepository;
    private final DocumentShareRepository documentShareRepository;
    private final DocumentSignatureRepository documentSignatureRepository;
    private final CompanyEventRepository companyEventRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (employeeRepository.count() > 0) {
            log.info("Database already seeded, skipping...");
            return;
        }

        log.info("Seeding development data...");

        // Load roles (seeded by Flyway migration)
        Role adminRole = roleRepository.findByName("ADMIN").orElseThrow();
        Role hrManagerRole = roleRepository.findByName("HR_MANAGER").orElseThrow();
        Role managerRole = roleRepository.findByName("MANAGER").orElseThrow();
        Role employeeRole = roleRepository.findByName("EMPLOYEE").orElseThrow();

        // CEO - ADMIN role
        Employee ceo = employeeRepository.save(Employee.builder()
                .firstName("Amara")
                .lastName("Osei")
                .email("amara.osei@turntabl.io")
                .phoneNumber("+233201234567")
                .position("CEO")
                .location("Accra, Ghana")
                .birthday(LocalDate.of(1980, 3, 15))
                .hireDate(LocalDate.of(2018, 1, 1))
                .status(EmployeeStatus.ACTIVE)
                .roles(Set.of(adminRole))
                .build());

        // CTO reports to CEO - MANAGER role
        Employee cto = employeeRepository.save(Employee.builder()
                .firstName("Kwame")
                .lastName("Mensah")
                .email("kwame.mensah@turntabl.io")
                .phoneNumber("+233207654321")
                .position("CTO")
                .location("Accra, Ghana")
                .birthday(LocalDate.of(1985, 7, 22))
                .hireDate(LocalDate.of(2018, 3, 15))
                .status(EmployeeStatus.ACTIVE)
                .reportsTo(ceo)
                .roles(Set.of(managerRole))
                .build());

        // VP of HR reports to CEO - HR_MANAGER role
        Employee vpHr = employeeRepository.save(Employee.builder()
                .firstName("Esi")
                .lastName("Adjei")
                .email("esi.adjei@turntabl.io")
                .phoneNumber("+233209876543")
                .position("VP of Human Resources")
                .location("Accra, Ghana")
                .birthday(LocalDate.of(1988, 11, 3))
                .hireDate(LocalDate.of(2019, 6, 1))
                .status(EmployeeStatus.ACTIVE)
                .reportsTo(ceo)
                .roles(Set.of(hrManagerRole))
                .build());

        // Engineering Manager reports to CTO - MANAGER role
        Employee engManager = employeeRepository.save(Employee.builder()
                .firstName("Kofi")
                .lastName("Boateng")
                .email("kofi.boateng@turntabl.io")
                .phoneNumber("+233202345678")
                .position("Engineering Manager")
                .location("Accra, Ghana")
                .birthday(LocalDate.of(1990, 5, 10))
                .hireDate(LocalDate.of(2020, 2, 1))
                .status(EmployeeStatus.ACTIVE)
                .reportsTo(cto)
                .roles(Set.of(managerRole))
                .build());

        // Senior Developer - EMPLOYEE role
        Employee akua = employeeRepository.save(Employee.builder()
                .firstName("Akua")
                .lastName("Darko")
                .email("akua.darko@turntabl.io")
                .phoneNumber("+233203456789")
                .position("Senior Software Developer")
                .location("Kumasi, Ghana")
                .birthday(LocalDate.of(1992, 8, 25))
                .hireDate(LocalDate.of(2021, 1, 15))
                .status(EmployeeStatus.ACTIVE)
                .reportsTo(engManager)
                .microsoftUserId("mock-ms-user-akua-darko")
                .roles(Set.of(employeeRole))
                .build());

        // Developer - EMPLOYEE role
        Employee yaw = employeeRepository.save(Employee.builder()
                .firstName("Yaw")
                .lastName("Asante")
                .email("yaw.asante@turntabl.io")
                .phoneNumber("+233204567890")
                .position("Software Developer")
                .location("Accra, Ghana")
                .birthday(LocalDate.of(1995, 12, 1))
                .hireDate(LocalDate.of(2022, 6, 1))
                .status(EmployeeStatus.ACTIVE)
                .reportsTo(engManager)
                .microsoftUserId("mock-ms-user-yaw-asante")
                .roles(Set.of(employeeRole))
                .build());

        // Junior Developer - EMPLOYEE role
        Employee abena = employeeRepository.save(Employee.builder()
                .firstName("Abena")
                .lastName("Owusu")
                .email("abena.owusu@turntabl.io")
                .phoneNumber("+233205678901")
                .position("Junior Software Developer")
                .location("Accra, Ghana")
                .birthday(LocalDate.of(1998, 4, 18))
                .hireDate(LocalDate.of(2023, 9, 1))
                .status(EmployeeStatus.ACTIVE)
                .reportsTo(engManager)
                .microsoftUserId("mock-ms-user-abena-owusu")
                .roles(Set.of(employeeRole))
                .build());

        // HR Specialist - EMPLOYEE role
        Employee nana = employeeRepository.save(Employee.builder()
                .firstName("Nana")
                .lastName("Appiah")
                .email("nana.appiah@turntabl.io")
                .phoneNumber("+233206789012")
                .position("HR Specialist")
                .location("Accra, Ghana")
                .birthday(LocalDate.of(1993, 2, 14))
                .hireDate(LocalDate.of(2021, 4, 1))
                .status(EmployeeStatus.ACTIVE)
                .reportsTo(vpHr)
                .roles(Set.of(employeeRole))
                .build());

        // On Leave employee - EMPLOYEE role
        Employee kwesi = employeeRepository.save(Employee.builder()
                .firstName("Kwesi")
                .lastName("Tetteh")
                .email("kwesi.tetteh@turntabl.io")
                .phoneNumber("+233207890123")
                .position("Product Designer")
                .location("Takoradi, Ghana")
                .birthday(LocalDate.of(1991, 9, 7))
                .hireDate(LocalDate.of(2020, 11, 1))
                .status(EmployeeStatus.ON_LEAVE)
                .reportsTo(cto)
                .roles(Set.of(employeeRole))
                .build());

        // Full Stack Developer - EMPLOYEE role
        Employee efua = employeeRepository.save(Employee.builder()
                .firstName("Efua")
                .lastName("Mensah")
                .email("efua.mensah@turntabl.io")
                .phoneNumber("+233208901234")
                .position("Full Stack Developer")
                .location("Accra, Ghana")
                .birthday(LocalDate.of(1994, 6, 30))
                .hireDate(LocalDate.of(2022, 1, 10))
                .status(EmployeeStatus.ACTIVE)
                .reportsTo(engManager)
                .roles(Set.of(employeeRole))
                .build());

        log.info("Development data seeded: {} employees created", employeeRepository.count());

        // --- Time Off Seeding ---
        seedTimeOffData(ceo, cto, vpHr, engManager, akua, yaw, abena, nana, kwesi, efua);

        // --- Timesheet Seeding ---
        seedTimesheetData(engManager, akua, yaw, abena, efua);

        // --- Project & Client Seeding ---
        seedProjectData(engManager, akua, yaw, abena, efua);

        // --- Document Seeding ---
        seedDocumentData(vpHr, engManager, akua, yaw, abena, efua);

        // --- Company Events Seeding ---
        seedEventData(vpHr, engManager);
    }

    private void seedTimeOffData(Employee ceo, Employee cto, Employee vpHr, Employee engManager,
                                  Employee akua, Employee yaw, Employee abena, Employee nana,
                                  Employee kwesi, Employee efua) {
        // Load time off types (seeded by V4 migration)
        List<TimeOffType> types = timeOffTypeRepository.findByIsActiveTrue();
        if (types.isEmpty()) {
            log.warn("No time off types found, skipping time off seeding");
            return;
        }

        TimeOffType annualLeave = timeOffTypeRepository.findByName("Annual Leave").orElseThrow();
        TimeOffType sickLeave = timeOffTypeRepository.findByName("Sick Leave").orElseThrow();
        TimeOffType personalLeave = timeOffTypeRepository.findByName("Personal Leave").orElseThrow();

        int currentYear = LocalDate.now().getYear();
        List<Employee> allEmployees = List.of(ceo, cto, vpHr, engManager, akua, yaw, abena, nana, kwesi, efua);

        // Initialize balances for all employees for all active types
        for (Employee employee : allEmployees) {
            for (TimeOffType type : types) {
                timeOffBalanceRepository.save(TimeOffBalance.builder()
                        .employee(employee)
                        .timeOffType(type)
                        .year(currentYear)
                        .totalAllocated(BigDecimal.valueOf(type.getDefaultDaysPerYear()))
                        .build());
            }
        }

        log.info("Time off balances initialized for {} employees", allEmployees.size());

        // Sample request 1: Akua - APPROVED 5-day annual leave
        TimeOffRequest akuaRequest = timeOffRequestRepository.save(TimeOffRequest.builder()
                .employee(akua)
                .timeOffType(annualLeave)
                .startDate(LocalDate.now().minusDays(30))
                .endDate(LocalDate.now().minusDays(24))
                .businessDays(new BigDecimal("5"))
                .reason("Family vacation")
                .status(TimeOffRequestStatus.APPROVED)
                .reviewer(engManager)
                .reviewNote("Enjoy your vacation!")
                .reviewedAt(LocalDateTime.now().minusDays(35))
                .calendarEventId("mock-event-seed-akua-annual")
                .build());

        // Update Akua's annual leave balance: used=5
        timeOffBalanceRepository.findByEmployeeIdAndTimeOffTypeIdAndYear(
                akua.getId(), annualLeave.getId(), currentYear).ifPresent(balance -> {
            balance.setUsed(new BigDecimal("5"));
            timeOffBalanceRepository.save(balance);
        });

        // Sample request 2: Yaw - PENDING 2-day annual leave
        timeOffRequestRepository.save(TimeOffRequest.builder()
                .employee(yaw)
                .timeOffType(annualLeave)
                .startDate(LocalDate.now().plusDays(10))
                .endDate(LocalDate.now().plusDays(11))
                .businessDays(new BigDecimal("2"))
                .reason("Personal errands")
                .status(TimeOffRequestStatus.PENDING)
                .build());

        // Update Yaw's annual leave balance: pending=2
        timeOffBalanceRepository.findByEmployeeIdAndTimeOffTypeIdAndYear(
                yaw.getId(), annualLeave.getId(), currentYear).ifPresent(balance -> {
            balance.setPending(new BigDecimal("2"));
            timeOffBalanceRepository.save(balance);
        });

        // Sample request 3: Abena - PENDING half-day sick leave
        timeOffRequestRepository.save(TimeOffRequest.builder()
                .employee(abena)
                .timeOffType(sickLeave)
                .startDate(LocalDate.now().plusDays(3))
                .endDate(LocalDate.now().plusDays(3))
                .halfDay(true)
                .halfDayPeriod(HalfDayPeriod.MORNING)
                .businessDays(new BigDecimal("0.5"))
                .reason("Doctor appointment")
                .status(TimeOffRequestStatus.PENDING)
                .build());

        // Update Abena's sick leave balance: pending=0.5
        timeOffBalanceRepository.findByEmployeeIdAndTimeOffTypeIdAndYear(
                abena.getId(), sickLeave.getId(), currentYear).ifPresent(balance -> {
            balance.setPending(new BigDecimal("0.5"));
            timeOffBalanceRepository.save(balance);
        });

        // Sample request 4: Nana - REJECTED personal leave
        timeOffRequestRepository.save(TimeOffRequest.builder()
                .employee(nana)
                .timeOffType(personalLeave)
                .startDate(LocalDate.now().plusDays(5))
                .endDate(LocalDate.now().plusDays(5))
                .businessDays(new BigDecimal("1"))
                .reason("Moving to a new apartment")
                .status(TimeOffRequestStatus.REJECTED)
                .reviewer(vpHr)
                .reviewNote("Please reschedule to next week, we have an important event")
                .reviewedAt(LocalDateTime.now().minusDays(2))
                .build());

        log.info("Time off sample requests created");
    }

    private void seedTimesheetData(Employee engManager, Employee akua, Employee yaw,
                                    Employee abena, Employee efua) {
        LocalDate today = LocalDate.now();
        LocalDate thisMonday = today.with(DayOfWeek.MONDAY);

        // 1. Akua — 2 weeks ago: APPROVED (40h, Mon-Fri @ 8h, reviewed by Kofi)
        LocalDate akuaWeekStart = thisMonday.minusWeeks(2);
        Timesheet akuaTimesheet = Timesheet.builder()
                .employee(akua)
                .weekStart(akuaWeekStart)
                .status(TimesheetStatus.APPROVED)
                .totalHours(new BigDecimal("40.0"))
                .submittedAt(akuaWeekStart.plusDays(5).atTime(17, 0))
                .reviewer(engManager)
                .reviewNote("Looks good, approved.")
                .reviewedAt(akuaWeekStart.plusDays(6).atTime(9, 0))
                .build();
        for (int d = 0; d < 5; d++) {
            akuaTimesheet.getEntries().add(TimesheetEntry.builder()
                    .timesheet(akuaTimesheet)
                    .entryDate(akuaWeekStart.plusDays(d))
                    .clockIn(LocalTime.of(9, 0))
                    .clockOut(LocalTime.of(17, 0))
                    .hours(new BigDecimal("8.0"))
                    .build());
        }
        timesheetRepository.save(akuaTimesheet);

        // 2. Yaw — last week: SUBMITTED (38h, Mon-Fri with varied hours)
        LocalDate yawWeekStart = thisMonday.minusWeeks(1);
        Timesheet yawTimesheet = Timesheet.builder()
                .employee(yaw)
                .weekStart(yawWeekStart)
                .status(TimesheetStatus.SUBMITTED)
                .totalHours(new BigDecimal("38.0"))
                .submittedAt(yawWeekStart.plusDays(5).atTime(16, 30))
                .build();
        BigDecimal[] yawHours = {
                new BigDecimal("8.0"), new BigDecimal("7.5"), new BigDecimal("8.5"),
                new BigDecimal("7.0"), new BigDecimal("7.0")
        };
        for (int d = 0; d < 5; d++) {
            yawTimesheet.getEntries().add(TimesheetEntry.builder()
                    .timesheet(yawTimesheet)
                    .entryDate(yawWeekStart.plusDays(d))
                    .hours(yawHours[d])
                    .build());
        }
        timesheetRepository.save(yawTimesheet);

        // 3. Abena — current week: DRAFT (24h, Mon-Wed @ 8h)
        Timesheet abenaTimesheet = Timesheet.builder()
                .employee(abena)
                .weekStart(thisMonday)
                .status(TimesheetStatus.DRAFT)
                .totalHours(new BigDecimal("24.0"))
                .build();
        for (int d = 0; d < 3; d++) {
            abenaTimesheet.getEntries().add(TimesheetEntry.builder()
                    .timesheet(abenaTimesheet)
                    .entryDate(thisMonday.plusDays(d))
                    .clockIn(LocalTime.of(8, 30))
                    .clockOut(LocalTime.of(16, 30))
                    .hours(new BigDecimal("8.0"))
                    .build());
        }
        timesheetRepository.save(abenaTimesheet);

        // 4. Efua — 3 weeks ago: REJECTED (32h, Mon-Thu, missing Friday)
        LocalDate efuaWeekStart = thisMonday.minusWeeks(3);
        Timesheet efuaTimesheet = Timesheet.builder()
                .employee(efua)
                .weekStart(efuaWeekStart)
                .status(TimesheetStatus.REJECTED)
                .totalHours(new BigDecimal("32.0"))
                .submittedAt(efuaWeekStart.plusDays(4).atTime(17, 0))
                .reviewer(engManager)
                .reviewNote("Missing Friday entry. Please add all working days.")
                .reviewedAt(efuaWeekStart.plusDays(5).atTime(10, 0))
                .build();
        for (int d = 0; d < 4; d++) {
            efuaTimesheet.getEntries().add(TimesheetEntry.builder()
                    .timesheet(efuaTimesheet)
                    .entryDate(efuaWeekStart.plusDays(d))
                    .hours(new BigDecimal("8.0"))
                    .build());
        }
        timesheetRepository.save(efuaTimesheet);

        log.info("Timesheet sample data created: 4 timesheets");
    }

    private void seedProjectData(Employee engManager, Employee akua, Employee yaw,
                                  Employee abena, Employee efua) {
        // --- Clients ---
        Client financeCorp = clientRepository.save(Client.builder()
                .name("FinanceCorp")
                .industry("Financial Services")
                .contactName("Daniel Kwarteng")
                .contactEmail("daniel@financecorp.com")
                .contactPhone("+233301234567")
                .website("https://financecorp.example.com")
                .notes("Long-term strategic partner")
                .build());

        Client healthTech = clientRepository.save(Client.builder()
                .name("HealthTech Solutions")
                .industry("Health Technology")
                .contactName("Adjoa Mensah")
                .contactEmail("adjoa@healthtech.com")
                .contactPhone("+233309876543")
                .website("https://healthtech.example.com")
                .notes("New client, high growth potential")
                .build());

        log.info("Clients seeded: FinanceCorp, HealthTech Solutions");

        // --- Projects ---

        // 1. FinanceCorp Portal — ACTIVE
        Project fcPortal = projectRepository.save(Project.builder()
                .client(financeCorp)
                .name("FinanceCorp Portal")
                .description("Client-facing web portal for financial reporting and analytics")
                .status(ProjectStatus.ACTIVE)
                .startDate(LocalDate.now().minusMonths(3))
                .endDate(LocalDate.now().plusMonths(6))
                .budget(new BigDecimal("150000.00"))
                .build());

        projectAssignmentRepository.save(ProjectAssignment.builder()
                .project(fcPortal).employee(engManager).role(ProjectAssignmentRole.LEAD).build());
        projectAssignmentRepository.save(ProjectAssignment.builder()
                .project(fcPortal).employee(akua).role(ProjectAssignmentRole.MEMBER).build());
        projectAssignmentRepository.save(ProjectAssignment.builder()
                .project(fcPortal).employee(yaw).role(ProjectAssignmentRole.MEMBER).build());

        // 2. Health Dashboard — ACTIVE
        Project healthDash = projectRepository.save(Project.builder()
                .client(healthTech)
                .name("Health Dashboard")
                .description("Real-time patient monitoring dashboard for hospital staff")
                .status(ProjectStatus.ACTIVE)
                .startDate(LocalDate.now().minusMonths(1))
                .endDate(LocalDate.now().plusMonths(9))
                .budget(new BigDecimal("200000.00"))
                .build());

        projectAssignmentRepository.save(ProjectAssignment.builder()
                .project(healthDash).employee(akua).role(ProjectAssignmentRole.LEAD).build());
        projectAssignmentRepository.save(ProjectAssignment.builder()
                .project(healthDash).employee(abena).role(ProjectAssignmentRole.MEMBER).build());
        projectAssignmentRepository.save(ProjectAssignment.builder()
                .project(healthDash).employee(efua).role(ProjectAssignmentRole.MEMBER).build());

        // 3. FinanceCorp Mobile App — ON_HOLD
        Project fcMobile = projectRepository.save(Project.builder()
                .client(financeCorp)
                .name("FinanceCorp Mobile App")
                .description("Native mobile application for FinanceCorp's retail customers")
                .status(ProjectStatus.ON_HOLD)
                .startDate(LocalDate.now().minusWeeks(2))
                .budget(new BigDecimal("90000.00"))
                .build());

        projectAssignmentRepository.save(ProjectAssignment.builder()
                .project(fcMobile).employee(yaw).role(ProjectAssignmentRole.LEAD).build());

        log.info("Projects seeded: 3 projects with assignments");

        // --- Time Logs for FinanceCorp Portal (~50h) ---
        LocalDate logStart = LocalDate.now().minusWeeks(2).with(DayOfWeek.MONDAY);
        for (int week = 0; week < 2; week++) {
            LocalDate weekStart = logStart.plusWeeks(week);
            for (int day = 0; day < 5; day++) {
                LocalDate logDate = weekStart.plusDays(day);
                // Kofi: 2h/day
                projectTimeLogRepository.save(ProjectTimeLog.builder()
                        .project(fcPortal).employee(engManager).logDate(logDate)
                        .hours(new BigDecimal("2.0")).description("Project oversight and code review").build());
                // Akua: 4h/day
                projectTimeLogRepository.save(ProjectTimeLog.builder()
                        .project(fcPortal).employee(akua).logDate(logDate)
                        .hours(new BigDecimal("4.0")).description("Backend API development").build());
                // Yaw: 3h/day first week, 2h/day second week
                BigDecimal yawHrs = week == 0 ? new BigDecimal("3.0") : new BigDecimal("2.0");
                projectTimeLogRepository.save(ProjectTimeLog.builder()
                        .project(fcPortal).employee(yaw).logDate(logDate)
                        .hours(yawHrs).description("Frontend component implementation").build());
            }
        }
        // Total: Kofi 20h + Akua 40h + Yaw 25h = 85h (generous for demo)

        // --- Time Logs for Health Dashboard (~40h) ---
        for (int week = 0; week < 2; week++) {
            LocalDate weekStart = logStart.plusWeeks(week);
            for (int day = 0; day < 5; day++) {
                LocalDate logDate = weekStart.plusDays(day);
                // Akua: 2h/day
                projectTimeLogRepository.save(ProjectTimeLog.builder()
                        .project(healthDash).employee(akua).logDate(logDate)
                        .hours(new BigDecimal("2.0")).description("Architecture design and mentoring").build());
                // Abena: 3h/day
                projectTimeLogRepository.save(ProjectTimeLog.builder()
                        .project(healthDash).employee(abena).logDate(logDate)
                        .hours(new BigDecimal("3.0")).description("Dashboard UI development").build());
                // Efua: 2h/day first week only
                if (week == 0) {
                    projectTimeLogRepository.save(ProjectTimeLog.builder()
                            .project(healthDash).employee(efua).logDate(logDate)
                            .hours(new BigDecimal("2.0")).description("API integration work").build());
                }
            }
        }
        // Total: Akua 20h + Abena 30h + Efua 10h = 60h

        log.info("Project time logs seeded");
    }

    private void seedDocumentData(Employee vpHr, Employee engManager, Employee akua,
                                   Employee yaw, Employee abena, Employee efua) {
        // 1. Employee Code of Conduct 2025 — POLICY, requires signature
        Document codeOfConduct = documentRepository.save(Document.builder()
                .title("Employee Code of Conduct 2025")
                .description("Company-wide code of conduct policy that all employees must acknowledge and sign.")
                .documentType(DocumentType.POLICY)
                .requiresSignature(true)
                .signatureDeadline(LocalDate.now().plusDays(30))
                .status(DocumentStatus.ACTIVE)
                .uploadedBy(vpHr)
                .build());

        // Share with 4 engineers + create signature requests
        for (Employee emp : List.of(akua, yaw, abena, efua)) {
            documentShareRepository.save(DocumentShare.builder()
                    .document(codeOfConduct).employee(emp).sharedBy(vpHr).build());
            SignatureStatus sigStatus = emp.equals(akua) ? SignatureStatus.SIGNED : SignatureStatus.PENDING;
            DocumentSignature sig = DocumentSignature.builder()
                    .document(codeOfConduct).employee(emp).status(sigStatus).build();
            if (sigStatus == SignatureStatus.SIGNED) {
                sig.setSignedAt(LocalDateTime.now().minusDays(5));
                sig.setIpAddress("192.168.1.100");
                sig.setUserAgent("Mozilla/5.0");
                sig.setSignatureData("data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=="); // placeholder
            }
            documentSignatureRepository.save(sig);
        }

        // 2. New Hire Onboarding Checklist — ONBOARDING, simulated SharePoint doc
        Document onboarding = documentRepository.save(Document.builder()
                .title("New Hire Onboarding Checklist")
                .description("Step-by-step checklist for onboarding new team members.")
                .documentType(DocumentType.ONBOARDING)
                .sharepointWebUrl("https://turntabl.sharepoint.com/sites/HR/Shared%20Documents/Onboarding_Checklist.pdf")
                .sharepointFileName("Onboarding_Checklist.pdf")
                .sharepointFileSize(245000L)
                .sharepointMimeType("application/pdf")
                .sharepointItemId("simulated-item-id-001")
                .status(DocumentStatus.ACTIVE)
                .uploadedBy(vpHr)
                .build());

        DocumentShare abenaShare = documentShareRepository.save(DocumentShare.builder()
                .document(onboarding).employee(abena).sharedBy(vpHr).build());
        abenaShare.setViewedAt(LocalDateTime.now().minusDays(2));
        documentShareRepository.save(abenaShare);
        documentShareRepository.save(DocumentShare.builder()
                .document(onboarding).employee(efua).sharedBy(vpHr).build());

        // 3. Non-Disclosure Agreement 2025 — CONTRACT, requires signature, both signed
        Document nda = documentRepository.save(Document.builder()
                .title("Non-Disclosure Agreement 2025")
                .description("Standard NDA for all engineering staff working on client projects.")
                .documentType(DocumentType.CONTRACT)
                .requiresSignature(true)
                .status(DocumentStatus.ACTIVE)
                .uploadedBy(vpHr)
                .build());

        for (Employee emp : List.of(akua, yaw)) {
            documentShareRepository.save(DocumentShare.builder()
                    .document(nda).employee(emp).sharedBy(vpHr).build());
            documentSignatureRepository.save(DocumentSignature.builder()
                    .document(nda).employee(emp).status(SignatureStatus.SIGNED)
                    .signedAt(LocalDateTime.now().minusDays(10))
                    .ipAddress("192.168.1.101")
                    .userAgent("Mozilla/5.0")
                    .signatureData("data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==")
                    .build());
        }

        // 4. Q3 2024 Benefits Summary — GENERAL, ARCHIVED, no shares
        documentRepository.save(Document.builder()
                .title("Q3 2024 Benefits Summary")
                .description("Overview of employee benefits for Q3 2024. This document has been archived.")
                .documentType(DocumentType.GENERAL)
                .status(DocumentStatus.ARCHIVED)
                .uploadedBy(vpHr)
                .build());

        // 5. IT Security Policy 2025 — COMPLIANCE, company-wide
        documentRepository.save(Document.builder()
                .title("IT Security Policy 2025")
                .description("Mandatory IT security guidelines for all employees. Covers password policies, data handling, and acceptable use.")
                .documentType(DocumentType.COMPLIANCE)
                .companyWide(true)
                .requiresSignature(false)
                .status(DocumentStatus.ACTIVE)
                .uploadedBy(engManager)
                .build());

        // 6. Employee Benefits Guide 2025 — GENERAL, company-wide
        documentRepository.save(Document.builder()
                .title("Employee Benefits Guide 2025")
                .description("Comprehensive guide to employee benefits including health insurance, retirement plans, and wellness programs.")
                .documentType(DocumentType.GENERAL)
                .companyWide(true)
                .requiresSignature(false)
                .status(DocumentStatus.ACTIVE)
                .uploadedBy(vpHr)
                .build());

        log.info("Document sample data created: 6 documents with shares, signatures, and company-wide docs");
    }

    private void seedEventData(Employee vpHr, Employee engManager) {
        LocalDate today = LocalDate.now();
        LocalDate thisMonday = today.with(DayOfWeek.MONDAY);

        // 1. Weekly All-Hands Meeting — MEETING, Tuesday this week
        companyEventRepository.save(CompanyEvent.builder()
                .title("Weekly All-Hands Meeting")
                .description("Company-wide sync to discuss progress, blockers, and upcoming priorities.")
                .eventDate(thisMonday.plusDays(1))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(11, 0))
                .location("Main Conference Room")
                .eventType(EventType.MEETING)
                .createdByEmployee(engManager)
                .build());

        // 2. Birthday Celebrations — CELEBRATION, Friday this week
        companyEventRepository.save(CompanyEvent.builder()
                .title("February Birthday Celebrations")
                .description("Celebrating all team members with February birthdays. Cake and refreshments provided!")
                .eventDate(thisMonday.plusDays(4))
                .startTime(LocalTime.of(15, 0))
                .endTime(LocalTime.of(16, 30))
                .location("Break Room")
                .eventType(EventType.CELEBRATION)
                .createdByEmployee(vpHr)
                .build());

        // 3. Cloud Architecture Workshop — TRAINING, next week Wednesday
        companyEventRepository.save(CompanyEvent.builder()
                .title("Cloud Architecture Workshop")
                .description("Hands-on workshop covering AWS best practices, microservices patterns, and deployment strategies.")
                .eventDate(thisMonday.plusWeeks(1).plusDays(2))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(12, 0))
                .location("Training Lab")
                .eventType(EventType.TRAINING)
                .createdByEmployee(engManager)
                .build());

        // 4. Q1 Results Town Hall — COMPANY_WIDE, Thursday this week
        companyEventRepository.save(CompanyEvent.builder()
                .title("Q1 Results Town Hall")
                .description("Quarterly results presentation and Q&A session with leadership.")
                .eventDate(thisMonday.plusDays(3))
                .startTime(LocalTime.of(14, 0))
                .endTime(LocalTime.of(15, 0))
                .location("Auditorium")
                .eventType(EventType.COMPANY_WIDE)
                .createdByEmployee(vpHr)
                .build());

        log.info("Company events seeded: 4 events");
    }
}
