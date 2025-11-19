package de.bethibande.finance.jobs;

import java.util.List;

public record ECBExchangeRatesConfig(
        List<Long> includeAssets
) {
}
