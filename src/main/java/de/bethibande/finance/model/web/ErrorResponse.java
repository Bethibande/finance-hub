package de.bethibande.finance.model.web;

public record ErrorResponse(
        int status,
        String message,
        String translationKey
) {
}
