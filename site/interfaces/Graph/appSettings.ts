
const settings : AppSettings = {
    'clientId': process.env["CLIENT_ID"] || "",
    'clientSecret':process.env["CLIENT_SECRET"] || "",
    'tenantId' : process.env["TENANT_ID"] || "",
    'authTenant': 'common',
    'graphUserScopes': [
      'user.read',
      'mail.read',
      'mail.send'
    ]
}


export interface AppSettings {
    clientId: string;
    clientSecret: string;
    tenantId: string;
    authTenant: string;
    graphUserScopes: string[];
}

export default settings;