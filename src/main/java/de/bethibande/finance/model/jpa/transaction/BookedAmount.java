package de.bethibande.finance.model.jpa.transaction;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import de.bethibande.finance.model.jpa.Asset;
import de.bethibande.finance.model.jpa.Depot;
import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
public class BookedAmount extends PanacheEntity {

    @JsonIgnore
    @ManyToOne(optional = false)
    public Transaction transaction;

    @Column(nullable = false)
    public BigDecimal amount;

    @ManyToOne(optional = false)
    public Asset asset;

    @Column(nullable = false)
    public LocalDate date;

    @ManyToOne(optional = false)
    public Depot depot;

    @Column
    public String notes;

}
