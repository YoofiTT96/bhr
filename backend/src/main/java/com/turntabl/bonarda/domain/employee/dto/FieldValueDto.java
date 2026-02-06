package com.turntabl.bonarda.domain.employee.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@Builder
public class FieldValueDto {

    private Long id;
    private Long sectionFieldId;
    private String fieldName;
    private String fieldLabel;
    private Map<String, Object> value;
}
