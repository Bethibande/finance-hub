package de.bethibande.finance.web.crud;

import io.quarkus.panache.common.Sort;

public record CRUDSortOrder(
        String field,
        Sort.Direction direction
) {
}
