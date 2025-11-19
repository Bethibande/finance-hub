package de.bethibande.finance.jobs;

import de.bethibande.finance.model.jpa.Asset;
import io.vertx.core.Vertx;
import io.vertx.ext.web.client.WebClient;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.StringJoiner;
import java.util.concurrent.CompletionStage;

@ApplicationScoped
public class ECBExchangeRatesJob extends Job<ECBExchangeRatesConfig> {

    public static final String ID = "ecbExchangeRatesJob";
    public static final String DOWNLOAD_URL = "https://data-api.ecb.europa.eu/service/data/EXR/D.%s.EUR.SP00.A?format=csvdata&datail=dataonly&startPeriod=%s";

    private final WebClient client;

    public ECBExchangeRatesJob(final Vertx vertx) {
        super(ID, JobCategory.EXCHANGE_RATES);

        this.client = WebClient.create(vertx);
    }

    @Override
    public CompletionStage<JobResult> run(final ECBExchangeRatesConfig config) {
        final List<Asset> assets = Asset.findByIds(config.includeAssets());
        final StringJoiner codeJoiner = new StringJoiner("+");
        assets.forEach(asset -> codeJoiner.add(asset.code));

        final String url = DOWNLOAD_URL.formatted(codeJoiner.toString(), LocalDate.now().minus(Period.ofMonths(2)));
        return client.get(url)
                .send()
                .toCompletionStage()
                .thenApply(response -> {
                    final String data = response.bodyAsString();
                    System.out.println(data);

                    return JobResult.success();
                })
                .exceptionally(JobResult::failure);
    }
}
