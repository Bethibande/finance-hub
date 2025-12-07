package de.bethibande.finance.jobs;

import com.bethibande.process.annotation.EntityDTO;
import de.bethibande.finance.model.jpa.WorkspaceEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;

import java.time.Instant;

@Entity
@EntityDTO(excludeProperties = {"lockTimeout"}, name = "JobDTO")
@EntityDTO(excludeProperties = {"id", "lockTimeout", "lastSuccessfulExecution"}, name = "JobDTOWithoutId")
@EntityDTO(excludeProperties = {"lockTimeout", "workspace", "lastSuccessfulExecution"}, name = "JobDTOWithoutWorkspace")
public class Job extends WorkspaceEntity {

    @Column(nullable = false)
    public String type;

    @Column(nullable = false)
    public String configJson;

    public Instant nextScheduledExecution;
    public Instant lastSuccessfulExecution;
    public Instant lockTimeout;

    public String notes;

}
