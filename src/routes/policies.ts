import { Router } from 'express';
import PolicyService from '../services/PolicyService';
import {
    validatePolicyCreateRequest,
    validatePolicyUpdateRequest,
    validateId,
    validateCompanyHeader
} from '../middleware/validation';

const router = Router();
const policyService = new PolicyService();

router.get('/', async (req, res, next) => {
    try {
        const companyId = validateCompanyHeader(req);
        const { status, type } = req.query;

        const filters: any = {};
        if (status) filters.status = status;
        if (type) filters.type = type;

        const policies = await policyService.getPoliciesByCompanyId(companyId, filters);
        return res.json(policies);
    } catch (error) {
        return next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const companyId = validateCompanyHeader(req);
        const id = validateId(req.params.id);
        const policy = await policyService.getPolicyById(id, companyId);
        return res.json(policy);
    } catch (error) {
        return next(error);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const companyId = validateCompanyHeader(req);
        const validatedData = validatePolicyCreateRequest(req.body);
        const policy = await policyService.createPolicy(validatedData, companyId);
        return res.status(201).json(policy);
    } catch (error) {
        return next(error);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const companyId = validateCompanyHeader(req);
        const id = validateId(req.params.id);
        const validatedData = validatePolicyUpdateRequest(req.body);
        const policy = await policyService.updatePolicy(id, validatedData, companyId);
        return res.json(policy);
    } catch (error) {
        return next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const companyId = validateCompanyHeader(req);
        const id = validateId(req.params.id);
        await policyService.deletePolicy(id, companyId);
        return res.status(204).send();
    } catch (error) {
        return next(error);
    }
});

router.patch('/:id/approve', async (req, res, next) => {
    try {
        const companyId = validateCompanyHeader(req);
        const id = validateId(req.params.id);
        const { approvedBy } = req.body;

        if (!approvedBy || !validateId(approvedBy)) {
            return res.status(400).json({ error: 'Approved by is required and must be a valid UUID' });
        }

        const policy = await policyService.approvePolicy(id, approvedBy, companyId);
        return res.json(policy);
    } catch (error) {
        return next(error);
    }
});



export default router; 