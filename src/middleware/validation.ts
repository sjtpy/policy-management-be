import { PolicyType, PolicyStatus } from '../types/policy';
import { EmployeeRole } from '../types/employee';
import { AcknowledgmentType, AcknowledgmentStatus } from '../types/acknowledgment';
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

export interface ValidatedPolicyCreateRequest {
    templateId?: string;
    name: string;
    type: PolicyType;
    version: string;
    content: string;
    configuration?: any;
    status?: PolicyStatus;
}

export interface ValidatedPolicyUpdateRequest {
    name?: string;
    type?: PolicyType;
    version?: string;
    content?: string;
    configuration?: any;
    status?: PolicyStatus;
    isActive?: boolean;
}

export interface ValidatedAcknowledgmentFilters {
    employeeId?: string;
    type?: AcknowledgmentType;
    status?: AcknowledgmentStatus;
    overdue?: boolean;
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

export const validateCompanyHeader = (req: any): string => {
    const companyId = req.headers['x-company-id'] as string;

    if (!companyId) {
        throw new ValidationError('Company ID is required in x-company-id header');
    }

    if (!validateUUID(companyId)) {
        throw new ValidationError('Valid company ID is required in x-company-id header');
    }

    return companyId;
};

export const validatePolicyCreateRequest = (data: any): ValidatedPolicyCreateRequest => {
    const {
        templateId, name, type, version, content, configuration,
        status
    } = data;

    // Convert empty string to null for templateId
    const validatedTemplateId = templateId && templateId.trim() !== '' ? templateId : null;

    if (validatedTemplateId && !validateUUID(validatedTemplateId)) {
        throw new ValidationError('Template ID must be a valid UUID');
    }

    if (!name || typeof name !== 'string') {
        throw new ValidationError('Name is required and must be a string');
    }

    if (!type || !Object.values(PolicyType).includes(type)) {
        throw new ValidationError('Type is required and must be a valid policy type');
    }

    if (!version || typeof version !== 'string') {
        throw new ValidationError('Version is required and must be a string');
    }

    if (!content || typeof content !== 'string') {
        throw new ValidationError('Content is required and must be a string');
    }

    if (status && !Object.values(PolicyStatus).includes(status)) {
        throw new ValidationError('Status must be a valid policy status');
    }

    return {
        templateId: validatedTemplateId,
        name,
        type,
        version,
        content,
        configuration,
        status
    };
};

export const validatePolicyUpdateRequest = (data: any): ValidatedPolicyUpdateRequest => {
    const {
        name, type, version, content, configuration,
        status, isActive
    } = data;
    const updateData: ValidatedPolicyUpdateRequest = {};



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

    if (content !== undefined) {
        if (typeof content !== 'string') {
            throw new ValidationError('Content must be a string');
        }
        updateData.content = content;
    }

    if (configuration !== undefined) {
        updateData.configuration = configuration;
    }

    if (status !== undefined) {
        if (!Object.values(PolicyStatus).includes(status)) {
            throw new ValidationError('Status must be a valid policy status');
        }
        updateData.status = status;
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

export interface ValidatedEmployeeCreateRequest {
    name: string;
    email: string;
    role: EmployeeRole;
}

export const validateEmployeeCreateRequest = (data: any): ValidatedEmployeeCreateRequest => {
    const { name, email, role } = data;

    if (!name || typeof name !== 'string') {
        throw new ValidationError('Name is required and must be a string');
    }

    if (!email || typeof email !== 'string') {
        throw new ValidationError('Email is required and must be a string');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ValidationError('Email must be a valid email address');
    }

    if (!role || !Object.values(EmployeeRole).includes(role)) {
        throw new ValidationError('Role is required and must be a valid employee role');
    }

    return {
        name,
        email,
        role
    };
};


export const validateAcknowledgmentFilters = (query: any): ValidatedAcknowledgmentFilters => {
    const { employeeId, type, status, overdue } = query;
    const filters: ValidatedAcknowledgmentFilters = {};

    if (employeeId) {
        if (!validateUUID(employeeId)) {
            throw new ValidationError('Employee ID must be a valid UUID');
        }
        filters.employeeId = employeeId;
    }

    if (type) {
        if (!Object.values(AcknowledgmentType).includes(type)) {
            throw new ValidationError('Type must be a valid acknowledgment type');
        }
        filters.type = type;
    }

    if (status) {
        if (!Object.values(AcknowledgmentStatus).includes(status)) {
            throw new ValidationError('Status must be a valid acknowledgment status');
        }
        filters.status = status;
    }

    if (overdue !== undefined) {
        if (overdue !== 'true' && overdue !== 'false') {
            throw new ValidationError('Overdue must be "true" or "false"');
        }
        filters.overdue = overdue === 'true';
    }

    return filters;
}; 