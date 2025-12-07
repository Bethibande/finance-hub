package de.bethibande.finance.jobs;

import java.util.concurrent.CompletableFuture;

public interface JobTask<C> {

    String getTaskIdentifier();

    Class<C> getConfigType();

    CompletableFuture<Void> execute(final JobContext<C> ctx);

}
