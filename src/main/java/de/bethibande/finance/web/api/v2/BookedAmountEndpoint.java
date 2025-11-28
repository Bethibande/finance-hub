package de.bethibande.finance.web.api.v2;


import de.bethibande.finance.model.jpa.Asset;
import de.bethibande.finance.model.jpa.Wallet;
import de.bethibande.finance.model.jpa.transaction.*;
import de.bethibande.finance.model.web.PagedResponse;
import de.bethibande.finance.security.Roles;
import de.bethibande.finance.web.api.v2.crud.BookedAmountParams;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import jakarta.annotation.security.RolesAllowed;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;

@Path("/api/v2")
@RolesAllowed({Roles.ADMIN, Roles.USER})
public class BookedAmountEndpoint {

    @POST
    @Transactional
    @Path("/transaction/{transaction_id}/book")
    public BookedAmountDTO createBookedAmount(final @PathParam("transaction_id") long transactionId,
                                              final BookedAmountDTOWithoutIdAndTransaction dto) {
        final BookedAmount amount = new BookedAmount();
        amount.transaction = Transaction.findById(transactionId);
        amount.amount = dto.amount();
        amount.asset = Asset.findById(dto.assetId());
        amount.date = dto.date();
        amount.wallet = Wallet.findById(dto.walletId());
        amount.notes = dto.notes();

        if (amount.transaction == null
                || amount.asset == null
                || amount.wallet == null) {
            throw new NotFoundException();
        }

        amount.persist();

        return BookedAmountDTO.from(amount);
    }

    @PATCH
    @Transactional
    @Path("/bookedamount")
    public BookedAmountDTO updateBookedAmount(final BookedAmountDTOWithoutTransaction dto) {
        final BookedAmount amount = BookedAmount.findById(dto.id());
        if (amount == null) throw new NotFoundException();

        amount.amount = dto.amount();
        amount.asset = Asset.findById(dto.assetId());
        amount.date = dto.date();
        amount.wallet = Wallet.findById(dto.walletId());
        amount.notes = dto.notes();

        if (amount.asset == null
                || amount.wallet == null) {
            throw new NotFoundException();
        }

        return BookedAmountDTO.from(amount);
    }

    @GET
    @Transactional
    @Path("/transaction/{transaction_id}/book")
    public PagedResponse<BookedAmountDTO> listBookedAmount(final @BeanParam BookedAmountParams params) {
        final PanacheQuery<BookedAmount> query = BookedAmount.find("transaction.id = ?1", params.getSort(), params.transactionId)
                .page(params.getPage());

        return PagedResponse.of(
                params.page,
                params.size,
                query.count(),
                query.stream().map(BookedAmountDTO::from).toList()
        );
    }

    @DELETE
    @Path("/bookedamount/{id}")
    @Transactional
    public void deleteBookedAmount(final @PathParam("id") long id) {
        BookedAmount.deleteById(id);
    }

}
