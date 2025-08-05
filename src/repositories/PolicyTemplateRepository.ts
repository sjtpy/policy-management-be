import PolicyTemplate from '../models/PolicyTemplate';
import { PolicyType } from '../types/policy';

export interface CreatePolicyTemplateData {
    name: string;
    type: PolicyType;
    version: string;
    isActive?: boolean;
}

export interface UpdatePolicyTemplateData {
    name?: string;
    type?: PolicyType;
    version?: string;
    isActive?: boolean;
}

class PolicyTemplateRepository {
    async findAll(): Promise<PolicyTemplate[]> {
        return await PolicyTemplate.findAll({
            where: { isActive: true }
        });
    }

    async findById(id: string): Promise<PolicyTemplate | null> {
        return await PolicyTemplate.findOne({
            where: { id, isActive: true }
        });
    }

    async create(data: CreatePolicyTemplateData): Promise<PolicyTemplate> {
        return await PolicyTemplate.create(data as any);
    }

    async update(id: string, data: UpdatePolicyTemplateData): Promise<PolicyTemplate | null> {
        const template = await PolicyTemplate.findOne({
            where: { id, isActive: true }
        });
        if (!template) {
            return null;
        }
        await template.update(data as any);
        return template;
    }

    async delete(id: string): Promise<boolean> {
        const template = await PolicyTemplate.findOne({
            where: { id, isActive: true }
        });
        if (!template) {
            return false;
        }
        await template.update({ isActive: false });
        return true;
    }

    async findByNameAndType(name: string, type: PolicyType): Promise<PolicyTemplate | null> {
        return await PolicyTemplate.findOne({
            where: { name, type, isActive: true }
        });
    }
}

export default PolicyTemplateRepository; 