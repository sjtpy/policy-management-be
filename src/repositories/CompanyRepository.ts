import Company from '../models/Company';

export interface CreateCompanyData {
    name: string;
    isActive?: boolean;
}

export interface UpdateCompanyData {
    name?: string;
    isActive?: boolean;
}

class CompanyRepository {
    async findAll(): Promise<Company[]> {
        return await Company.findAll({
            where: { isActive: true }
        });
    }

    async findById(id: string): Promise<Company | null> {
        return await Company.findOne({
            where: { id, isActive: true }
        });
    }

    async create(data: CreateCompanyData): Promise<Company> {
        return await Company.create(data as any);
    }

    async update(id: string, data: UpdateCompanyData): Promise<Company | null> {
        const company = await Company.findOne({
            where: { id, isActive: true }
        });
        if (!company) {
            return null;
        }
        await company.update(data as any);
        return company;
    }

    async delete(id: string): Promise<boolean> {
        const company = await Company.findOne({
            where: { id, isActive: true }
        });
        if (!company) {
            return false;
        }
        await company.update({ isActive: false });
        return true;
    }


}

export default CompanyRepository; 