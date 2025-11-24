package de.bethibande.finance.web.api.v1.crud;

import io.quarkus.panache.common.Sort;
import io.quarkus.runtime.annotations.RegisterForReflection;

@RegisterForReflection
public record CRUDSortOrder(
        String field,
        Sort.Direction direction
) {
}
