package com.turntabl.bonarda.domain.project.service;

import com.turntabl.bonarda.domain.project.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ClientService {
    ClientDto create(CreateClientRequest request);
    ClientDto update(UUID publicId, UpdateClientRequest request);
    ClientDto getById(UUID publicId);
    Page<ClientDto> getAll(Pageable pageable);
    List<ClientDto> getAllActive();
    void delete(UUID publicId);
}
