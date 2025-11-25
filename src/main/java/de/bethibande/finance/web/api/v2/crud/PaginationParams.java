package de.bethibande.finance.web.api.v2.crud;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.bethibande.finance.web.api.v1.crud.CRUDSortOrder;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import jakarta.inject.Inject;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.QueryParam;

import java.util.List;

public class PaginationParams {

    @Min(0)
    @DefaultValue("0")
    @QueryParam("page")
    public int page;

    @Min(0)
    @Max(500)
    @DefaultValue("20")
    @QueryParam("size")
    public int size;

    @QueryParam("sort[]")
    public List<String> sortOrders;

    @Inject
    protected ObjectMapper objectMapper;

    public Page getPage() {
        return Page.of(this.page, this.size);
    }

    public Sort getSort() {
        final List<CRUDSortOrder> orders = sortOrders.stream().map(this::parseSortOrder).toList();
        final Sort sort = Sort.empty();
        for (final CRUDSortOrder order : orders) {
            sort.and(
                    order.field(),
                    order.direction(),
                    order.direction() == Sort.Direction.Descending
                            ? Sort.NullPrecedence.NULLS_LAST
                            : Sort.NullPrecedence.NULLS_FIRST
            );
        }

        return sort;
    }

    private CRUDSortOrder parseSortOrder(final String sortOrder) {
        try {
            return objectMapper.readValue(sortOrder, CRUDSortOrder.class);
        } catch (final JsonProcessingException ex) {
            throw new BadRequestException("Bad sort order: " + sortOrder);
        }
    }

}
