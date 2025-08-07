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
        // If name or type is being updated, check for conflicts
        if (data.name || data.type) {
            const currentPolicy = await this.repository.findByIdAndCompanyId(id, companyId);
            if (!currentPolicy) {
                throw new NotFoundError('Policy not found');
            }

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

    async deletePolicy(id: string, companyId: string) {
        const deleted = await this.repository.delete(id, companyId);
        if (!deleted) {
            throw new NotFoundError('Policy not found');
        }
        return true;
    }

    async approvePolicy(id: string, approvedBy: string, companyId: string) {
        const effectiveFrom = new Date();
        const effectiveTo = new Date();
        effectiveTo.setDate(effectiveTo.getDate() + POLICY_CONFIG.EFFECTIVE_DURATION_DAYS);

        const policy = await this.repository.update(id, {
            status: PolicyStatus.APPROVED,
            approvedBy,
            approvedAt: new Date(),
            effectiveFrom,
            effectiveTo
        }, companyId);
        if (!policy) {
            throw new NotFoundError('Policy not found');
        }
        return policy;
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