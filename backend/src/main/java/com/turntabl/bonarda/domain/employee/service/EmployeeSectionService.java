package com.turntabl.bonarda.domain.employee.service;

import com.turntabl.bonarda.domain.employee.dto.*;
import com.turntabl.bonarda.domain.employee.model.EditableBy;
import com.turntabl.bonarda.domain.employee.model.EmployeeSection;
import com.turntabl.bonarda.domain.employee.model.SectionField;
import com.turntabl.bonarda.domain.employee.repository.EmployeeSectionRepository;
import com.turntabl.bonarda.domain.employee.repository.SectionFieldRepository;
import com.turntabl.bonarda.exception.BadRequestException;
import com.turntabl.bonarda.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class EmployeeSectionService {

    private final EmployeeSectionRepository sectionRepository;
    private final SectionFieldRepository fieldRepository;

    // ========== Section Read Operations ==========

    public List<EmployeeSectionDto> getAllActiveSections() {
        return sectionRepository.findByIsActiveTrue().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<EmployeeSectionDto> getAllSections() {
        return sectionRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public EmployeeSectionDto getSectionWithFields(Long id) {
        EmployeeSection section = sectionRepository.findByIdWithFields(id)
                .orElseThrow(() -> new ResourceNotFoundException("EmployeeSection", "id", id));
        return toDtoWithFields(section);
    }

    public EmployeeSectionDto getSectionByPublicId(UUID publicId) {
        EmployeeSection section = sectionRepository.findByPublicIdWithFields(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("EmployeeSection", "id", publicId));
        return toDtoWithFields(section);
    }

    public EmployeeSectionDto getSectionByNameWithFields(String name) {
        EmployeeSection section = sectionRepository.findByNameWithFields(name)
                .orElseThrow(() -> new ResourceNotFoundException("EmployeeSection", "name", name));
        return toDtoWithFields(section);
    }

    public List<EmployeeSectionDto> getVisibleSections(UUID currentUserPublicId, UUID viewedEmployeePublicId,
                                                         Collection<String> userPermissions) {
        boolean isOwnProfile = currentUserPublicId.equals(viewedEmployeePublicId);

        return sectionRepository.findByIsActiveTrueOrderByDisplayOrderAsc().stream()
                .filter(section -> isSectionVisible(section, isOwnProfile, userPermissions))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public boolean canViewSection(String sectionName, UUID currentUserPublicId, UUID viewedEmployeePublicId,
                                  Collection<String> userPermissions) {
        EmployeeSection section = sectionRepository.findByName(sectionName)
                .orElseThrow(() -> new ResourceNotFoundException("EmployeeSection", "name", sectionName));
        return isSectionVisible(section, currentUserPublicId.equals(viewedEmployeePublicId), userPermissions);
    }

    private boolean isSectionVisible(EmployeeSection section, boolean isOwnProfile,
                                     Collection<String> userPermissions) {
        if (section.getRequiredPermission() == null) {
            return true;
        }
        if (isOwnProfile) {
            return true;
        }
        return userPermissions.contains(section.getRequiredPermission());
    }

    public List<SectionFieldDto> getFieldsBySectionId(Long sectionId) {
        sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("EmployeeSection", "id", sectionId));
        return fieldRepository.findBySectionIdOrderByDisplayOrderAsc(sectionId).stream()
                .map(this::toFieldDto)
                .collect(Collectors.toList());
    }

    // ========== Section CRUD Operations ==========

    @Transactional
    public EmployeeSectionDto createSection(CreateSectionRequest request) {
        if (sectionRepository.existsByName(request.getName())) {
            throw new BadRequestException("Section with name '" + request.getName() + "' already exists");
        }

        EmployeeSection section = EmployeeSection.builder()
                .name(request.getName())
                .displayName(request.getDisplayName())
                .description(request.getDescription())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .requiredPermission(request.getRequiredPermission())
                .isActive(true)
                .build();

        section = sectionRepository.save(section);
        return toDto(section);
    }

    @Transactional
    public EmployeeSectionDto updateSection(UUID publicId, UpdateSectionRequest request) {
        EmployeeSection section = sectionRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("EmployeeSection", "id", publicId));

        if (request.getDisplayName() != null) {
            section.setDisplayName(request.getDisplayName());
        }
        if (request.getDescription() != null) {
            section.setDescription(request.getDescription());
        }
        if (request.getDisplayOrder() != null) {
            section.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getIsActive() != null) {
            section.setIsActive(request.getIsActive());
        }
        if (request.getRequiredPermission() != null) {
            section.setRequiredPermission(request.getRequiredPermission().isEmpty() ? null : request.getRequiredPermission());
        }

        section = sectionRepository.save(section);
        return toDto(section);
    }

    @Transactional
    public void deleteSection(UUID publicId) {
        EmployeeSection section = sectionRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("EmployeeSection", "id", publicId));
        sectionRepository.delete(section);
    }

    // ========== Field CRUD Operations ==========

    @Transactional
    public SectionFieldDto createField(UUID sectionPublicId, CreateSectionFieldRequest request) {
        EmployeeSection section = sectionRepository.findByPublicId(sectionPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("EmployeeSection", "id", sectionPublicId));

        if (fieldRepository.existsBySectionIdAndFieldName(section.getId(), request.getFieldName())) {
            throw new BadRequestException("Field with name '" + request.getFieldName() + "' already exists in this section");
        }

        SectionField field = SectionField.builder()
                .section(section)
                .fieldName(request.getFieldName())
                .fieldLabel(request.getFieldLabel())
                .fieldType(request.getFieldType())
                .fieldOptions(request.getFieldOptions())
                .isRequired(request.getIsRequired() != null ? request.getIsRequired() : false)
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .editableBy(request.getEditableBy() != null ? request.getEditableBy() : EditableBy.EMPLOYEE)
                .validationRules(request.getValidationRules())
                .build();

        field = fieldRepository.save(field);
        return toFieldDto(field);
    }

    @Transactional
    public SectionFieldDto updateField(UUID fieldPublicId, UpdateSectionFieldRequest request) {
        SectionField field = fieldRepository.findByPublicId(fieldPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("SectionField", "id", fieldPublicId));

        if (request.getFieldLabel() != null) {
            field.setFieldLabel(request.getFieldLabel());
        }
        if (request.getFieldType() != null) {
            field.setFieldType(request.getFieldType());
        }
        if (request.getFieldOptions() != null) {
            field.setFieldOptions(request.getFieldOptions());
        }
        if (request.getIsRequired() != null) {
            field.setIsRequired(request.getIsRequired());
        }
        if (request.getDisplayOrder() != null) {
            field.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getEditableBy() != null) {
            field.setEditableBy(request.getEditableBy());
        }
        if (request.getValidationRules() != null) {
            field.setValidationRules(request.getValidationRules());
        }

        field = fieldRepository.save(field);
        return toFieldDto(field);
    }

    @Transactional
    public void deleteField(UUID fieldPublicId) {
        SectionField field = fieldRepository.findByPublicId(fieldPublicId)
                .orElseThrow(() -> new ResourceNotFoundException("SectionField", "id", fieldPublicId));
        fieldRepository.delete(field);
    }

    // ========== DTO Mappers ==========

    private EmployeeSectionDto toDto(EmployeeSection section) {
        return EmployeeSectionDto.builder()
                .id(section.getPublicId().toString())
                .name(section.getName())
                .displayName(section.getDisplayName())
                .description(section.getDescription())
                .displayOrder(section.getDisplayOrder())
                .isActive(section.getIsActive())
                .requiredPermission(section.getRequiredPermission())
                .build();
    }

    private EmployeeSectionDto toDtoWithFields(EmployeeSection section) {
        List<SectionFieldDto> fields = section.getFields().stream()
                .map(this::toFieldDto)
                .sorted((a, b) -> a.getDisplayOrder().compareTo(b.getDisplayOrder()))
                .collect(Collectors.toList());

        return EmployeeSectionDto.builder()
                .id(section.getPublicId().toString())
                .name(section.getName())
                .displayName(section.getDisplayName())
                .description(section.getDescription())
                .displayOrder(section.getDisplayOrder())
                .isActive(section.getIsActive())
                .requiredPermission(section.getRequiredPermission())
                .fields(fields)
                .build();
    }

    private SectionFieldDto toFieldDto(SectionField field) {
        return SectionFieldDto.builder()
                .id(field.getPublicId().toString())
                .fieldName(field.getFieldName())
                .fieldLabel(field.getFieldLabel())
                .fieldType(field.getFieldType())
                .fieldOptions(field.getFieldOptions())
                .isRequired(field.getIsRequired())
                .displayOrder(field.getDisplayOrder())
                .editableBy(field.getEditableBy())
                .validationRules(field.getValidationRules())
                .build();
    }
}
