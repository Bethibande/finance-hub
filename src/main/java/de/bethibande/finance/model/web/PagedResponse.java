package de.bethibande.finance.model.web;

import io.quarkus.hibernate.orm.panache.PanacheQuery;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record PagedResponse<T>(
        @NotNull int page,
        @NotNull int pageSize,
        @NotNull int totalPages,
        @NotNull int totalElements,
        @NotNull List<@NotNull T> data
) {

    public static <T> PagedResponse<T> of(final int page,
                                          final int size,
                                          final PanacheQuery<T> query) {
        return of(page, size, query.count(), query.list());
    }

    public static <T> PagedResponse<T> of(final int page,
                                          final int size,
                                          final long count,
                                          final List<T> data) {
        return new PagedResponse<>(
                page,
                size,
                (int) Math.ceil((double) count / size),
                (int) count,
                data
        );
    }

}
