import { PageCollection, PageIterator, PageIteratorCallback } from "@microsoft/microsoft-graph-client";
import { ensureGraphForAppOnlyAuth, getAppClient } from "../../Util/graphHelper";
import { User } from '@microsoft/microsoft-graph-types-beta';
import { print } from "../../Util/util";
 
 export class GraphUsers {

    public static async getUsersAsyncRaw(): Promise<PageCollection | undefined> {
        ensureGraphForAppOnlyAuth();


        let appClient = getAppClient();
        if (!appClient) { return undefined }
        let response : PageCollection = await appClient.api("/users").get();
        print(response.value);
 

        let userIteratorCallback : PageIteratorCallback = (d) => {
            console.log('uicb' , d.displayName);
            return true;
        }

        let pageIterator = new PageIterator(appClient, response, userIteratorCallback);
        await pageIterator.iterate();

        return response;
    }

 }