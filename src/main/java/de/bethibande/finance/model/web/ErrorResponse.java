package de.bethibande.finance.model.web;

import jakarta.validation.constraints.NotNull;

public record ErrorResponse(
        @NotNull int status,
        @NotNull String message,
        @NotNull String translationKey
) {
}
