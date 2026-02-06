package com.turntabl.bonarda.security;

import com.turntabl.bonarda.domain.employee.model.Employee;
import com.turntabl.bonarda.domain.employee.model.Permission;
import com.turntabl.bonarda.domain.employee.model.Role;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Getter
public class UserPrincipal implements UserDetails {

    private final Long id;
    private final UUID publicId;
    private final String email;
    private final String firstName;
    private final String lastName;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(Long id, UUID publicId, String email, String firstName, String lastName,
                         Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.publicId = publicId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.authorities = authorities;
    }

    public static UserPrincipal from(Employee employee) {
        Set<GrantedAuthority> authorities = employee.getRoles().stream()
                .flatMap(role -> {
                    Set<GrantedAuthority> perms = role.getPermissions().stream()
                            .map(permission -> new SimpleGrantedAuthority(permission.getName()))
                            .collect(Collectors.toSet());
                    perms.add(new SimpleGrantedAuthority("ROLE_" + role.getName()));
                    return perms.stream();
                })
                .collect(Collectors.toSet());

        return new UserPrincipal(
                employee.getId(),
                employee.getPublicId(),
                employee.getEmail(),
                employee.getFirstName(),
                employee.getLastName(),
                authorities
        );
    }

    @Override
    public String getPassword() {
        return null; // No password - auth is via JWT/OAuth2
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
