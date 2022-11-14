import { PageCollection, PageIterator, PageIteratorCallback } from "@microsoft/microsoft-graph-client";
import { ensureGraphForAppOnlyAuth, getAppClient } from "../../Util/graphHelper";
 
 export class Devices {

    public static async getDevicesAsyncRaw(): Promise<PageCollection | undefined> {
        ensureGraphForAppOnlyAuth();
        let appClient = getAppClient();
        if (!appClient) { return undefined }
        let response : PageCollection = await appClient.api("/devices").get();
 

        let deviceIteratorCallback : PageIteratorCallback = (d) => {
            return true;
        }

        let pageIterator = new PageIterator(appClient, response, deviceIteratorCallback);
        await pageIterator.iterate();

        return response;
    }
 }