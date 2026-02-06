package com.turntabl.bonarda.domain.employee.dto;

import com.turntabl.bonarda.domain.employee.model.FieldType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@Builder
public class SectionFieldDto {

    private Long id;
    private String fieldName;
    private String fieldLabel;
    private FieldType fieldType;
    private Map<String, Object> fieldOptions;
    private Boolean isRequired;
    private Integer displayOrder;
    private Map<String, Object> validationRules;
}
