package de.bethibande.finance.jobs;

public sealed interface JobResult permits JobResult.Success, JobResult.Failure {

    static JobResult success() {
        return new JobResult.Success();
    }

    static JobResult failure(final Throwable cause) {
        return new JobResult.Failure(cause);
    }

    final class Success implements JobResult {

    }

    final class Failure implements JobResult {

        private final Throwable cause;

        public Failure(final Throwable cause) {
            this.cause = cause;
        }

        public Throwable getCause() {
            return cause;
        }
    }

}
