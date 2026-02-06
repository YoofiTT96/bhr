package com.turntabl.bonarda.domain.timeoff.service;

import com.turntabl.bonarda.domain.timeoff.dto.CreateTimeOffTypeRequest;
import com.turntabl.bonarda.domain.timeoff.dto.TimeOffTypeDto;
import com.turntabl.bonarda.domain.timeoff.dto.UpdateTimeOffTypeRequest;

import java.util.List;
import java.util.UUID;

public interface TimeOffTypeService {

    TimeOffTypeDto create(CreateTimeOffTypeRequest request);

    TimeOffTypeDto update(UUID publicId, UpdateTimeOffTypeRequest request);

    TimeOffTypeDto getById(UUID publicId);

    List<TimeOffTypeDto> getAllActive();

    List<TimeOffTypeDto> getAll();

    void delete(UUID publicId);
}
