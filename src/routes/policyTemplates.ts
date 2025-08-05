import { Router } from 'express';
import PolicyTemplateService from '../services/PolicyTemplateService';
import { validatePolicyTemplateCreateRequest, validatePolicyTemplateUpdateRequest, validateId } from '../middleware/validation';

const router = Router();
const policyTemplateService = new PolicyTemplateService();

router.get('/', async (req, res) => {
    try {
        const templates = await policyTemplateService.getAllTemplates();
        return res.json(templates);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const id = validateId(req.params.id);
        const template = await policyTemplateService.getTemplateById(id);
        return res.json(template);
    } catch (error) {
        return next(error);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const validatedData = validatePolicyTemplateCreateRequest(req.body);
        const template = await policyTemplateService.createTemplate(validatedData);
        return res.status(201).json(template);
    } catch (error) {
        return next(error);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const id = validateId(req.params.id);
        const validatedData = validatePolicyTemplateUpdateRequest(req.body);
        const template = await policyTemplateService.updateTemplate(id, validatedData);
        return res.json(template);
    } catch (error) {
        return next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const id = validateId(req.params.id);
        await policyTemplateService.deleteTemplate(id);
        return res.status(204).send();
    } catch (error) {
        return next(error);
    }
});

export default router; 