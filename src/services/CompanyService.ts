import CompanyRepository, { CreateCompanyData, UpdateCompanyData } from '../repositories/CompanyRepository';
import { NotFoundError, ConflictError } from '../utils/errors';

class CompanyService {
    private repository: CompanyRepository;

    constructor() {
        this.repository = new CompanyRepository();
    }

    async getAllCompanies() {
        return await this.repository.findAll();
    }

    async getCompanyById(id: string) {
        const company = await this.repository.findById(id);
        if (!company) {
            throw new NotFoundError('Company not found');
        }
        return company;
    }



    async createCompany(data: CreateCompanyData) {
        const companyData = {
            ...data,
            isActive: data.isActive ?? true
        };

        return await this.repository.create(companyData);
    }

    async updateCompany(id: string, data: UpdateCompanyData) {
        const company = await this.repository.update(id, data);
        if (!company) {
            throw new NotFoundError('Company not found');
        }
        return company;
    }

    async deleteCompany(id: string) {
        const deleted = await this.repository.delete(id);
        if (!deleted) {
            throw new NotFoundError('Company not found');
        }
        return true;
    }
}

export default CompanyService; 