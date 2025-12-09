import {type EntityFunctions, listV2} from "@/components/entity/entity-functions.ts";
import {type JobDTO, JobEndpointApi} from "@/generated";

export const JobAPI = new JobEndpointApi()

export const JobFunctions: EntityFunctions<JobDTO, number> = {
    list: listV2(JobAPI.apiV2JobWorkspaceIdGet.bind(JobAPI)),
    delete: id => JobAPI.apiV2JobIdDelete({id}),
    format: j => j.type,
    toId: j => j.id!
}