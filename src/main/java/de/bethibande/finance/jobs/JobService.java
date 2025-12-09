package de.bethibande.finance.jobs;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.bethibande.finance.model.jpa.Job;
import io.quarkus.arc.All;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@ApplicationScoped
public class JobService {

    @Inject
    protected ObjectMapper mapper;

    @All
    @Inject
    protected List<JobTask<?>> tasks;

    @SuppressWarnings("unchecked")
    public <T extends JobTask<?>> Optional<T> findTaskById(final String id) {
        return tasks.stream()
                .filter(task -> Objects.equals(task.getTaskIdentifier(), id))
                .map(task -> (T) task)
                .findAny();
    }

    public List<Job> listPendingJobs() {
        final Instant now = Instant.now();
        final Instant nowTimeout = now.minus(5, ChronoUnit.MINUTES);
        return Job.list("nextScheduledExecution <= ?1 AND (lockTimeout <= ?2 OR lockTimeout IS NULL) AND (lastSuccessfulExecution IS NULL OR lastSuccessfulExecution <= nextScheduledExecution)", now, nowTimeout);
    }

    @Transactional
    public Job findById(final long id) {
        return Job.findById(id);
    }

    @Transactional
    public void releaseLock(final Job job) {
        Job.update("lockTimeout = NULL WHERE lockTimeout = ?1 AND id = ?2", job.lockTimeout, job.id);
    }

    @Transactional
    public void markAsExecuted(final long id) {
        final Job job = Job.findById(id);
        if (job == null) throw new IllegalArgumentException("Job id " + id + " not found");

        job.lastSuccessfulExecution = Instant.now();
        job.lockTimeout = null;

        job.persist();
    }

    @Transactional
    public boolean acquireLock(final Job job, final Instant now) {
        if (job.lockTimeout == null) {
            return Job.update("lockTimeout = ?1 WHERE id = ?2 AND lockTimeout IS NULL", now, job.id) > 0;
        }
        return extendLock(job, job.lockTimeout, now);
    }

    @Transactional
    public boolean extendLock(final Job job, final Instant previousLock, final Instant now) {
        return Job.update("lockTimeout = ?1 WHERE id = ?2 AND lockTimeout = ?3", now, job.id, previousLock) > 0;
    }

}
