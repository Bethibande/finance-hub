package de.bethibande.finance.jobs;

import io.quarkus.arc.All;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class JobService {

    private final List<Job<?>> jobs;

    public JobService(final @All List<Job<?>> jobs) {
        this.jobs = jobs;
    }



}
