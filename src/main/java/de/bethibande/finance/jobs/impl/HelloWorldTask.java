package de.bethibande.finance.jobs.impl;

import de.bethibande.finance.jobs.JobContext;
import de.bethibande.finance.jobs.JobTask;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.Duration;
import java.util.concurrent.CompletableFuture;

@ApplicationScoped
public class HelloWorldTask implements JobTask<Object> {

    @Override
    public String getTaskIdentifier() {
        return "hello_world";
    }

    @Override
    public Class<Object> getConfigType() {
        return Object.class;
    }

    @Override
    public CompletableFuture<Void> execute(final JobContext<Object> ctx) {
        ctx.getLogger().info("Hello World!");

        ctx.reschedule(Duration.ofMinutes(1));
        return CompletableFuture.completedFuture(null);
    }
}
