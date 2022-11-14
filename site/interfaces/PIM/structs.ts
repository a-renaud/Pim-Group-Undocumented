/** Pim answer to get pimInfo from AAdGroupId */
// #region

import { text } from "stream/consumers";

/**
 * 
 * Send notifications when members are assigned as eligible to this role:
 *           "caller":"Admin",
 *           "level":"Eligible",
 * 
 * Send notifications when members are assigned as active to this role: => Tab Assignment TIME IN MINUTE
 *           "caller":"Admin",
 *           "level":"Member",
 * 
 * Send notifications when eligible members activate this role: => Tab Activation TIME IN MINUTE
 *           "caller":"EndUser",
 *           "level":"Member",
 * 
 */

/**
 * 
 * if (EndUser/Member == Tab Activation)
 * => ExpirationRules max 1440 (24hours)
 * => MfaRule On/Off
 * => JustificationRule On/Off
 * => TicketingRule On/Off
 * => approval Rule => list approvers
 * => acrRule => list acr ?
 * 
 * if (Admin/Member == Tab Assignment Active _
 * => ExpirationRules max 525960 (1 year)
 * => MfaRule On/Off
 * => JustificationRule On/Off
 * => Notification Rule
 * 
 * 
 * if (Admin/Eligible) == Tab Assignment Eligible
 * => Expiration Rule
 * => Notification Rule
 * 
 * 
 */

export type PimRuleStr = "ExpirationRule" | "MfaRule" | "JustificationRule" | "TicketingRule" | "ApprovalRule" | "AcrRule" | "NotificationRule" | 'AttributeConditionRule';

export type PimRule = ExpirationRule | NotificationRule | MfaRule | JustificationRule | TicketingRule | ApprovalRule;
export type CallerType = 'Admin' | 'EndUser'
export type LevelType = 'Eligible' | 'Member'

export enum RECIPIENT_TYPE {
    NOTIFICATION_TO_THE_ASSIGNED_USER = 0,
    REQUEST_TO_APPROVE_A_ROLE_ASSIGNMENT_RENEWAL_OR_EXTENSION = 1,
    ROLE_ASSIGNMENT_ALERT = 2,
}

export enum NOTIFICATION_LEVEL {
    CRITICAL = 1,
    NORMAL = 2
}
export interface AcrsSettings {
    acrsRequired: boolean;
    acrs: string; // ?? 
}
export interface AcrsRule {
    setting: AcrsSettings;
}
// Expiration
export interface ExpirationRule {
    permanentAssignment: boolean;
    maximumGrantPeriodInMinutes: number;
}

//Mfa
export interface MfaRule {
    mfaRequired: boolean;
}

export interface JustificationRule {
    required: boolean;
}

export interface TicketingRule {
    ticketingRequired: boolean;
}

export interface Approvers {
    id: string; /* AADUserId or AADGroupId */ 
    type : 'group' | 'user';
    displayName: string; /** AADUserDisplayName or AADGroupDisplayName */
}
export interface ApprovalRule {
    enabled: boolean;
    approvers: Approvers[];
}

//Notification
export interface NotificationSetting {
    customReceivers: null | string[];
    isDefaultReceiverEnabled: boolean;  
    notificationLevel: NOTIFICATION_LEVEL;
    recipientType: RECIPIENT_TYPE; 
}   

export interface NotifificationPolicy {
    deliveryMechanism: string;
    setting: NotificationSetting[];
}

export interface NotificationRule {
    policies : NotifificationPolicy[];

}



export interface Value {
    ruleIdentifier: string;
    setting: string; // this is a PimRule that is stringified;
}



export interface LifeCycleManagement {
    caller: CallerType;
    level: LevelType;
    operation: string;
    value: Value[];
}

export interface Resource {
    id: string;
    externalId: string;
    type: string;
    displayName: string;
    status: string;
    onboardDateTime: Date;
    registeredDateTime: Date;
    managedAt?: any;
    registeredRoot?: any;
    originTenantId?: any;
}

export interface Resource2 {
    id: string;
    externalId: string;
    type: string;
    displayName: string;
    status: string;
    onboardDateTime: Date;
    registeredDateTime: Date;
    managedAt?: any;
    registeredRoot?: any;
    originTenantId?: any;
}

export interface RoleDefinition {
    id: string;
    resourceId: string;
    externalId: string;
    templateId: string;
    displayName: string;
    type?: any;
    resource: Resource2;
}

export interface PimGroupInfo {
    id: string;
    resourceId: string;
    roleDefinitionId: string;
    isDefault: boolean;
    lastUpdatedDateTime?: Date;
    lastUpdatedBy: string;
    lifeCycleManagement: LifeCycleManagement[];
    resource: Resource;
    roleDefinition: RoleDefinition;
}

export interface PimApiAnswer {
    memberInfo : PimGroupInfo;
    ownerInfo : PimGroupInfo;
} 

export interface RoleDefinitionPayload {
    id: string;
    templateId: string;
    displayName: string;
    type?: any;
    resource: Resource2;
}

export interface PimApiUpdatePayload {
    id : string, // PimGroupID of the group being updated
    lifeCycleManagement : LifeCycleManagement[] // the new lifeCycleManagement
    roleDefinition : RoleDefinitionPayload // the new roleDefinitionId => same as PimApiAnswer=>GroupInfo=>RoleDefinition
    resource: Resource // Group Identifier => same as PimApiAnswer=>GroupInfo=>Resource
}

// #endregion

// #region



// #endregion