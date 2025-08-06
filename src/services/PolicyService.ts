import PolicyRepository, { CreatePolicyData, UpdatePolicyData } from '../repositories/PolicyRepository';
import { PolicyType, PolicyStatus } from '../types/policy';
import { NotFoundError, ConflictError } from '../utils/errors';
import { POLICY_CONFIG } from '../config/policy';

class PolicyService {
    private repository: PolicyRepository;

    constructor() {
        this.repository = new PolicyRepository();
    }


    async getPolicyById(id: string, companyId: string) {
        const policy = await this.repository.findByIdAndCompanyId(id, companyId);
        if (!policy) {
            throw new NotFoundError('Policy not found');
        }
        return policy;
    }

    async getPoliciesByCompanyId(companyId: string, filters?: { status?: PolicyStatus; type?: PolicyType }) {
        return await this.repository.findByCompanyId(companyId, filters);
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


}

export default PolicyService; 