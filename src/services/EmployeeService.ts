import EmployeeRepository, { CreateEmployeeData } from '../repositories/EmployeeRepository';
import { EmployeeRole } from '../types/employee';
import { NotFoundError, ConflictError } from '../utils/errors';

class EmployeeService {
    private repository: EmployeeRepository;

    constructor() {
        this.repository = new EmployeeRepository();
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

        return await this.repository.create(data);
    }




}

export default EmployeeService; 