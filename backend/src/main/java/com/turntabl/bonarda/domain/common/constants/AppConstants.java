package com.turntabl.bonarda.domain.common.constants;

/**
 * Central location for application-wide constants.
 * <p>
 * Organizing constants here eliminates magic strings scattered throughout
 * the codebase, making it easier to maintain and reducing typo-related bugs.
 */
public final class AppConstants {

    private AppConstants() {
        // Prevent instantiation
    }

    /**
     * Permission constants matching database permission names.
     * <p>
     * Use these constants in @PreAuthorize annotations and permission checks
     * instead of hardcoded strings.
     */
    public static final class Permissions {
        private Permissions() {}

        // Employee permissions
        public static final String EMPLOYEE_CREATE = "EMPLOYEE_CREATE";
        public static final String EMPLOYEE_READ = "EMPLOYEE_READ";
        public static final String EMPLOYEE_READ_TEAM = "EMPLOYEE_READ_TEAM";
        public static final String EMPLOYEE_UPDATE = "EMPLOYEE_UPDATE";
        public static final String EMPLOYEE_DELETE = "EMPLOYEE_DELETE";

        // Time-off type permissions
        public static final String TIME_OFF_TYPE_CREATE = "TIME_OFF_TYPE_CREATE";
        public static final String TIME_OFF_TYPE_READ = "TIME_OFF_TYPE_READ";
        public static final String TIME_OFF_TYPE_UPDATE = "TIME_OFF_TYPE_UPDATE";
        public static final String TIME_OFF_TYPE_DELETE = "TIME_OFF_TYPE_DELETE";

        // Time-off request permissions
        public static final String TIME_OFF_REQUEST_CREATE = "TIME_OFF_REQUEST_CREATE";
        public static final String TIME_OFF_REQUEST_READ_OWN = "TIME_OFF_REQUEST_READ_OWN";
        public static final String TIME_OFF_REQUEST_READ_TEAM = "TIME_OFF_REQUEST_READ_TEAM";
        public static final String TIME_OFF_REQUEST_READ_ALL = "TIME_OFF_REQUEST_READ_ALL";
        public static final String TIME_OFF_REQUEST_APPROVE = "TIME_OFF_REQUEST_APPROVE";

        // Time-off balance permissions
        public static final String TIME_OFF_BALANCE_READ_OWN = "TIME_OFF_BALANCE_READ_OWN";
        public static final String TIME_OFF_BALANCE_READ_ALL = "TIME_OFF_BALANCE_READ_ALL";
        public static final String TIME_OFF_BALANCE_ADJUST = "TIME_OFF_BALANCE_ADJUST";

        // Timesheet permissions
        public static final String TIMESHEET_CREATE = "TIMESHEET_CREATE";
        public static final String TIMESHEET_READ_OWN = "TIMESHEET_READ_OWN";
        public static final String TIMESHEET_READ_TEAM = "TIMESHEET_READ_TEAM";
        public static final String TIMESHEET_READ_ALL = "TIMESHEET_READ_ALL";
        public static final String TIMESHEET_SUBMIT = "TIMESHEET_SUBMIT";
        public static final String TIMESHEET_APPROVE = "TIMESHEET_APPROVE";

        // Project permissions
        public static final String PROJECT_CREATE = "PROJECT_CREATE";
        public static final String PROJECT_READ = "PROJECT_READ";
        public static final String PROJECT_UPDATE = "PROJECT_UPDATE";
        public static final String PROJECT_DELETE = "PROJECT_DELETE";
        public static final String PROJECT_ASSIGN = "PROJECT_ASSIGN";

        // Client permissions
        public static final String CLIENT_CREATE = "CLIENT_CREATE";
        public static final String CLIENT_READ = "CLIENT_READ";
        public static final String CLIENT_UPDATE = "CLIENT_UPDATE";
        public static final String CLIENT_DELETE = "CLIENT_DELETE";

        // Event permissions
        public static final String EVENT_CREATE = "EVENT_CREATE";
        public static final String EVENT_READ = "EVENT_READ";
        public static final String EVENT_UPDATE = "EVENT_UPDATE";
        public static final String EVENT_DELETE = "EVENT_DELETE";

        // Document permissions
        public static final String DOCUMENT_CREATE = "DOCUMENT_CREATE";
        public static final String DOCUMENT_READ_OWN = "DOCUMENT_READ_OWN";
        public static final String DOCUMENT_READ_ALL = "DOCUMENT_READ_ALL";
        public static final String DOCUMENT_UPDATE = "DOCUMENT_UPDATE";
        public static final String DOCUMENT_DELETE = "DOCUMENT_DELETE";
        public static final String DOCUMENT_SHARE = "DOCUMENT_SHARE";
        public static final String DOCUMENT_SIGN_OWN = "DOCUMENT_SIGN_OWN";
        public static final String DOCUMENT_SIGN_READ = "DOCUMENT_SIGN_READ";
        public static final String SHAREPOINT_BROWSE = "SHAREPOINT_BROWSE";

        // Admin/Role permissions
        public static final String ROLE_CREATE = "ROLE_CREATE";
        public static final String ROLE_READ = "ROLE_READ";
        public static final String ROLE_UPDATE = "ROLE_UPDATE";
        public static final String ROLE_DELETE = "ROLE_DELETE";
        public static final String ROLE_ASSIGN = "ROLE_ASSIGN";
    }

    /**
     * API path constants for consistent URL patterns.
     */
    public static final class Api {
        private Api() {}

        public static final String BASE_PATH = "/api/v1";
        public static final String AUTH_PATH = BASE_PATH + "/auth";
        public static final String AUTH_ME = AUTH_PATH + "/me";
        public static final String AUTH_WILDCARD = AUTH_PATH + "/**";
        public static final String OAUTH2_AUTHORIZATION = "/oauth2/authorization/**";
        public static final String OAUTH2_CODE = "/login/oauth2/code/**";
        public static final String ACTUATOR_HEALTH = "/actuator/health";
    }

    /**
     * CSV import related constants.
     */
    public static final class CsvImport {
        private CsvImport() {}

        public static final String[] HEADERS = {
            "firstName", "lastName", "email", "hireDate",
            "phoneNumber", "position", "location", "birthday",
            "role", "managerEmail"
        };

        /**
         * Characters that could trigger CSV injection attacks.
         * Values starting with these should be prefixed with a single quote.
         */
        public static final char[] INJECTION_CHARS = {'=', '+', '-', '@', '\t', '\r'};
    }

    /**
     * Time and date related constants.
     */
    public static final class Time {
        private Time() {}

        /** Monday = 1 (ISO-8601 standard used by Java's DayOfWeek) */
        public static final int WEEK_START_DAY = 1;

        /** Number of hours precision for rounding (10 = 1 decimal place) */
        public static final int HOURS_PRECISION = 10;

        /** Maximum hours per day for validation */
        public static final int MAX_HOURS_PER_DAY = 24;
    }
}
