import { Router } from 'express';
import CompanyService from '../services/CompanyService';
import {
    validateCompanyCreateRequest,
    validateCompanyUpdateRequest,
    validateId
} from '../middleware/validation';

const router = Router();
const companyService = new CompanyService();

router.get('/', async (req, res) => {
    try {
        const companies = await companyService.getAllCompanies();
        return res.json(companies);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch companies' });
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const id = validateId(req.params.id);
        const company = await companyService.getCompanyById(id);
        return res.json(company);
    } catch (error) {
        return next(error);
    }
});



router.post('/', async (req, res, next) => {
    try {
        const validatedData = validateCompanyCreateRequest(req.body);
        const company = await companyService.createCompany(validatedData);
        return res.status(201).json(company);
    } catch (error) {
        return next(error);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const id = validateId(req.params.id);
        const validatedData = validateCompanyUpdateRequest(req.body);
        const company = await companyService.updateCompany(id, validatedData);
        return res.json(company);
    } catch (error) {
        return next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const id = validateId(req.params.id);
        await companyService.deleteCompany(id);
        return res.status(204).send();
    } catch (error) {
        return next(error);
    }
});

export default router; 