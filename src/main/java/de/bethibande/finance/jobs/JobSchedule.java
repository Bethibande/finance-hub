package de.bethibande.finance.jobs;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;

@Entity
public class JobSchedule extends PanacheEntity {

    @Column(nullable = false, columnDefinition = "VARCHAR(64)")
    public String jobId;

    @Column(nullable = false, columnDefinition = "VARCHAR(64)")
    public String cron;

    @Column(columnDefinition = "TEXT")
    public String config;

}
