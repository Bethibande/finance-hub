package de.bethibande.finance.jobs;

import org.slf4j.Logger;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.Executor;

public class JobContext<C> {

    private final JobRunner runner;

    private final Job job;
    private final C config;
    private final Executor executor;
    private final JobScheduler scheduler;
    private final Logger logger;

    public JobContext(final JobRunner runner,
                      final Job job,
                      final C config,
                      final Executor executor,
                      final JobScheduler scheduler,
                      final Logger logger) {
        this.runner = runner;
        this.job = job;
        this.config = config;
        this.executor = executor;
        this.scheduler = scheduler;
        this.logger = logger;
    }

    public void reschedule(final Instant nextExecution) {
        scheduler.schedule(job, nextExecution);
    }

    public void reschedule(final Duration duration) {
        reschedule(Instant.now().plus(duration));
    }

    public boolean isActive() {
        return runner.isActive(this);
    }

    public C getConfig() {
        return config;
    }

    public Executor getExecutor() {
        return executor;
    }

    public JobScheduler getScheduler() {
        return scheduler;
    }

    public Logger getLogger() {
        return logger;
    }
}
