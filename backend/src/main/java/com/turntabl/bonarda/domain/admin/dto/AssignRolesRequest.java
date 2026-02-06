package com.turntabl.bonarda.domain.admin.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class AssignRolesRequest {

    @NotEmpty(message = "Role IDs must not be empty")
    private Set<String> roleIds;
}
