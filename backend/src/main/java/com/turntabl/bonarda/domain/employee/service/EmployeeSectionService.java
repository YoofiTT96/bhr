package com.turntabl.bonarda.domain.employee.service;

import com.turntabl.bonarda.domain.employee.dto.EmployeeSectionDto;
import com.turntabl.bonarda.domain.employee.dto.SectionFieldDto;
import com.turntabl.bonarda.domain.employee.model.EmployeeSection;
import com.turntabl.bonarda.domain.employee.model.SectionField;
import com.turntabl.bonarda.domain.employee.repository.EmployeeSectionRepository;
import com.turntabl.bonarda.domain.employee.repository.SectionFieldRepository;
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

    private EmployeeSectionDto toDto(EmployeeSection section) {
        return EmployeeSectionDto.builder()
                .id(section.getId())
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
                .id(section.getId())
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
                .id(field.getId())
                .fieldName(field.getFieldName())
                .fieldLabel(field.getFieldLabel())
                .fieldType(field.getFieldType())
                .fieldOptions(field.getFieldOptions())
                .isRequired(field.getIsRequired())
                .displayOrder(field.getDisplayOrder())
                .validationRules(field.getValidationRules())
                .build();
    }
}
