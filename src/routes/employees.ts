import { Router } from 'express';
import EmployeeService from '../services/EmployeeService';
import AcknowledgmentService from '../services/AcknowledgmentService';
import {
    validateEmployeeCreateRequest,
    validateId,
    validateCompanyHeader
} from '../middleware/validation';

const router = Router();
const employeeService = new EmployeeService();
const acknowledgmentService = new AcknowledgmentService();

// Set up dependency injection
employeeService.setAcknowledgmentService(acknowledgmentService);

router.get('/', async (req, res, next) => {
    try {
        const companyId = validateCompanyHeader(req);
        const employees = await employeeService.getEmployeesByCompanyId(companyId);
        return res.json(employees);
    } catch (error) {
        return next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const companyId = validateCompanyHeader(req);
        const id = validateId(req.params.id);
        const employee = await employeeService.getEmployeeById(id, companyId);
        return res.json(employee);
    } catch (error) {
        return next(error);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const companyId = validateCompanyHeader(req);
        const validatedData = validateEmployeeCreateRequest(req.body);
        const employee = await employeeService.createEmployee({
            ...validatedData,
            companyId
        });
        return res.status(201).json(employee);
    } catch (error) {
        return next(error);
    }
});

export default router; 