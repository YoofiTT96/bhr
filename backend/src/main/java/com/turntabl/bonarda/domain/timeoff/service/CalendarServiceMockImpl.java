package com.turntabl.bonarda.domain.timeoff.service;

import com.turntabl.bonarda.domain.timeoff.model.TimeOffRequest;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@ConditionalOnProperty(name = "microsoft.graph.mock-enabled", havingValue = "true", matchIfMissing = true)
@Slf4j
public class CalendarServiceMockImpl implements CalendarService {

    @PostConstruct
    public void init() {
        log.info("Calendar mock service active — calendar events will be simulated");
    }

    @Override
    public String createEvent(TimeOffRequest request) {
        String microsoftUserId = request.getEmployee().getMicrosoftUserId();
        if (microsoftUserId == null || microsoftUserId.isBlank()) {
            log.warn("[MOCK] Skipping calendar sync for {} — no microsoftUserId",
                    request.getEmployee().getFullName());
            return null;
        }

        String fakeEventId = "mock-event-" + UUID.randomUUID();
        log.info("[MOCK] Calendar event created for {} | type={} | dates={} to {} | halfDay={} | eventId={}",
                request.getEmployee().getFullName(),
                request.getTimeOffType().getName(),
                request.getStartDate(),
                request.getEndDate(),
                request.getHalfDay(),
                fakeEventId);
        return fakeEventId;
    }

    @Override
    public void deleteEvent(TimeOffRequest request) {
        String eventId = request.getCalendarEventId();
        if (eventId == null) {
            return;
        }
        log.info("[MOCK] Calendar event deleted for {} | eventId={}",
                request.getEmployee().getFullName(), eventId);
    }
}
