import { Router } from 'express';
import AcknowledgmentService from '../services/AcknowledgmentService';
import {
    validateId,
    validateCompanyHeader,
    validateAcknowledgmentFilters
} from '../middleware/validation';

const router = Router();
const acknowledgmentService = new AcknowledgmentService();

router.get('/', async (req, res, next) => {
    try {
        const companyId = validateCompanyHeader(req);
        const filters = validateAcknowledgmentFilters(req.query);
        const acknowledgments = await acknowledgmentService.getAcknowledgments(filters, companyId);
        return res.json(acknowledgments);
    } catch (error) {
        return next(error);
    }
});

router.patch('/:id/complete', async (req, res, next) => {
    try {
        const companyId = validateCompanyHeader(req);
        const id = validateId(req.params.id);
        const acknowledgment = await acknowledgmentService.completeAcknowledgment(id);
        return res.json(acknowledgment);
    } catch (error) {
        return next(error);
    }
});

router.post('/manual', async (req, res, next) => {
    try {
        const companyId = validateCompanyHeader(req);
        const { employeeIds, policyIds, dueDate } = req.body;

        if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
            return res.status(400).json({ error: 'Employee IDs array is required' });
        }

        if (!policyIds || !Array.isArray(policyIds) || policyIds.length === 0) {
            return res.status(400).json({ error: 'Policy IDs array is required' });
        }

        if (!dueDate) {
            return res.status(400).json({ error: 'Due date is required' });
        }

        // Validate all IDs
        for (const employeeId of employeeIds) {
            validateId(employeeId);
        }
        for (const policyId of policyIds) {
            validateId(policyId);
        }

        const acknowledgments = await acknowledgmentService.createManualAcknowledgments(
            employeeIds,
            policyIds,
            new Date(dueDate)
        );

        return res.status(201).json(acknowledgments);
    } catch (error) {
        return next(error);
    }
});

router.patch('/update-overdue', async (req, res, next) => {
    try {
        const companyId = validateCompanyHeader(req);
        const updatedCount = await acknowledgmentService.updateOverdueStatus();
        return res.json({ message: `Updated ${updatedCount} overdue acknowledgments` });
    } catch (error) {
        return next(error);
    }
});

export default router; 