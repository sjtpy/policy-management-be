import AcknowledgmentRepository, { CreateAcknowledgmentData, UpdateAcknowledgmentData } from '../repositories/AcknowledgmentRepository';
import { AcknowledgmentType, AcknowledgmentStatus } from '../types/acknowledgment';
import { NotFoundError, ConflictError } from '../utils/errors';
import PolicyService from './PolicyService';
import EmployeeService from './EmployeeService';
import { PolicyStatus } from '../types/policy';
import { ROLE_POLICY_MAPPING } from '../config/rolePolicyMapping';
import { ACKNOWLEDGMENT_CONFIG } from '../config/policy';
import { EmployeeRole } from '../types/employee';

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
        // Get employee to determine role
        const employee = await this.employeeService.getEmployeeById(employeeId, companyId);
        if (!employee) {
            throw new NotFoundError('Employee not found');
        }

        const employeeRole = (employee as any).role as EmployeeRole;

        // Get required policy types for this role
        const requiredPolicyTypes = ROLE_POLICY_MAPPING[employeeRole] || [];

        // Get only the latest approved version of each policy for the company
        const activePolicies = await this.policyService.getActivePoliciesForAcknowledgments(companyId);

        // filter policies based on employee's role
        const roleSpecificPolicies = activePolicies.filter(policy =>
            requiredPolicyTypes.includes((policy as any).type)
        );

        // Create acknowledgment requests for role-specific policies
        const acknowledgmentData: CreateAcknowledgmentData[] = roleSpecificPolicies.flatMap(policy => {
            const acknowledgments: CreateAcknowledgmentData[] = [
                {
                    employeeId,
                    policyId: (policy as any).id,
                    type: AcknowledgmentType.NEW_HIRE,
                    dueDate: new Date(Date.now() + ACKNOWLEDGMENT_CONFIG.NEW_HIRE_DUE_DAYS * 24 * 60 * 60 * 1000),
                    status: AcknowledgmentStatus.PENDING
                }
            ];

            for (let year = 1; year <= ACKNOWLEDGMENT_CONFIG.PERIODIC_YEARS; year++) {
                acknowledgments.push({
                    employeeId,
                    policyId: (policy as any).id,
                    type: AcknowledgmentType.PERIODIC,
                    dueDate: new Date(Date.now() + year * 365 * 24 * 60 * 60 * 1000),
                    status: AcknowledgmentStatus.PENDING
                });
            }

            return acknowledgments;
        });

        return await this.repository.bulkCreate(acknowledgmentData);
    }


    async createManualAcknowledgments(employeeIds: string[], dueDate: Date, companyId: string) {
        const acknowledgmentData: CreateAcknowledgmentData[] = [];

        for (const employeeId of employeeIds) {
            // Get employee to determine their role
            const employee = await this.employeeService.getEmployeeById(employeeId, companyId);
            if (!employee) {
                continue;
            }

            const employeeRole = (employee as any).role as EmployeeRole;
            const requiredPolicyTypes = ROLE_POLICY_MAPPING[employeeRole] || [];

            // Get only the latest approved version of each policy for the company
            const activePolicies = await this.policyService.getActivePoliciesForAcknowledgments(companyId);

            const roleSpecificPolicies = activePolicies.filter(policy =>
                requiredPolicyTypes.includes((policy as any).type)
            );

            for (const policy of roleSpecificPolicies) {
                acknowledgmentData.push({
                    employeeId,
                    policyId: (policy as any).id,
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
        // or store in s3, logs or db for audit
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