package de.bethibande.finance.jobs;

import java.util.concurrent.CompletionStage;

public abstract class Job<CONFIG> {

    private final String id;
    protected final JobCategory category;

    public Job(final String id, final JobCategory category) {
        this.id = id;
        this.category = category;
    }

    public boolean isSystemJob() {
        return false;
    }

    public JobCategory getCategory() {
        return category;
    }

    public abstract CompletionStage<JobResult> run(final CONFIG config) throws Exception;

}
