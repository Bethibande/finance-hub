import {type EntityFunctions, listV2Simple} from "@/components/entity/entity-functions.ts";
import {type UserDTOWithoutPassword, UserEndpointApi} from "@/generated";

export const UserAPI = new UserEndpointApi();

export const UserFunctions: EntityFunctions<UserDTOWithoutPassword, number> = {
    list: listV2Simple(UserAPI.apiV2UserGet.bind(UserAPI)),
    delete: id => UserAPI.apiV2UserIdDelete({id}),
    toId: u => u.id!,
    format: u => u.name
}