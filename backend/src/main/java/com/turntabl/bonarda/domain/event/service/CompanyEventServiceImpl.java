package com.turntabl.bonarda.domain.event.service;

import com.turntabl.bonarda.domain.common.service.EntityResolutionService;
import com.turntabl.bonarda.domain.common.service.EnumParser;
import com.turntabl.bonarda.domain.employee.model.Employee;
import com.turntabl.bonarda.domain.event.dto.CompanyEventDto;
import com.turntabl.bonarda.domain.event.dto.CreateEventRequest;
import com.turntabl.bonarda.domain.event.dto.UpdateEventRequest;
import com.turntabl.bonarda.domain.event.model.CompanyEvent;
import com.turntabl.bonarda.domain.event.model.EventType;
import com.turntabl.bonarda.domain.event.repository.CompanyEventRepository;
import com.turntabl.bonarda.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class CompanyEventServiceImpl implements CompanyEventService {

    private final CompanyEventRepository eventRepository;
    private final EntityResolutionService entityResolution;
    private final EnumParser enumParser;

    @Override
    public CompanyEventDto create(UUID creatorPublicId, CreateEventRequest request) {
        Employee creator = entityResolution.resolveEmployee(creatorPublicId);

        EventType eventType = enumParser.parse(EventType.class, request.getEventType(), "event type");

        CompanyEvent event = CompanyEvent.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .eventDate(LocalDate.parse(request.getEventDate()))
                .location(request.getLocation())
                .eventType(eventType)
                .createdByEmployee(creator)
                .build();

        if (request.getStartTime() != null && !request.getStartTime().isBlank()) {
            event.setStartTime(LocalTime.parse(request.getStartTime()));
        }
        if (request.getEndTime() != null && !request.getEndTime().isBlank()) {
            event.setEndTime(LocalTime.parse(request.getEndTime()));
        }

        CompanyEvent saved = eventRepository.save(event);
        return toDto(saved);
    }

    @Override
    public CompanyEventDto update(UUID publicId, UpdateEventRequest request) {
        CompanyEvent event = eventRepository.findByPublicIdForUpdate(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("CompanyEvent", "publicId", publicId));

        if (request.getTitle() != null) {
            event.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            event.setDescription(request.getDescription());
        }
        if (request.getEventDate() != null) {
            event.setEventDate(LocalDate.parse(request.getEventDate()));
        }
        if (request.getStartTime() != null) {
            event.setStartTime(request.getStartTime().isBlank() ? null : LocalTime.parse(request.getStartTime()));
        }
        if (request.getEndTime() != null) {
            event.setEndTime(request.getEndTime().isBlank() ? null : LocalTime.parse(request.getEndTime()));
        }
        if (request.getLocation() != null) {
            event.setLocation(request.getLocation());
        }
        if (request.getEventType() != null) {
            event.setEventType(enumParser.parse(EventType.class, request.getEventType(), "event type"));
        }

        CompanyEvent saved = eventRepository.save(event);
        return toDto(saved);
    }

    @Override
    public void delete(UUID publicId) {
        CompanyEvent event = eventRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("CompanyEvent", "publicId", publicId));
        eventRepository.delete(event);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyEventDto getById(UUID publicId) {
        CompanyEvent event = eventRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("CompanyEvent", "publicId", publicId));
        return toDto(event);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CompanyEventDto> getAll(Pageable pageable) {
        return eventRepository.findAllWithCreator(pageable).map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyEventDto> getEventsForDateRange(LocalDate start, LocalDate end) {
        return eventRepository.findByEventDateBetween(start, end).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private CompanyEventDto toDto(CompanyEvent event) {
        Employee creator = event.getCreatedByEmployee();
        return CompanyEventDto.builder()
                .id(event.getPublicId().toString())
                .title(event.getTitle())
                .description(event.getDescription())
                .eventDate(event.getEventDate().toString())
                .startTime(event.getStartTime() != null ? event.getStartTime().toString() : null)
                .endTime(event.getEndTime() != null ? event.getEndTime().toString() : null)
                .location(event.getLocation())
                .eventType(event.getEventType().name())
                .createdByEmployeeId(creator != null ? creator.getPublicId().toString() : null)
                .createdByEmployeeName(creator != null ? creator.getFullName() : null)
                .createdAt(event.getCreatedAt() != null ? event.getCreatedAt().toString() : null)
                .build();
    }
}
