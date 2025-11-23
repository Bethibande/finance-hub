package de.bethibande.finance.model.web;

import io.quarkus.hibernate.orm.panache.PanacheQuery;

import java.util.List;

public record PagedResponse<T>(
        int page,
        int pageSize,
        int totalPages,
        int totalElements,
        List<T> data
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
