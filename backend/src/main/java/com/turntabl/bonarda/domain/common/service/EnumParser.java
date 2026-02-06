package com.turntabl.bonarda.domain.common.service;

import com.turntabl.bonarda.exception.BadRequestException;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.stream.Collectors;

/**
 * Utility component for parsing enum values from strings with consistent error handling.
 * <p>
 * This eliminates repetitive try-catch blocks for enum parsing across services,
 * providing user-friendly error messages that list valid options.
 */
@Component
public class EnumParser {

    /**
     * Parses a string value into an enum constant.
     *
     * @param enumClass the enum class to parse into
     * @param value     the string value to parse
     * @param fieldName the field name for error messages (e.g., "event type", "status")
     * @param <T>       the enum type
     * @return the parsed enum constant
     * @throws BadRequestException if the value is null, blank, or not a valid enum constant
     */
    public <T extends Enum<T>> T parse(Class<T> enumClass, String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(capitalize(fieldName) + " is required");
        }

        try {
            return Enum.valueOf(enumClass, value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            String validValues = Arrays.stream(enumClass.getEnumConstants())
                    .map(Enum::name)
                    .collect(Collectors.joining(", "));
            throw new BadRequestException(
                    "Invalid " + fieldName + ": '" + value + "'. Valid values are: " + validValues
            );
        }
    }

    /**
     * Parses a string value into an enum constant, returning null if the value is null or blank.
     *
     * @param enumClass the enum class to parse into
     * @param value     the string value to parse (may be null)
     * @param fieldName the field name for error messages
     * @param <T>       the enum type
     * @return the parsed enum constant, or null if value is null/blank
     * @throws BadRequestException if the value is not null/blank and not a valid enum constant
     */
    public <T extends Enum<T>> T parseOptional(Class<T> enumClass, String value, String fieldName) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return parse(enumClass, value, fieldName);
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }
}
