package com.turntabl.bonarda.domain.timeoff.service;

import com.turntabl.bonarda.domain.timeoff.dto.CreateTimeOffTypeRequest;
import com.turntabl.bonarda.domain.timeoff.dto.TimeOffTypeDto;
import com.turntabl.bonarda.domain.timeoff.dto.UpdateTimeOffTypeRequest;
import com.turntabl.bonarda.domain.timeoff.model.AttachmentRequirement;
import com.turntabl.bonarda.domain.timeoff.model.TimeOffType;
import com.turntabl.bonarda.domain.timeoff.repository.TimeOffTypeRepository;
import com.turntabl.bonarda.exception.BadRequestException;
import com.turntabl.bonarda.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class TimeOffTypeServiceImpl implements TimeOffTypeService {

    private final TimeOffTypeRepository typeRepository;

    @Override
    public TimeOffTypeDto create(CreateTimeOffTypeRequest request) {
        if (typeRepository.existsByNameAndIsActiveTrue(request.getName())) {
            throw new BadRequestException("Time off type with name '" + request.getName() + "' already exists");
        }

        AttachmentRequirement attachmentReq = parseAttachmentRequirement(request.getAttachmentRequirement());
        validateAttachmentConfig(attachmentReq, request.getAttachmentRequiredAfterDays());

        TimeOffType type = TimeOffType.builder()
                .name(request.getName())
                .description(request.getDescription())
                .defaultDaysPerYear(request.getDefaultDaysPerYear())
                .carryOverAllowed(request.getCarryOverAllowed() != null ? request.getCarryOverAllowed() : false)
                .maxCarryOverDays(request.getMaxCarryOverDays() != null ? request.getMaxCarryOverDays() : 0)
                .requiresApproval(request.getRequiresApproval() != null ? request.getRequiresApproval() : true)
                .isUnlimited(request.getIsUnlimited() != null ? request.getIsUnlimited() : false)
                .attachmentRequirement(attachmentReq)
                .attachmentRequiredAfterDays(request.getAttachmentRequiredAfterDays())
                .build();

        TimeOffType saved = typeRepository.save(type);
        return toDto(saved);
    }

    @Override
    public TimeOffTypeDto update(UUID publicId, UpdateTimeOffTypeRequest request) {
        TimeOffType type = resolveByPublicId(publicId);

        if (request.getName() != null) {
            if (!type.getName().equals(request.getName()) && typeRepository.existsByNameAndIsActiveTrue(request.getName())) {
                throw new BadRequestException("Time off type with name '" + request.getName() + "' already exists");
            }
            type.setName(request.getName());
        }
        if (request.getDescription() != null) type.setDescription(request.getDescription());
        if (request.getDefaultDaysPerYear() != null) type.setDefaultDaysPerYear(request.getDefaultDaysPerYear());
        if (request.getCarryOverAllowed() != null) type.setCarryOverAllowed(request.getCarryOverAllowed());
        if (request.getMaxCarryOverDays() != null) type.setMaxCarryOverDays(request.getMaxCarryOverDays());
        if (request.getRequiresApproval() != null) type.setRequiresApproval(request.getRequiresApproval());
        if (request.getIsActive() != null) type.setIsActive(request.getIsActive());
        if (request.getIsUnlimited() != null) type.setIsUnlimited(request.getIsUnlimited());
        if (request.getAttachmentRequirement() != null) {
            AttachmentRequirement attachmentReq = parseAttachmentRequirement(request.getAttachmentRequirement());
            Integer afterDays = request.getAttachmentRequiredAfterDays() != null
                    ? request.getAttachmentRequiredAfterDays()
                    : type.getAttachmentRequiredAfterDays();
            validateAttachmentConfig(attachmentReq, afterDays);
            type.setAttachmentRequirement(attachmentReq);
            type.setAttachmentRequiredAfterDays(afterDays);
        } else if (request.getAttachmentRequiredAfterDays() != null) {
            validateAttachmentConfig(type.getAttachmentRequirement(), request.getAttachmentRequiredAfterDays());
            type.setAttachmentRequiredAfterDays(request.getAttachmentRequiredAfterDays());
        }

        TimeOffType updated = typeRepository.save(type);
        return toDto(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public TimeOffTypeDto getById(UUID publicId) {
        return toDto(resolveByPublicId(publicId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimeOffTypeDto> getAllActive() {
        return typeRepository.findByIsActiveTrue().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimeOffTypeDto> getAll() {
        return typeRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(UUID publicId) {
        TimeOffType type = resolveByPublicId(publicId);
        type.setIsActive(false);
        typeRepository.save(type);
    }

    private TimeOffType resolveByPublicId(UUID publicId) {
        return typeRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("TimeOffType", "publicId", publicId));
    }

    private TimeOffTypeDto toDto(TimeOffType type) {
        return TimeOffTypeDto.builder()
                .id(type.getPublicId().toString())
                .name(type.getName())
                .description(type.getDescription())
                .defaultDaysPerYear(type.getDefaultDaysPerYear())
                .carryOverAllowed(type.getCarryOverAllowed())
                .maxCarryOverDays(type.getMaxCarryOverDays())
                .requiresApproval(type.getRequiresApproval())
                .isActive(type.getIsActive())
                .isUnlimited(type.getIsUnlimited())
                .attachmentRequirement(type.getAttachmentRequirement().name())
                .attachmentRequiredAfterDays(type.getAttachmentRequiredAfterDays())
                .build();
    }

    private AttachmentRequirement parseAttachmentRequirement(String value) {
        if (value == null || value.isBlank()) {
            return AttachmentRequirement.NEVER;
        }
        try {
            return AttachmentRequirement.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid attachment requirement: " + value);
        }
    }

    private void validateAttachmentConfig(AttachmentRequirement requirement, Integer afterDays) {
        if (requirement == AttachmentRequirement.CONDITIONAL && (afterDays == null || afterDays < 0)) {
            throw new BadRequestException("Conditional attachment requirement needs a valid 'attachmentRequiredAfterDays' value");
        }
    }
}
