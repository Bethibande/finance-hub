package de.bethibande.finance.web.api.v2;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.bethibande.finance.jobs.*;
import de.bethibande.finance.model.jpa.Workspace;
import de.bethibande.finance.model.web.PagedResponse;
import de.bethibande.finance.web.api.v2.crud.AbstractCRUDEndpoint;
import de.bethibande.finance.web.api.v2.crud.WorkspacedParams;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;

@Path("/api/v2/job")
public class JobEndpoint extends AbstractCRUDEndpoint {

    @Inject
    protected JobService jobService;

    @Inject
    protected ObjectMapper objectMapper;

    protected void validateJobConfigString(final Job job) {
        final JobTask<?> task = jobService.findTaskById(job.type).orElseThrow(NotFoundException::new);
        try {
            final Object _ = objectMapper.readValue(job.configJson, task.getConfigType());
        } catch (final JsonProcessingException e) {
            throw new BadRequestException(e);
        }
    }

    @POST
    @Transactional
    public JobDTO createJob(final JobDTOWithoutId dto) {
        final Job job = new Job();
        job.type = dto.type();
        job.configJson = dto.configJson();
        job.notes = dto.notes();
        job.nextScheduledExecution = dto.nextScheduledExecution();
        job.workspace = Workspace.findById(dto.workspaceId());

        if (job.workspace == null) throw new NotFoundException();

        validateJobConfigString(job);

        job.persist();

        return JobDTO.from(job);
    }

    @PATCH
    @Transactional
    public JobDTO updateJob(final JobDTOWithoutWorkspace dto) {
        final Job job = Job.findById(dto.id());
        if (job == null) throw new NotFoundException();

        job.type = dto.type();
        job.configJson = dto.configJson();
        job.nextScheduledExecution = dto.nextScheduledExecution();
        job.notes = dto.notes();

        validateJobConfigString(job);

        return JobDTO.from(job);
    }

    @GET
    @Transactional
    @Path("/{workspace_id}")
    public PagedResponse<JobDTO> getJobs(final @BeanParam WorkspacedParams params) {
        final PanacheQuery<Job> query = Job.find("workspace.id = ?1", params.getSort(), params.workspaceId)
                .page(params.getPage());

        return PagedResponse.of(
                params.page,
                params.size,
                query.count(),
                query.stream().map(JobDTO::from).toList()
        );
    }

    @Override
    protected boolean hasDependents(final long id) {
        return false;
    }

    @Override
    protected void deleteById(final long id) {
        Job.deleteById(id);
    }
}
