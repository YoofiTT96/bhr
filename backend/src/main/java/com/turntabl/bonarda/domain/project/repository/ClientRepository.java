package com.turntabl.bonarda.domain.project.repository;

import com.turntabl.bonarda.domain.project.model.Client;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {

    Optional<Client> findByPublicId(UUID publicId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Client c WHERE c.publicId = :publicId")
    Optional<Client> findByPublicIdForUpdate(@Param("publicId") UUID publicId);

    @Query("SELECT c FROM Client c LEFT JOIN FETCH c.projects WHERE c.publicId = :publicId")
    Optional<Client> findByPublicIdWithProjects(@Param("publicId") UUID publicId);

    List<Client> findByIsActiveTrueOrderByNameAsc();

    @Query(value = "SELECT c FROM Client c",
           countQuery = "SELECT count(c) FROM Client c")
    Page<Client> findAllClients(Pageable pageable);

    boolean existsByName(String name);
}
