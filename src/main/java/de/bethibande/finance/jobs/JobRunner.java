package de.bethibande.finance.jobs;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.util.Objects;
import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import java.util.concurrent.locks.LockSupport;

public class JobRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(JobRunner.class);

    private final AtomicReference<JobRunnerState> state = new AtomicReference<>(JobRunnerState.IDLE);

    private final JobScheduler scheduler;
    private final JobService jobService;
    private final ObjectMapper objectMapper;
    private final Executor executor;

    public JobRunner(final JobScheduler scheduler,
                     final JobService jobService,
                     final ObjectMapper objectMapper,
                     final Executor executor) {
        this.scheduler = scheduler;
        this.jobService = jobService;
        this.objectMapper = objectMapper;
        this.executor = executor;
    }

    public boolean isActive(final JobContext<?> ctx) {
        return switch (state.get()) {
            case JobRunnerState.Idle _ -> false;
            case JobRunnerState.Running<?> s -> Objects.equals(s.ctx(), ctx);
        };
    }

    public boolean tryAcquire(final Job job) {
        if (!state.compareAndSet(JobRunnerState.IDLE, new JobRunnerState.Running<>(job, null, null))) return false;

        try {
            final Instant now = Instant.now();
            if (!jobService.acquireLock(job, now)) {
                state.set(JobRunnerState.IDLE);
                return false;
            }

            job.lockTimeout = now;

            run(job);
            return true;
        } catch (Throwable th) {
            LOGGER.error("Encountered an error whilst trying to acquire job", th);
            state.set(JobRunnerState.IDLE);
            return false;
        }
    }

    private <C> JobContext<C> createContext(final Job job, final JobTask<C> task) {
        try {
            final C config = objectMapper.readValue(job.configJson, task.getConfigType());
            final JobContext<C> ctx = new JobContext<>(
                    this,
                    job,
                    config,
                    executor,
                    scheduler,
                    LoggerFactory.getLogger(task.getClass())
            );

            state.set(new JobRunnerState.Running<>(job, task, ctx));
            return ctx;
        } catch (final JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    @SuppressWarnings("unchecked")
    private <C> void run(final Job job) {
        final JobTask<C> task = (JobTask<C>) jobService.findTaskById(job.type).orElseThrow(() -> new IllegalArgumentException("No task found for type " + job.type));
        final JobContext<C> ctx = createContext(job, task);

        executor.execute(() -> runTask(job, task, ctx));
        executor.execute(() -> retainLockTask(job));
    }

    private void retainLockTask(final Job job) {
        final JobRunnerState state = this.state.get();
        while (Objects.equals(this.state.get(), state)) {
            final Instant now = Instant.now();
            if (jobService.extendLock(job, job.lockTimeout, now)) {
                job.lockTimeout = now;
                LOGGER.debug("Extended lock timeout for job {}", job.id);
            } else {
                final Job current = jobService.findById(job.id);
                if (Objects.equals(this.state.get(), JobRunnerState.IDLE) || current.lockTimeout == null) return;

                LOGGER.warn("Lost lock on job {}", job.id);
                this.state.set(JobRunnerState.IDLE);
            }

            LockSupport.parkNanos(TimeUnit.MINUTES.toNanos(1));
        }
    }

    private <C> void runTask(final Job job, final JobTask<C> task, final JobContext<C> ctx) {
        try {
            task.execute(ctx).join();

            state.set(JobRunnerState.IDLE);
            jobService.markAsExecuted(job.id);
        } catch (final Throwable th) {
            state.set(JobRunnerState.IDLE);
            jobService.releaseLock(job);
            LOGGER.error("Encountered an error whilst trying to run task: {}", ctx, th);
        }
    }

}
