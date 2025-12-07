package de.bethibande.finance.jobs;

public sealed interface JobRunnerState permits JobRunnerState.Idle, JobRunnerState.Running {

    JobRunnerState IDLE = new Idle();

    final class Idle implements JobRunnerState {
        private Idle() {
        }
    }

    record Running<C>(
            Job job,
            JobTask<C> task,
            JobContext<C> ctx
    ) implements JobRunnerState {
    }

}
