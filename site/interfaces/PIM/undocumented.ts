import * as graphHelper from '../../Util/graphHelper';
import { print } from '../../Util/util';
import { PimApiAnswer, PimApiUpdatePayload, PimGroupInfo } from './structs';
import util  from 'util'


export class Undocumented {
    public static baseURL = "https://api.azrbac.mspim.azure.com/api/v2/privilegedAccess/aadGroups/roleSettingsV2";

    private static pimAnswerContructor(membre : PimGroupInfo, admin : PimGroupInfo) : PimApiAnswer {
        return {
            memberInfo : membre,
            ownerInfo : admin
        }
    }

    /* The AAD Object ID differs from the PIMGroupID that is the AAD identifier for the PIM Api */
    /* Every PIM requests needs the PIMGroupID and not the AAD Group ObjectID*/
    private static getUrlAadIdToPimId(aadId: string) : string{
        let str = this.baseURL + `?$expand=resource,roleDefinition($expand=resource)&$filter=(resource/id+eq+%27${aadId}%27)&$orderby=lastUpdatedDateTime+desc`
        return str;
    }

 

    /*  */
    public static async getPimInfoFromAadId(aadId : string) : Promise<PimApiAnswer | undefined> {
        const token = await graphHelper.getLocalUserToken();
        let str = 'Bearer ' + token;

        const requestHeaders : HeadersInit = new Headers();
        requestHeaders.set(
            'Accept', 'application/json, text/javascript, */*; q=0.01'
        )
        requestHeaders.set(
            'Accept-Language', 'en'
        )

        requestHeaders.set(
            'Authorization', str
        )
        requestHeaders.set(
            'User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36'
        )
        requestHeaders.set(
            'x-ms-client-request-id', '126dc22a-b524-4b26-99b2-93a0cc7f500f'
        )
        requestHeaders.set(
            'x-ms-client-session-id', 'f091996c6f204f4dad9d4fd882684301'
        )
        requestHeaders.set(
            'x-ms-effective-locale', 'en.en-us'
        )

        const myUrl = this.getUrlAadIdToPimId(aadId)
        let pAnswer : PimApiAnswer | undefined;
        await fetch(
            myUrl, {
                method: 'GET',
                headers: requestHeaders
            }
        ).then(response=>response.json())
        .then(data=>{ 
            let memberIndex = 0;
            let adminIndex = 1;
            if (data.value[0].roleDefinition.displayName === 'Owner'){
                memberIndex = 1;
                adminIndex = 0;
            }
            pAnswer = this.pimAnswerContructor(data.value[memberIndex], data.value[adminIndex]);
        })
        if (!pAnswer) {
            return;
        }

        return pAnswer

    }

    

    public static async patchPimGroupConfiguration(pimPayload? : PimApiUpdatePayload) : Promise<void> {
        if (!pimPayload){
            throw new Error('pimPayload is undefined');
            return;
        }

        let url = this.baseURL + `/${pimPayload.id}`;	
        let bearer = 'Bearer ' + await graphHelper.getLocalUserToken();

        const requestHeaders : HeadersInit = new Headers();
        requestHeaders.set( 'Accept', '*/*' );
        requestHeaders.set( 'Accept-Language', 'en' );
        requestHeaders.set( 'Authorization', bearer );
        requestHeaders.set( 'Content-Type', 'application/json' );
        //requestHeaders.set( 'Referer', 'https://portal.azure.com/' );
        requestHeaders.set( 'User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36');

        let _body = JSON.stringify(pimPayload);
        await fetch(
            url, {
                method: 'PATCH',
                headers: requestHeaders,
                body: _body
            }
        ).then(response => { 
            console.log('status: ' + response.status);     
        }).then(data => console.log('datareponse: ' + data));

    }


    




}