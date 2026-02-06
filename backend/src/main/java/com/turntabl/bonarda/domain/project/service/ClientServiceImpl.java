package com.turntabl.bonarda.domain.project.service;

import com.turntabl.bonarda.domain.project.dto.*;
import com.turntabl.bonarda.domain.project.model.Client;
import com.turntabl.bonarda.domain.project.repository.ClientRepository;
import com.turntabl.bonarda.domain.project.repository.ProjectRepository;
import com.turntabl.bonarda.exception.BadRequestException;
import com.turntabl.bonarda.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ClientServiceImpl implements ClientService {

    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;

    @Override
    public ClientDto create(CreateClientRequest request) {
        if (clientRepository.existsByName(request.getName())) {
            throw new BadRequestException("A client with the name '" + request.getName() + "' already exists");
        }

        Client client = Client.builder()
                .name(request.getName())
                .industry(request.getIndustry())
                .contactName(request.getContactName())
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .website(request.getWebsite())
                .notes(request.getNotes())
                .build();

        Client saved = clientRepository.save(client);
        return toDto(saved);
    }

    @Override
    public ClientDto update(UUID publicId, UpdateClientRequest request) {
        Client client = clientRepository.findByPublicIdForUpdate(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Client", "publicId", publicId));

        if (request.getName() != null) {
            client.setName(request.getName());
        }
        if (request.getIndustry() != null) {
            client.setIndustry(request.getIndustry());
        }
        if (request.getContactName() != null) {
            client.setContactName(request.getContactName());
        }
        if (request.getContactEmail() != null) {
            client.setContactEmail(request.getContactEmail());
        }
        if (request.getContactPhone() != null) {
            client.setContactPhone(request.getContactPhone());
        }
        if (request.getWebsite() != null) {
            client.setWebsite(request.getWebsite());
        }
        if (request.getNotes() != null) {
            client.setNotes(request.getNotes());
        }
        if (request.getIsActive() != null) {
            client.setIsActive(request.getIsActive());
        }

        Client saved = clientRepository.save(client);
        return toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ClientDto getById(UUID publicId) {
        Client client = clientRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Client", "publicId", publicId));
        return toDto(client);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ClientDto> getAll(Pageable pageable) {
        return clientRepository.findAllClients(pageable).map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClientDto> getAllActive() {
        return clientRepository.findByIsActiveTrueOrderByNameAsc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(UUID publicId) {
        Client client = clientRepository.findByPublicId(publicId)
                .orElseThrow(() -> new ResourceNotFoundException("Client", "publicId", publicId));
        clientRepository.delete(client);
    }

    // --- Private helpers ---

    private ClientDto toDto(Client client) {
        return ClientDto.builder()
                .id(client.getPublicId().toString())
                .name(client.getName())
                .industry(client.getIndustry())
                .contactName(client.getContactName())
                .contactEmail(client.getContactEmail())
                .contactPhone(client.getContactPhone())
                .website(client.getWebsite())
                .notes(client.getNotes())
                .isActive(client.getIsActive())
                .projectCount(0)
                .build();
    }
}
