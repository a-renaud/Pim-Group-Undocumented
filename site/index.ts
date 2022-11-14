/**
 * 
 * Scripts provided AS IS. No support provided.
 * This will leverage undocumented PIM APIs that may change at any time.
 * This script is not stamped by Microsoft.
 * 
 * Contact : Alexandre RENAUD
 * 
 */


import * as readline from 'readline-sync';
import { DeviceCodeInfo } from '@azure/identity';
import { Message, User, Group } from '@microsoft/microsoft-graph-types-beta';

import settings, { AppSettings } from './interfaces/Graph/appSettings';
import * as graphHelper from './Util/graphHelper';

import { print } from './Util/util';
import { Pim } from './interfaces/Graph/pim';

import util  from 'util'
import { UpdateData, UPDATE_TYPE } from './interfaces/PIM/updateData';
import { Undocumented } from './interfaces/PIM/undocumented';

require('dotenv').config()


async function main(){
    print("Starting...");
    //Initialize GraphAPI
    initializeGraph(settings); //This is to get the user token with a device code


    try {

        /* this gets the configuration of the AAD Group based on the group id - You need to have a valid token for that */
        const answer = await Undocumented.getPimInfoFromAadId(process.env["GROUP_ID"] || "");
        if (!answer){ throw new Error('answer is required'); }

       /*
        * 
        *  We create an object from the JSON. We will be able to modify this object 
        *  The PIM object has 2 arrays, depending on the assignment type (MEMBER or OWNER)
        *  We will need to specify in each request which assignment type we are working with
        * 
        */
        const originalPimObject = new UpdateData(answer); 
        if (!originalPimObject){ throw new Error('pimObject is required'); }

        let previousStatus = originalPimObject.getMemberActivationJustificationStatus();
        print(`Previous status is ${previousStatus}`);	


        /**
         * From now on we can do any change we may see fit. 
         * We need to always specify the assignment type (MEMBER or OWNER)
         * Then we need to decide which value we need to change
         * 
         * 
        */
        let updatedPimObject = originalPimObject.updateActivationJustification(
            !originalPimObject.getMemberActivationJustificationStatus(),
             originalPimObject.getMemberInfo()
        ); // We just flip a boolean

        originalPimObject.update(originalPimObject.getMemberInfo(), updatedPimObject);
        await Undocumented.patchPimGroupConfiguration(originalPimObject.getPayload());


    } catch (error) {
        throw error;
    }


}



main();

function initializeGraph(settings: AppSettings) {
    graphHelper.initializeGraphForUserAuth(settings, (info: DeviceCodeInfo) => {
        print(info.message);
    });
}


async function entryPoint(){
     
}