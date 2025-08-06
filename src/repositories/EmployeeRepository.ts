import Employee from '../models/Employee';
import { EmployeeRole } from '../types/employee';

export interface CreateEmployeeData {
    name: string;
    email: string;
    companyId: string;
    role: EmployeeRole;
}



class EmployeeRepository {
    async findByIdAndCompanyId(id: string, companyId: string): Promise<Employee | null> {
        return await Employee.findOne({
            where: { id, companyId }
        });
    }

    async findByCompanyId(companyId: string): Promise<Employee[]> {
        return await Employee.findAll({
            where: { companyId }
        });
    }

    async findByCompanyIdAndEmail(companyId: string, email: string): Promise<Employee | null> {
        return await Employee.findOne({
            where: { companyId, email }
        });
    }

    async create(data: CreateEmployeeData): Promise<Employee> {
        return await Employee.create(data as any);
    }




}

export default EmployeeRepository; 