import { Router } from 'express';
import AcknowledgmentService from '../services/AcknowledgmentService';
import EmployeeService from '../services/EmployeeService';
import PolicyService from '../services/PolicyService';
import AcknowledgmentRepository from '../repositories/AcknowledgmentRepository';
import {
    validateId,
    validateCompanyHeader,
    validateAcknowledgmentFilters
} from '../middleware/validation';

const router = Router();
const acknowledgmentService = new AcknowledgmentService();
const employeeService = new EmployeeService();
const policyService = new PolicyService();
const acknowledgmentRepository = new AcknowledgmentRepository();

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
        const { employeeIds, dueDate } = req.body;

        if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
            return res.status(400).json({ error: 'Employee IDs array is required' });
        }

        if (!dueDate) {
            return res.status(400).json({ error: 'Due date is required' });
        }

        // Validate all employee IDs
        for (const employeeId of employeeIds) {
            validateId(employeeId);
        }

        const acknowledgments = await acknowledgmentService.createManualAcknowledgments(
            employeeIds,
            new Date(dueDate),
            companyId
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

router.post('/escalate-overdue', async (req, res, next) => {
    try {
        const companyId = validateCompanyHeader(req);

        const updatedCount = await acknowledgmentService.updateOverdueStatus();

        const overdueAcknowledgments = await acknowledgmentRepository.findOverdueAcknowledgments();
        const escalationLogs = [];
        for (const acknowledgment of overdueAcknowledgments) {
            const employeeId = (acknowledgment as any).employeeId;
            const policyId = (acknowledgment as any).policyId;

            try {
                // Get employee and policy details
                const employee = await employeeService.getEmployeeById(employeeId, companyId);
                const policy = await policyService.getPolicyById(policyId, companyId);

                if (employee && policy) {
                    const escalationLog = {
                        message: `Employee ${(employee as any).name} (${employeeId}) has overdue policy ${(policy as any).name} (${policyId}) due on ${(acknowledgment as any).dueDate.toISOString().split('T')[0]}`
                    };
                    //TODO: escalate to CXOs by email, etc
                    escalationLogs.push(escalationLog);

                }
            } catch (error) {
                console.error(`Failed to escalate acknowledgment ${(acknowledgment as any).id}:`, error);
            }
        }

        return res.json({
            escalations: escalationLogs
        });
    } catch (error) {
        return next(error);
    }
});

export default router; 