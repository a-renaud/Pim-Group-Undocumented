import { PageCollection, PageIterator, PageIteratorCallback } from "@microsoft/microsoft-graph-client";
import { DirectoryRole, UnifiedRoleDefinition } from "@microsoft/microsoft-graph-types-beta";
import { ensureGraphForAppOnlyAuth, getAppClient } from "../../Util/graphHelper";


export class GraphRoles { 
    public static async  getRoles() : Promise<PageCollection | undefined> {
        ensureGraphForAppOnlyAuth();

        let appClient = getAppClient();
        if (!appClient) { return undefined }
        let response : PageCollection = await appClient.api("/directoryRoles")
            .version('beta')
            .get();
        return response
    }

    public static async getRoleFromDefinitionId(id : string) : Promise<UnifiedRoleDefinition | undefined> {
        ensureGraphForAppOnlyAuth();
        let appClient = getAppClient();
        if (!appClient) { return undefined }
        let response : UnifiedRoleDefinition = await appClient.api(`/roleManagement/directory/roleDefinitions/${id}`)
            .get();
        return response

    }
}