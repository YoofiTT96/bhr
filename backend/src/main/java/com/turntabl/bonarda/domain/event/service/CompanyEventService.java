package com.turntabl.bonarda.domain.event.service;

import com.turntabl.bonarda.domain.event.dto.CompanyEventDto;
import com.turntabl.bonarda.domain.event.dto.CreateEventRequest;
import com.turntabl.bonarda.domain.event.dto.UpdateEventRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface CompanyEventService {
    CompanyEventDto create(UUID creatorPublicId, CreateEventRequest request);
    CompanyEventDto update(UUID publicId, UpdateEventRequest request);
    void delete(UUID publicId);
    CompanyEventDto getById(UUID publicId);
    Page<CompanyEventDto> getAll(Pageable pageable);
    List<CompanyEventDto> getEventsForDateRange(LocalDate start, LocalDate end);
}
