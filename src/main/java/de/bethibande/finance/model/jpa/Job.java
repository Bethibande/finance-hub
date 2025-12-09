package de.bethibande.finance.model.jpa;

import com.bethibande.process.annotation.EntityDTO;
import com.bethibande.process.annotation.VirtualDTOField;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Entity
@EntityDTO(excludeProperties = {"lockTimeout"}, name = "JobDTO")
@EntityDTO(excludeProperties = {"id", "lockTimeout", "lastSuccessfulExecution", "jobState"}, name = "JobDTOWithoutId")
@EntityDTO(excludeProperties = {"lockTimeout", "workspace", "lastSuccessfulExecution", "jobState"}, name = "JobDTOWithoutWorkspace")
public class Job extends WorkspaceEntity {

    @Column(nullable = false)
    public String name;

    @Column(nullable = false)
    public String type;

    @Column(nullable = false)
    public String configJson;

    public Instant nextScheduledExecution;
    public Instant lastSuccessfulExecution;
    public Instant lockTimeout;

    public String notes;

    protected boolean isPending() {
        final Instant now = Instant.now();
        final Instant nowTimeout = now.minus(5, ChronoUnit.MINUTES);

        return nextScheduledExecution != null
                && !(now.isBefore(nextScheduledExecution))
                && (lockTimeout == null || !(nowTimeout.isBefore(lockTimeout)))
                && (lastSuccessfulExecution == null || !(nextScheduledExecution.isBefore(lastSuccessfulExecution)));
    }

    public boolean isRunning() {
        final Instant now = Instant.now();
        final Instant nowTimeout = now.minus(5, ChronoUnit.MINUTES);

        return lockTimeout != null
                && nowTimeout.isBefore(lockTimeout)
                && (lastSuccessfulExecution == null || lockTimeout.isAfter(lastSuccessfulExecution));
    }

    public boolean isScheduled() {
        return nextScheduledExecution != null
                && (lastSuccessfulExecution == null || nextScheduledExecution.isAfter(lastSuccessfulExecution));
    }

    @VirtualDTOField
    public JobState getState() {
        if (isPending()) return JobState.PENDING;
        if (isRunning()) return JobState.RUNNING;
        if (isScheduled()) return JobState.SCHEDULED;
        return JobState.NOT_SCHEDULED;
    }

}
