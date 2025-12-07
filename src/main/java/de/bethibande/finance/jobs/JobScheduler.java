package de.bethibande.finance.jobs;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.scheduler.Scheduled;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

@ApplicationScoped
public class JobScheduler {

    private static final Logger LOGGER = LoggerFactory.getLogger(JobScheduler.class);

    @Inject
    protected JobService jobService;

    @Inject
    protected ObjectMapper objectMapper;

    protected final List<JobRunner> runners = new ArrayList<>();
    protected Executor executor = Executors.newVirtualThreadPerTaskExecutor();

    @PostConstruct
    public void init() {
        for (int i = 0; i < 5; i++) {
            runners.add(new JobRunner(this, jobService, objectMapper, executor));
        }
    }

    @Transactional
    public void schedule(final Job job, final Instant nextExecution) {
        final Job actual = Job.findById(job.id);
        actual.nextScheduledExecution = nextExecution;
    }

    @Transactional
    @Scheduled(every = "1m")
    public void schedule() {
        final List<Job> jobs = jobService.listPendingJobs();

        for (final Job job : jobs) {
            final boolean isRunning = job.lockTimeout != null;
            for (final JobRunner runner : runners) {
                if (runner.tryAcquire(job)) {
                    LOGGER.debug("Acquired job {}: {}", job.id, job.type);
                    if (isRunning) LOGGER.warn("Acquired job {} after timeout", job.id);
                    break;
                }
            }
        }
    }

}
