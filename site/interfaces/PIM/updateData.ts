import { CallerType, JustificationRule, LevelType, LifeCycleManagement, PimApiAnswer, PimApiUpdatePayload, PimGroupInfo, PimRule, PimRuleStr, RoleDefinitionPayload } from "./structs";
import util  from 'util'
export enum UPDATE_TYPE {
    ACTIVATION = 0,
    ELIGIBLE_ASSIGNMENT = 1,
    ACTIVE_ASSIGNMENT = 2,
}

export class UpdateData {

    private _pimApiAnswer : PimApiAnswer;
    private _payload : PimApiUpdatePayload | undefined;

    constructor(pimApiAnswer : PimApiAnswer){
        this._pimApiAnswer = pimApiAnswer;
    }

    public get pimApiAnswer() : PimApiAnswer {
        return this._pimApiAnswer;
    }

    public set pimApiAnswer(v : PimApiAnswer) {
        this._pimApiAnswer = v;
    }

    public getMemberInfo() : PimGroupInfo {
        return this._pimApiAnswer.memberInfo;
    }

    public getOwnerInfo() : PimGroupInfo {
        return this._pimApiAnswer.ownerInfo;
    }

    public getAnswer() : PimApiAnswer {
        return this._pimApiAnswer;
    }

    public getPayload() : PimApiUpdatePayload | undefined {
        return this._payload;
    }

    /**
     * 
     * @returns [ OwnerLifeCycleManagementArray, MemberLifeCyclineManagementArray ]
     */
    public getAnswerLifeCicleManager() : [LifeCycleManagement[], LifeCycleManagement[]] {
        return [this._pimApiAnswer.ownerInfo.lifeCycleManagement, this._pimApiAnswer.memberInfo.lifeCycleManagement];
    }
    public getOwnerConfiguration() : LifeCycleManagement[] {
        return this.getAnswerLifeCicleManager()[0];
    }
    public getMemberConfiguration() : LifeCycleManagement[] {
        return this.getAnswerLifeCicleManager()[1];
    }

    public getMemberActivationJustificationStatus() : boolean {
        let lifeCycle = this.getMemberConfigurationByType(UPDATE_TYPE.ACTIVATION);
        if (!lifeCycle){
            throw new Error("LifeCycleManagement is undefined");
        }
        let rule = lifeCycle.value.find(o=> o.ruleIdentifier == 'JustificationRule');
        if (rule === undefined){
            throw new Error("JustificationRule not found in this lifecycle");
        }

        let justificationRule = JSON.parse(rule.setting) as JustificationRule;
        return justificationRule.required;
    }

    // #region LifeCycleManagement
    public getConfigurationByType(groupInfo : PimGroupInfo, updateType : UPDATE_TYPE) : LifeCycleManagement | undefined {
        let caller : CallerType | undefined;
        let level : LevelType | undefined
        switch(updateType){
            case UPDATE_TYPE.ACTIVATION:
                caller = 'EndUser';
                level = 'Member';
                break;
            case UPDATE_TYPE.ELIGIBLE_ASSIGNMENT:
                caller = 'Admin';
                level = 'Eligible';
                break;
            case UPDATE_TYPE.ACTIVE_ASSIGNMENT:
                caller = 'Admin';
                level = 'Member';
                break;
            default:
                break;
        }
        if (!caller || !level) {
            throw new Error("Invalid LevelType or Caller Type for Configuration");
        }

        let configuration : LifeCycleManagement | undefined = groupInfo.lifeCycleManagement.find((l) => l.caller == caller && l.level == level);
        if (configuration === undefined){
            throw new Error("Configuration not found");
        }

        return configuration;
    }

    public getOwnerConfigurationByType(updateType : UPDATE_TYPE) : LifeCycleManagement | undefined {
        return this.getConfigurationByType(this.getOwnerInfo(), updateType);
    }


    public getMemberConfigurationByType(updateType : UPDATE_TYPE) : LifeCycleManagement | undefined {
        return this.getConfigurationByType(this.getMemberInfo(), updateType);
    }

    // #endregion LifeCycleManagement

    public getRules(lifeCycle : LifeCycleManagement | undefined) : PimRule[] {
        if (!lifeCycle){
            throw new Error("LifeCycleManagement is undefined");
        }
        return lifeCycle.value.map(o=> JSON.parse(o.setting) as PimRule)
    }

    private getRuleByType(ruleType : PimRuleStr, lifeCycle : LifeCycleManagement) : PimRule | undefined {
        return lifeCycle.value.filter(o=> o.ruleIdentifier == ruleType).map(r => JSON.parse(r.setting) as PimRule)[0];
    }

    // The response is lighter than the information we get. We need to remove some stuff during the update
    public cleanLifeCycleResponseArray(lifeCycle : LifeCycleManagement[]) : LifeCycleManagement[] {
        let base = lifeCycle;
        for (let i = 0; i < base.length; i++) {
            let o = lifeCycle[i];
            if (o.caller == 'Admin' && o.level == 'Eligible'){ // Eligible Assignment
                let allowedRules : string[] = ['ExpirationRule', 'NotificationRule'];
                for (let j = 0; j < o.value.length; j++) {
                    let r = o.value[j];
                    if (!allowedRules.includes(r.ruleIdentifier)){
                        o.value.splice(j, 1);
                        j--;
                    }
                }
            }

            else if (o.caller == 'Admin' && o.level == 'Member'){ // Activation
                let allowedRules : string[] = ['ExpirationRule', 'NotificationRule', 'MfaRule', 'JustificationRule'];
                for (let j = 0; j < o.value.length; j++) {
                    let r = o.value[j];
                    if (!allowedRules.includes(r.ruleIdentifier)){
                        o.value.splice(j, 1);
                        j--;
                    }
                }
            }

            else if (o.caller == 'EndUser' && o.level == 'Member'){ // Active Assignment
                let allowedRules : string[] = ['ExpirationRule','MfaRule', 'NotificationRule', 'JustificationRule', 'TicketingRule', 'ApprovalRule', 'AcrsRule'];
                for (let j = 0; j < o.value.length; j++) {
                    let r = o.value[j];
                    if (!allowedRules.includes(r.ruleIdentifier)){
                        o.value.splice(j, 1);
                        j--;
                    }
                    if (r.ruleIdentifier == 'acrsRule'){
                        o.value[j].setting = '';
                    }
                }

            }

            else {
                base.splice(i, 1);
                i--;
            }
        }
        
        return base;
    }


    public updateX(status : boolean, groupInfo:  PimGroupInfo) : LifeCycleManagement[] {
        let lifeCycle : LifeCycleManagement | undefined = this.getConfigurationByType(groupInfo, UPDATE_TYPE.ACTIVE_ASSIGNMENT);
        return [];
    }


    public updateActivationJustification(status : boolean, groupInfo: PimGroupInfo) : LifeCycleManagement[] {
        let lifeCycle : LifeCycleManagement | undefined = this.getConfigurationByType(groupInfo, UPDATE_TYPE.ACTIVATION);
        if (!lifeCycle){
            throw new Error("LifeCycleManagement is undefined");
        }
        let rule = lifeCycle.value.find(o=> o.ruleIdentifier == 'JustificationRule');
        if (rule === undefined){
            throw new Error("JustificationRule not found in this lifecycle");
        }

        let justificationRule = JSON.parse(rule.setting) as JustificationRule;
        justificationRule.required = status;
        let str = JSON.stringify(justificationRule);

        lifeCycle.value = lifeCycle.value.filter(o=> o.ruleIdentifier != 'AttributeConditionRule');

        lifeCycle.value.forEach(v => {
            if (v.ruleIdentifier == 'JustificationRule'){
                v.setting = str;
            }
        });


        // Remove Enduser/Eligible from Info
        groupInfo.lifeCycleManagement = this.cleanLifeCycleResponseArray(groupInfo.lifeCycleManagement)


        return groupInfo.lifeCycleManagement;
        
    }


    // To create body for the patch request
    public update(pimGroup : PimGroupInfo, lifeCycles : LifeCycleManagement[]){

        let rdPayload : RoleDefinitionPayload = {
            id : pimGroup.roleDefinition.id,
            displayName : pimGroup.roleDefinition.displayName,
            templateId : pimGroup.roleDefinition.templateId ?? pimGroup.roleDefinition.externalId,
            resource : pimGroup.roleDefinition.resource,
        }
        if (this._payload === undefined){
            this._payload = {
                id : pimGroup.id,
                lifeCycleManagement : lifeCycles,
                roleDefinition : rdPayload,
                resource : pimGroup.resource
            }
        }

        this._payload.lifeCycleManagement = lifeCycles;
    }
}