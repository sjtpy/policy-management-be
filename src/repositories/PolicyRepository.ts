import Policy from '../models/Policy';
import { PolicyType, PolicyStatus } from '../types/policy';

export interface CreatePolicyData {
    templateId?: string;
    name: string;
    type: PolicyType;
    version: string;
    content: string;
    configuration?: any;
    status?: PolicyStatus;
}

export interface UpdatePolicyData {
    templateId?: string;
    name?: string;
    type?: PolicyType;
    version?: string;
    content?: string;
    configuration?: any;
    status?: PolicyStatus;
    isActive?: boolean;
    approvedBy?: string;
    approvedAt?: Date;
    effectiveFrom?: Date;
    effectiveTo?: Date;
}

class PolicyRepository {


    async findByIdAndCompanyId(id: string, companyId: string): Promise<Policy | null> {
        return await (Policy as any).findOne({
            where: { id, companyId, isActive: true }
        });
    }

    async findByCompanyId(companyId: string, filters?: { status?: PolicyStatus; type?: PolicyType }): Promise<Policy[]> {
        const whereClause: any = { companyId, isActive: true };

        if (filters?.status) {
            whereClause.status = filters.status;
        }

        if (filters?.type) {
            whereClause.type = filters.type;
        }

        return await (Policy as any).findAll({
            where: whereClause
        });
    }

    async create(data: CreatePolicyData): Promise<Policy> {
        return await (Policy as any).create(data as any);
    }

    async update(id: string, data: UpdatePolicyData, companyId: string): Promise<Policy | null> {
        const policy = await (Policy as any).findOne({
            where: { id, companyId, isActive: true }
        });
        if (!policy) {
            return null;
        }
        await (policy as any).update(data as any);
        return policy;
    }

    async delete(id: string, companyId: string): Promise<boolean> {
        const policy = await (Policy as any).findOne({
            where: { id, companyId, isActive: true }
        });
        if (!policy) {
            return false;
        }
        await (policy as any).update({ isActive: false });
        return true;
    }

    async findByCompanyIdAndNameAndType(companyId: string, name: string, type: PolicyType): Promise<Policy | null> {
        return await (Policy as any).findOne({
            where: { companyId, name, type, isActive: true }
        });
    }

    async findByCompanyIdAndNameAndTypeAndVersion(companyId: string, name: string, type: PolicyType, version: string): Promise<Policy | null> {
        return await (Policy as any).findOne({
            where: { companyId, name, type, version, isActive: true }
        });
    }

    async findLatestVersionByNameAndType(companyId: string, name: string, type: PolicyType): Promise<Policy | null> {
        return await (Policy as any).findOne({
            where: { companyId, name, type, isActive: true },
            order: [['version', 'DESC']]
        });
    }
}

export default PolicyRepository; 