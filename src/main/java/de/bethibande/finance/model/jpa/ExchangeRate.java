package de.bethibande.finance.model.jpa;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;

import java.time.LocalDate;

@Entity
public class ExchangeRate extends PanacheEntity {

    @ManyToOne(optional = false)
    public Asset base;

    @ManyToOne(optional = false)
    public Asset quote;

    @Column(nullable = false)
    public Double rate;

    @Column(nullable = false)
    public LocalDate date;

}
