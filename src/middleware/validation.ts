import { PolicyType } from '../types/policy';
import { validate as validateUUID } from 'uuid';
import { ValidationError } from '../utils/errors';

export interface ValidatedPolicyTemplateCreateRequest {
    name: string;
    type: PolicyType;
    version: string;
    isActive?: boolean;
}

export interface ValidatedPolicyTemplateUpdateRequest {
    name?: string;
    type?: PolicyType;
    version?: string;
    isActive?: boolean;
}

export const validatePolicyTemplateCreateRequest = (data: any): ValidatedPolicyTemplateCreateRequest => {
    const { name, type, version, isActive } = data;

    if (!name || typeof name !== 'string') {
        throw new ValidationError('Name is required and must be a string');
    }

    if (!type || !Object.values(PolicyType).includes(type)) {
        throw new ValidationError('Type is required and must be a valid policy type');
    }

    if (!version || typeof version !== 'string') {
        throw new ValidationError('Version is required and must be a string');
    }

    if (isActive !== undefined && typeof isActive !== 'boolean') {
        throw new ValidationError('isActive must be a boolean');
    }

    return {
        name,
        type,
        version,
        isActive: isActive
    };
};

export const validatePolicyTemplateUpdateRequest = (data: any): ValidatedPolicyTemplateUpdateRequest => {
    const { name, type, version, isActive } = data;
    const updateData: ValidatedPolicyTemplateUpdateRequest = {};

    if (name !== undefined) {
        if (typeof name !== 'string') {
            throw new ValidationError('Name must be a string');
        }
        updateData.name = name;
    }

    if (type !== undefined) {
        if (!Object.values(PolicyType).includes(type)) {
            throw new ValidationError('Type must be a valid policy type');
        }
        updateData.type = type;
    }

    if (version !== undefined) {
        if (typeof version !== 'string') {
            throw new ValidationError('Version must be a string');
        }
        updateData.version = version;
    }

    if (isActive !== undefined) {
        if (typeof isActive !== 'boolean') {
            throw new ValidationError('isActive must be a boolean');
        }
        updateData.isActive = isActive;
    }

    return updateData;
};

export const validateId = (id: any): string => {
    if (!validateUUID(id)) {
        throw new ValidationError('id must be a valid UUID');
    }
    return id;
};

// Company validation interfaces
export interface ValidatedCompanyCreateRequest {
    name: string;
    isActive?: boolean;
}

export interface ValidatedCompanyUpdateRequest {
    name?: string;
    isActive?: boolean;
}

export const validateCompanyCreateRequest = (data: any): ValidatedCompanyCreateRequest => {
    const { name, isActive } = data;

    if (!name || typeof name !== 'string') {
        throw new ValidationError('Name is required and must be a string');
    }

    if (isActive !== undefined && typeof isActive !== 'boolean') {
        throw new ValidationError('isActive must be a boolean');
    }

    return {
        name,
        isActive: isActive ?? true
    };
};

export const validateCompanyUpdateRequest = (data: any): ValidatedCompanyUpdateRequest => {
    const { name, isActive } = data;
    const updateData: ValidatedCompanyUpdateRequest = {};

    if (name !== undefined) {
        if (typeof name !== 'string') {
            throw new ValidationError('Name must be a string');
        }
        updateData.name = name;
    }

    if (isActive !== undefined) {
        if (typeof isActive !== 'boolean') {
            throw new ValidationError('isActive must be a boolean');
        }
        updateData.isActive = isActive;
    }

    return updateData;
}; 