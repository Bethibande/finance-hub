package de.bethibande.finance.web.crud;

import io.quarkus.panache.common.Sort;
import io.quarkus.runtime.annotations.RegisterForReflection;

@RegisterForReflection
public record CRUDSortOrder(
        String field,
        Sort.Direction direction
) {
}
