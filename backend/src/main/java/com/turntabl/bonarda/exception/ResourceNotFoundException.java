package com.turntabl.bonarda.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resource, String field, Object value) {
        super(resource + " not found");
    }

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
