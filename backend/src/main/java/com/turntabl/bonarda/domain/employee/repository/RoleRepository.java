package com.turntabl.bonarda.domain.employee.repository;

import com.turntabl.bonarda.domain.employee.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;
import java.util.List;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(String name);

    Optional<Role> findByPublicId(UUID publicId);

    boolean existsByName(String name);

    List<Role> findByPublicIdIn(Set<UUID> publicIds);
}
