

import 'isomorphic-fetch'
import { ClientSecretCredential, DeviceCodeCredential, DeviceCodePromptCallback } from '@azure/identity'
import { Client, PageCollection } from '@microsoft/microsoft-graph-client'
import { User, Message } from '@microsoft/microsoft-graph-types-beta'
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials'
import { AppSettings } from '../interfaces/Graph/appSettings'

let _settings : AppSettings | undefined = undefined;
let _deviceCodeCredential : DeviceCodeCredential | undefined = undefined;
let _userClient : Client | undefined = undefined;
let _clientSecretCredential : ClientSecretCredential | undefined = undefined;
let _appClient : Client | undefined = undefined;
import * as fs from 'fs';


export function getAppClient() : Client | undefined {
    return _appClient;
}


export function initializeGraphForUserAuth(settings : AppSettings, deviceCodePrompt : DeviceCodePromptCallback) {
    if (!settings){ throw new Error('settings is required'); }

    _settings = settings;

    _deviceCodeCredential = new DeviceCodeCredential({
        clientId: settings.clientId,
        tenantId: settings.tenantId,
        userPromptCallback : deviceCodePrompt
    });

    const authProviders = new TokenCredentialAuthenticationProvider(_deviceCodeCredential, {
        scopes : settings.graphUserScopes
    });

    _userClient = Client.initWithMiddleware({ authProvider : authProviders });
}

export async function getUserTokenAsync() : Promise<string> {
    if (!_deviceCodeCredential){ throw new Error('_deviceCodeCredential is required'); }

   if (!_settings?.graphUserScopes){
         throw new Error('settings scopes are required');
   }

   const response = await _deviceCodeCredential.getToken(_settings?.graphUserScopes);
   return response.token;
}

export async function getLocalUserToken(){
    const tokenPath = './raw_token.ini';
    let exists = fs.existsSync(tokenPath);
    if (!exists){
        fs.writeFileSync(tokenPath, '', 'utf-8');
    }
    exists = fs.existsSync(tokenPath);
    if (!exists){
        throw new Error('token path does not exist');
    }

    let token = fs.readFileSync(tokenPath, 'utf8');
    if (!token || token == '') { 
        throw new Error('token is empty or does not exists');
    }
    return token;
}



export function ensureGraphForAppOnlyAuth() {
    if (!_settings){
        
        throw new Error('settings are required');
    }

    if (!_clientSecretCredential){
        _clientSecretCredential = new ClientSecretCredential(
            _settings.tenantId,
            _settings.clientId,
            _settings.clientSecret,
   
        );
    }

    if (!_appClient){
        const authProvider = new TokenCredentialAuthenticationProvider(_clientSecretCredential, {
            scopes : [ 'https://graph.microsoft.com/.default' ]
        });

        _appClient = Client.initWithMiddleware({ authProvider : authProvider });
    }
}

export async function getUsersAsync(limit:number = 25): Promise<PageCollection> {
    ensureGraphForAppOnlyAuth();
  
    return _appClient?.api('/users')
      .select(['displayName', 'id', 'mail'])
      .top(limit)
      .get();
}

export async function getGroupsAsync(limit:number = 25): Promise<PageCollection> {
    ensureGraphForAppOnlyAuth();
  
    return _appClient?.api('/groups')
      .top(limit)
      .get();
}

export async function getDevicesAsync() : Promise<PageCollection> {
    ensureGraphForAppOnlyAuth();
    return _appClient?.api('/devices')
    .get();
}

export function initSettingsApp(settings : AppSettings) {
    _settings = settings;
}
 



