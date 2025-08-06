import AcknowledgmentRepository, { CreateAcknowledgmentData, UpdateAcknowledgmentData } from '../repositories/AcknowledgmentRepository';
import { AcknowledgmentType, AcknowledgmentStatus } from '../types/acknowledgment';
import { NotFoundError, ConflictError } from '../utils/errors';
import PolicyService from './PolicyService';
import EmployeeService from './EmployeeService';
import { PolicyStatus } from '../types/policy';

class AcknowledgmentService {
    private repository: AcknowledgmentRepository;
    private policyService: PolicyService;
    private employeeService: EmployeeService;

    constructor() {
        this.repository = new AcknowledgmentRepository();
        this.policyService = new PolicyService();
        this.employeeService = new EmployeeService();
    }

    async getAcknowledgments(filters: {
        employeeId?: string;
        type?: AcknowledgmentType;
        status?: AcknowledgmentStatus;
        overdue?: boolean;
    }, companyId: string) {
        // If employeeId is provided, validate that employee belongs to the company
        if (filters.employeeId) {
            await this.employeeService.getEmployeeById(filters.employeeId, companyId);
        }

        // For overdue filter, we need to get company's employees first
        if (filters.overdue) {
            const employees = await this.employeeService.getEmployeesByCompanyId(companyId);
            const employeeIds = employees.map(emp => (emp as any).id);

            if (employeeIds.length === 0) {
                return [];
            }

            // Add employee filter to ensure company-scoping
            filters.employeeId = filters.employeeId || employeeIds.join(',');
        }

        return await this.repository.findByFilters(filters);
    }

    async createAcknowledgment(data: CreateAcknowledgmentData) {
        const acknowledgmentData = {
            ...data,
            status: data.status || AcknowledgmentStatus.PENDING
        };

        return await this.repository.create(acknowledgmentData);
    }

    async createNewHireAcknowledgments(employeeId: string, companyId: string) {
        // Get all active policies for the company
        const activePolicies = await this.policyService.getPoliciesByCompanyId(companyId, { status: PolicyStatus.APPROVED });

        // Create acknowledgment requests for each policy
        const acknowledgmentData: CreateAcknowledgmentData[] = activePolicies.map(policy => ({
            employeeId,
            policyId: (policy as any).id,
            type: AcknowledgmentType.NEW_HIRE,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            status: AcknowledgmentStatus.PENDING
        }));

        return await this.repository.bulkCreate(acknowledgmentData);
    }

    async createPeriodicAcknowledgments(employeeId: string, companyId: string) {
        // Get all active policies for the company
        const activePolicies = await this.policyService.getPoliciesByCompanyId(companyId, { status: PolicyStatus.APPROVED });

        // Create acknowledgment requests for each policy
        const acknowledgmentData: CreateAcknowledgmentData[] = activePolicies.map(policy => ({
            employeeId,
            policyId: (policy as any).id,
            type: AcknowledgmentType.PERIODIC,
            dueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            status: AcknowledgmentStatus.PENDING
        }));

        return await this.repository.bulkCreate(acknowledgmentData);
    }

    async createManualAcknowledgments(employeeIds: string[], policyIds: string[], dueDate: Date) {
        const acknowledgmentData: CreateAcknowledgmentData[] = [];

        for (const employeeId of employeeIds) {
            for (const policyId of policyIds) {
                acknowledgmentData.push({
                    employeeId,
                    policyId,
                    type: AcknowledgmentType.MANUAL,
                    dueDate,
                    status: AcknowledgmentStatus.PENDING
                });
            }
        }

        return await this.repository.bulkCreate(acknowledgmentData);
    }

    async completeAcknowledgment(id: string) {
        const acknowledgment = await this.repository.update(id, {
            status: AcknowledgmentStatus.COMPLETED,
            completedAt: new Date()
        });

        if (!acknowledgment) {
            throw new NotFoundError('Acknowledgment not found');
        }

        return acknowledgment;
    }

    async updateOverdueStatus() {
        // Find all pending acknowledgments that are overdue
        const overdueAcknowledgments = await this.repository.findOverdue();

        // Update their status to OVERDUE
        for (const acknowledgment of overdueAcknowledgments) {
            await this.repository.update((acknowledgment as any).id, {
                status: AcknowledgmentStatus.OVERDUE
            });
        }

        return overdueAcknowledgments.length;
    }
}

export default AcknowledgmentService; 