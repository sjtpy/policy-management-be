import EmployeeRepository, { CreateEmployeeData } from '../repositories/EmployeeRepository';
import { EmployeeRole } from '../types/employee';
import { NotFoundError, ConflictError } from '../utils/errors';
import AcknowledgmentService from './AcknowledgmentService';

class EmployeeService {
    private repository: EmployeeRepository;
    private acknowledgmentService?: AcknowledgmentService;

    constructor() {
        this.repository = new EmployeeRepository();
    }

    setAcknowledgmentService(acknowledgmentService: AcknowledgmentService) {
        this.acknowledgmentService = acknowledgmentService;
    }

    async getEmployeeById(id: string, companyId: string) {
        const employee = await this.repository.findByIdAndCompanyId(id, companyId);
        if (!employee) {
            throw new NotFoundError('Employee not found');
        }
        return employee;
    }

    async getEmployeesByCompanyId(companyId: string) {
        return await this.repository.findByCompanyId(companyId);
    }

    async createEmployee(data: CreateEmployeeData) {
        // Check if employee with same email already exists for this company
        const existingEmployee = await this.repository.findByCompanyIdAndEmail(
            data.companyId,
            data.email
        );
        if (existingEmployee) {
            throw new ConflictError('An employee with this email already exists for this company');
        }

        const employee = await this.repository.create(data);

        // auto-create new hire acknowledgments for all active policies
        if (this.acknowledgmentService) {
            try {
                await this.acknowledgmentService.createNewHireAcknowledgments((employee as any).id, data.companyId);
            } catch (error) {
                // Log error but don't fail employee creation
                console.error('Failed to create new hire acknowledgments:', error);
            }
        }

        return employee;
    }




}

export default EmployeeService; 