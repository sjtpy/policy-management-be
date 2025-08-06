import PolicyTemplateRepository, { CreatePolicyTemplateData, UpdatePolicyTemplateData } from '../repositories/PolicyTemplateRepository';
import PolicyTemplate from '../models/PolicyTemplate';
import { PolicyType } from '../types/policy';
import { NotFoundError, ConflictError } from '../utils/errors';

class PolicyTemplateService {
    private repository: PolicyTemplateRepository;

    constructor() {
        this.repository = new PolicyTemplateRepository();
    }

    async getAllTemplates() {
        return await this.repository.findAll();
    }

    async getTemplateById(id: string) {
        const template = await this.repository.findById(id);
        if (!template) {
            throw new NotFoundError('Template not found');
        }
        return template;
    }

    async createTemplate(data: CreatePolicyTemplateData) {
        // Check if template with same name, type, and version already exists
        const existingTemplate = await PolicyTemplate.findOne({
            where: {
                name: data.name,
                type: data.type,
                version: data.version,
                isActive: true
            }
        });

        if (existingTemplate) {
            throw new ConflictError('A policy template with this name, type, and version already exists');
        }

        return await this.repository.create(data);
    }

    async updateTemplate(id: string, data: UpdatePolicyTemplateData) {
        if (data.name || data.type) {
            const currentTemplate = await this.repository.findById(id);
            if (!currentTemplate) {
                throw new NotFoundError('Template not found');
            }

            const newName = data.name || (currentTemplate as any).name;
            const newType = data.type || (currentTemplate as any).type;

            // Check if another template with the same name and type exists
            const existingTemplate = await this.repository.findByNameAndType(newName, newType);
            if (existingTemplate && (existingTemplate as any).id !== id) {
                throw new ConflictError('A policy template with this name and type already exists');
            }
        }

        const template = await this.repository.update(id, data);
        if (!template) {
            throw new NotFoundError('Template not found');
        }
        return template;
    }

    async deleteTemplate(id: string) {
        const deleted = await this.repository.delete(id);
        if (!deleted) {
            throw new NotFoundError('Template not found');
        }
        return true;
    }

}

export default PolicyTemplateService; 