package com.turntabl.bonarda.domain.employee.repository;

import com.turntabl.bonarda.domain.employee.model.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {

    Optional<Permission> findByName(String name);

    Optional<Permission> findByPublicId(UUID publicId);

    List<Permission> findAllByOrderByResourceAscActionAsc();

    List<Permission> findByPublicIdIn(Set<UUID> publicIds);
}
