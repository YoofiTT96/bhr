package com.turntabl.bonarda.domain.timeoff.service;

import com.turntabl.bonarda.domain.timeoff.model.TimeOffRequest;

public interface CalendarService {

    /**
     * Creates a calendar event on the employee's Outlook calendar for an approved request.
     * Best-effort: returns null on skip or failure, never throws.
     */
    String createEvent(TimeOffRequest request);

    /**
     * Deletes the calendar event associated with a cancelled request.
     * Best-effort: logs failures, never throws.
     */
    void deleteEvent(TimeOffRequest request);
}
