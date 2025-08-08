import PolicyRepository, { CreatePolicyData, UpdatePolicyData } from '../repositories/PolicyRepository';
import { PolicyType, PolicyStatus } from '../types/policy';
import { NotFoundError, ConflictError } from '../utils/errors';
import { POLICY_CONFIG } from '../config/policy';
import PolicyTemplateRepository from '../repositories/PolicyTemplateRepository';

class PolicyService {
    private repository: PolicyRepository;
    private templateRepository: PolicyTemplateRepository;

    constructor() {
        this.repository = new PolicyRepository();
        this.templateRepository = new PolicyTemplateRepository();
    }

    /**
     * Check if a policy needs upgrade based on template version
     */
    private async checkPolicyUpgrade(policy: any): Promise<any> {
        if (!(policy as any).templateId) {
            return policy;
        }

        const template = await this.templateRepository.findById((policy as any).templateId);
        if (!template) {
            return policy;
        }

        // Check if there's a newer template version
        const latestTemplate = await this.templateRepository.findLatestByName((template as any).name);
        
        if (latestTemplate && (latestTemplate as any).version !== (template as any).version) {
            return {
                ...policy.toJSON ? policy.toJSON() : policy,
                needsUpgrade: true,
                latestTemplateVersion: (latestTemplate as any).version,
                currentTemplateVersion: (template as any).version
            };
        }

        return policy;
    }

    async getPolicyById(id: string, companyId: string) {
        const policy = await this.repository.findByIdAndCompanyId(id, companyId);
        if (!policy) {
            throw new NotFoundError('Policy not found');
        }

        // Add upgrade flag if policy has template
        return await this.checkPolicyUpgrade(policy);
    }

    async getPoliciesByCompanyId(companyId: string, filters?: { status?: PolicyStatus; type?: PolicyType }) {
        const policies = await this.repository.findByCompanyId(companyId, filters);

        // Add upgrade flags to policies with templates
        const policiesWithUpgradeFlags = await Promise.all(
            policies.map(async (policy) => {
                return await this.checkPolicyUpgrade(policy);
            })
        );

        return policiesWithUpgradeFlags;
    }

    /**
     * Get only the latest approved version of each policy for acknowledgments
     */
    async getActivePoliciesForAcknowledgments(companyId: string): Promise<any[]> {
        const allPolicies = await this.repository.findByCompanyId(companyId, { status: PolicyStatus.APPROVED });
        
        // Group by name+type and get the latest version of each
        const policyMap = new Map<string, any>();
        
        allPolicies.forEach(policy => {
            const key = `${(policy as any).name}-${(policy as any).type}`;
            const existing = policyMap.get(key);
            
            if (!existing || (policy as any).version > (existing as any).version) {
                policyMap.set(key, policy);
            }
        });

        return Array.from(policyMap.values());
    }

    async getPoliciesByIds(policyIds: string[], companyId: string) {
        const policies = [];
        for (const policyId of policyIds) {
            try {
                const policy = await this.getPolicyById(policyId, companyId);
                policies.push(policy);
            } catch (error) {
                // Skip policies that don't exist or don't belong to the company
                continue;
            }
        }
        return policies;
    }


    async createPolicy(data: CreatePolicyData, companyId: string) {
        // Check if policy with same name and type already exists for this company
        const existingPolicy = await this.repository.findByCompanyIdAndNameAndType(
            companyId,
            data.name,
            data.type
        );
        if (existingPolicy) {
            throw new ConflictError('A policy with this name and type already exists for this company');
        }

        // Set default values
        const policyData = {
            ...data,
            companyId,
            status: data.status || POLICY_CONFIG.DEFAULT_STATUS as PolicyStatus,
            isActive: true
        };

        return await this.repository.create(policyData);
    }

    async updatePolicy(id: string, data: UpdatePolicyData, companyId: string) {
        const currentPolicy = await this.repository.findByIdAndCompanyId(id, companyId);
        if (!currentPolicy) {
            throw new NotFoundError('Policy not found');
        }

        // Check if configuration changed
        if (data.configuration && JSON.stringify(data.configuration) !== JSON.stringify((currentPolicy as any).configuration)) {
            // Configuration changed - create new version
            const latestVersion = await this.repository.findLatestVersionByNameAndType(
                companyId, 
                (currentPolicy as any).name, 
                (currentPolicy as any).type
            );
            
            const currentVersion = (currentPolicy as any).version;
            const newVersion = latestVersion ? this.incrementVersion(currentVersion) : currentVersion;
            
            // Create new policy version with updated configuration
            const newPolicyData = {
                companyId,
                name: (currentPolicy as any).name,
                type: (currentPolicy as any).type,
                version: newVersion,
                content: (currentPolicy as any).content,
                configuration: data.configuration, // Only include configuration from data
                status: PolicyStatus.PENDING_APPROVAL,
                approvedBy: undefined,
                approvedAt: undefined,
                effectiveFrom: undefined,
                effectiveTo: undefined,
                isActive: true
            };
            console.log('newPolicyData', newPolicyData);
            const newPolicy = await this.repository.create(newPolicyData);
            
            return {
                ...newPolicy,
                configurationChanged: true,
                previousVersion: currentVersion,
                newVersion: newVersion,
                previousPolicyId: (currentPolicy as any).id
            };
        }

        // If name or type is being updated, check for conflicts
        if (data.name || data.type) {
            const newName = data.name || (currentPolicy as any).name;
            const newType = data.type || (currentPolicy as any).type;

            // Check if another policy with the same name and type exists for this company
            const existingPolicy = await this.repository.findByCompanyIdAndNameAndType(companyId, newName, newType);
            if (existingPolicy && (existingPolicy as any).id !== id) {
                throw new ConflictError('A policy with this name and type already exists for this company');
            }
        }

        const policy = await this.repository.update(id, data, companyId);
        if (!policy) {
            throw new NotFoundError('Policy not found');
        }
        return policy;
    }

    private incrementVersion(version: string): string {
        const parts = version.split('.');
        if (parts.length === 2) {
            const major = parseInt(parts[0]);
            const minor = parseInt(parts[1]);
            return `${major}.${minor + 1}`;
        }
        // If version format is unexpected, just append ".1"
        return `${version}.1`;
    }

    async deletePolicy(id: string, companyId: string) {
        const deleted = await this.repository.delete(id, companyId);
        if (!deleted) {
            throw new NotFoundError('Policy not found');
        }
        return true;
    }

    async approvePolicy(id: string, approvedBy: string, companyId: string) {
        const policy = await this.repository.findByIdAndCompanyId(id, companyId);
        if (!policy) {
            throw new NotFoundError('Policy not found');
        }

        const effectiveFrom = new Date();
        const effectiveTo = new Date();
        effectiveTo.setDate(effectiveTo.getDate() + POLICY_CONFIG.EFFECTIVE_DURATION_DAYS);

        // If this is a new version, deactivate the previous version
        if ((policy as any).status === PolicyStatus.PENDING_APPROVAL) {
            const previousVersion = await this.repository.findLatestVersionByNameAndType(
                companyId,
                (policy as any).name,
                (policy as any).type
            );
            
            if (previousVersion && (previousVersion as any).id !== id && (previousVersion as any).status === PolicyStatus.APPROVED) {
                // Deactivate the previous approved version
                await this.repository.update((previousVersion as any).id, {
                    isActive: false
                }, companyId);
            }
        }

        const updatedPolicy = await this.repository.update(id, {
            status: PolicyStatus.APPROVED,
            approvedBy,
            approvedAt: new Date(),
            effectiveFrom,
            effectiveTo,
            isActive: true
        }, companyId);

        return {
            ...updatedPolicy,
            previousVersionDeactivated: true
        };
    }

    /**
     * Upgrade a policy to the latest template version
     */
    async upgradePolicyToLatestTemplate(id: string, companyId: string) {
        const policy = await this.repository.findByIdAndCompanyId(id, companyId);
        if (!policy) {
            throw new NotFoundError('Policy not found');
        }

        if (!(policy as any).templateId) {
            throw new ConflictError('Cannot upgrade a policy that is not based on a template');
        }

        const currentTemplate = await this.templateRepository.findById((policy as any).templateId);
        if (!currentTemplate) {
            throw new NotFoundError('Template not found');
        }

        const latestTemplate = await this.templateRepository.findLatestByName((currentTemplate as any).name);
        if (!latestTemplate) {
            throw new NotFoundError('Latest template not found');
        }

        if ((latestTemplate as any).version === (currentTemplate as any).version) {
            throw new ConflictError('Policy is already using the latest template version');
        }

        // Update policy to use the latest template
        const updatedPolicy = await this.repository.update(id, {
            templateId: (latestTemplate as any).id,
        }, companyId);

        return {
            ...updatedPolicy,
            upgradedFromVersion: (currentTemplate as any).version,
            upgradedToVersion: (latestTemplate as any).version
        };
    }

}

export default PolicyService; 