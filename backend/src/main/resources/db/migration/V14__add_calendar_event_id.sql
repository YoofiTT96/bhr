-- V14: Add calendar_event_id to time_off_requests for Outlook calendar sync

ALTER TABLE time_off_requests
    ADD COLUMN calendar_event_id VARCHAR(255);
