import { PageCollection, PageIterator, PageIteratorCallback } from "@microsoft/microsoft-graph-client";
import { ensureGraphForAppOnlyAuth, getAppClient } from "../../Util/graphHelper";



export interface RoleEligibilityScheduleRequest {
    action : string,
    justification : string,
    roleDefinitionId: string,
    directoryScopeId:   string,
    scheduleInfo : {
        startDateTime : string,
        expiration : {
            endDateTime : string,
            type : string
        }
    }
};


export class Pim {


    public static async  getCurrentAssignmentsAsync() : Promise<PageCollection | undefined> {
        ensureGraphForAppOnlyAuth();

        let appClient = getAppClient();
        if (!appClient) { return undefined }
        let response : PageCollection = await appClient.api("/policies/roleManagementPolicyAssignments")
            .version('beta')
            .filter('scopeId eq \'/\' and scopeType eq \'Directory\'')
            .get();
        return response
    }

    public static async  getRoleAssignmentScheduleRequestsAsync() : Promise<PageCollection | undefined> {
        ensureGraphForAppOnlyAuth();
        let appClient = getAppClient();
        if (!appClient) { return undefined }
        let response : PageCollection = await appClient.api("/roleManagement/directory/roleAssignmentScheduleRequests")
            .version('beta')
            .get();
        return response
    }

    public static async getRoleManagementPolicyAssignmentsAsync(expendRules : boolean = false) : Promise<PageCollection | undefined> {
        ensureGraphForAppOnlyAuth();
        let appClient = getAppClient();
        if (!appClient) { return undefined }
        if (expendRules){
            let response : PageCollection = await appClient.api("/policies/roleManagementPolicies")
                .filter('scopeId eq \'/\' and scopeType eq \'Directory\'')
                .version('beta')
                .expand('rules')
                .get();
            return response
        } else {
            let response : PageCollection = await appClient.api("/policies/roleManagementPolicies")
                .filter('scopeId eq \'/\' and scopeType eq \'Directory\'')
                .get();
            return response
        }
    }

    public static async getRoleManagementPolicyFromId(id : string) : Promise<PageCollection | undefined> {
        ensureGraphForAppOnlyAuth();
        let appClient = getAppClient();
        if (!appClient) { return undefined }
        let response : PageCollection = await appClient.api(`/policies/roleManagementPolicies/${id}`)
            .version('beta')
            .get();
        return response
    }

    public static async getRoleRulesFromId(id : string) : Promise<PageCollection | undefined> {
        ensureGraphForAppOnlyAuth();
        let appClient = getAppClient();
        if (!appClient) { return undefined }
        let response : PageCollection = await appClient.api(`/policies/roleManagementPolicies/${id}/rules`)
            .version('beta')
            .get();
        return response
    }



}