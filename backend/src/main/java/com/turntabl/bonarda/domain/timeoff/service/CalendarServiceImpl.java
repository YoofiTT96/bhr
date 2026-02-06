package com.turntabl.bonarda.domain.timeoff.service;

import com.azure.identity.ClientSecretCredential;
import com.azure.identity.ClientSecretCredentialBuilder;
import com.microsoft.graph.models.*;
import com.microsoft.graph.serviceclient.GraphServiceClient;
import com.turntabl.bonarda.config.SharePointProperties;
import com.turntabl.bonarda.domain.timeoff.model.HalfDayPeriod;
import com.turntabl.bonarda.domain.timeoff.model.TimeOffRequest;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Service
@ConditionalOnProperty(name = "microsoft.graph.mock-enabled", havingValue = "false")
@Slf4j
@RequiredArgsConstructor
public class CalendarServiceImpl implements CalendarService {

    private final SharePointProperties properties;
    private GraphServiceClient graphClient;

    @PostConstruct
    public void init() {
        if (properties.getTenantId() != null && !properties.getTenantId().isBlank()
                && properties.getClientId() != null && !properties.getClientId().isBlank()
                && properties.getClientSecret() != null && !properties.getClientSecret().isBlank()) {
            try {
                ClientSecretCredential credential = new ClientSecretCredentialBuilder()
                        .tenantId(properties.getTenantId())
                        .clientId(properties.getClientId())
                        .clientSecret(properties.getClientSecret())
                        .build();
                graphClient = new GraphServiceClient(credential,
                        properties.getScopes().toArray(new String[0]));
                log.info("Calendar service initialized — Outlook calendar sync available");
            } catch (Exception e) {
                log.error("Failed to initialize Calendar Graph client: {}", e.getMessage());
                graphClient = null;
            }
        } else {
            log.warn("Microsoft Graph not configured — calendar sync will be unavailable");
        }
    }

    @Override
    public String createEvent(TimeOffRequest request) {
        String microsoftUserId = request.getEmployee().getMicrosoftUserId();
        if (microsoftUserId == null || microsoftUserId.isBlank()) {
            log.warn("Skipping calendar sync for {} — no microsoftUserId",
                    request.getEmployee().getFullName());
            return null;
        }
        if (graphClient == null) {
            log.warn("Skipping calendar sync — Graph client not initialized");
            return null;
        }

        try {
            Event event = buildEvent(request);
            Event created = graphClient.users().byUserId(microsoftUserId)
                    .calendar().events().post(event);
            if (created != null && created.getId() != null) {
                log.info("Calendar event created for {} — eventId: {}",
                        request.getEmployee().getFullName(), created.getId());
                return created.getId();
            }
            log.warn("Calendar event creation returned null for {}",
                    request.getEmployee().getFullName());
            return null;
        } catch (Exception e) {
            log.error("Failed to create calendar event for {}: {}",
                    request.getEmployee().getFullName(), e.getMessage());
            return null;
        }
    }

    @Override
    public void deleteEvent(TimeOffRequest request) {
        String microsoftUserId = request.getEmployee().getMicrosoftUserId();
        String eventId = request.getCalendarEventId();
        if (microsoftUserId == null || microsoftUserId.isBlank() || eventId == null) {
            return;
        }
        if (graphClient == null) {
            log.warn("Skipping calendar event deletion — Graph client not initialized");
            return;
        }

        try {
            graphClient.users().byUserId(microsoftUserId)
                    .events().byEventId(eventId).delete();
            log.info("Calendar event deleted for {} — eventId: {}",
                    request.getEmployee().getFullName(), eventId);
        } catch (Exception e) {
            log.error("Failed to delete calendar event {} for {}: {}",
                    eventId, request.getEmployee().getFullName(), e.getMessage());
        }
    }

    private Event buildEvent(TimeOffRequest request) {
        Event event = new Event();

        String typeName = request.getTimeOffType().getName();
        String empName = request.getEmployee().getFullName();
        event.setSubject(typeName + " \u2014 " + empName);

        ItemBody body = new ItemBody();
        body.setContentType(BodyType.Text);
        body.setContent("Time off: " + typeName + "\nDays: "
                + request.getBusinessDays().toPlainString());
        event.setBody(body);

        event.setShowAs(FreeBusyStatus.Oof);

        if (Boolean.TRUE.equals(request.getHalfDay())) {
            event.setIsAllDay(false);
            LocalDate date = request.getStartDate();
            LocalTime startTime;
            LocalTime endTime;
            if (request.getHalfDayPeriod() == HalfDayPeriod.MORNING) {
                startTime = LocalTime.of(8, 0);
                endTime = LocalTime.of(12, 0);
            } else {
                startTime = LocalTime.of(13, 0);
                endTime = LocalTime.of(17, 0);
            }
            event.setStart(dateTimeTimeZone(date.atTime(startTime)));
            event.setEnd(dateTimeTimeZone(date.atTime(endTime)));
        } else {
            event.setIsAllDay(true);
            // Graph API uses exclusive end date for all-day events
            LocalDate endExclusive = request.getEndDate().plusDays(1);
            event.setStart(dateOnlyTimeZone(request.getStartDate()));
            event.setEnd(dateOnlyTimeZone(endExclusive));
        }

        return event;
    }

    private DateTimeTimeZone dateTimeTimeZone(LocalDateTime dateTime) {
        DateTimeTimeZone dt = new DateTimeTimeZone();
        dt.setDateTime(dateTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        dt.setTimeZone("UTC");
        return dt;
    }

    private DateTimeTimeZone dateOnlyTimeZone(LocalDate date) {
        DateTimeTimeZone dt = new DateTimeTimeZone();
        dt.setDateTime(date.atStartOfDay().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        dt.setTimeZone("UTC");
        return dt;
    }
}
