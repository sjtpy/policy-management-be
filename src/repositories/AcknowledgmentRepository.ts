import Acknowledgment from '../models/Acknowledgment';
import { AcknowledgmentType, AcknowledgmentStatus } from '../types/acknowledgment';

export interface CreateAcknowledgmentData {
    employeeId: string;
    policyId: string;
    type: AcknowledgmentType;
    dueDate: Date;
    status?: AcknowledgmentStatus;
}

export interface UpdateAcknowledgmentData {
    status?: AcknowledgmentStatus;
    completedAt?: Date;
}

class AcknowledgmentRepository {
    async findById(id: string): Promise<Acknowledgment | null> {
        return await Acknowledgment.findOne({
            where: { id }
        });
    }

    async findByFilters(filters: {
        employeeId?: string;
        type?: AcknowledgmentType;
        status?: AcknowledgmentStatus;
        overdue?: boolean;
    }): Promise<Acknowledgment[]> {
        const whereClause: any = {};

        if (filters.employeeId) {
            whereClause.employeeId = filters.employeeId;
        }

        if (filters.type) {
            whereClause.type = filters.type;
        }

        if (filters.status) {
            whereClause.status = filters.status;
        }

        if (filters.overdue) {
            whereClause.status = AcknowledgmentStatus.PENDING;
            whereClause.dueDate = {
                [require('sequelize').Op.lt]: new Date()
            };
        }

        return await Acknowledgment.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });
    }

    async findOverdue(): Promise<Acknowledgment[]> {
        return await Acknowledgment.findAll({
            where: {
                status: AcknowledgmentStatus.PENDING,
                dueDate: {
                    [require('sequelize').Op.lt]: new Date()
                }
            },
            order: [['dueDate', 'ASC']]
        });
    }

    async findOverdueAcknowledgments(): Promise<Acknowledgment[]> {
        return await Acknowledgment.findAll({
            where: {
                status: AcknowledgmentStatus.OVERDUE
            },
            order: [['dueDate', 'ASC']]
        });
    }

    async create(data: CreateAcknowledgmentData): Promise<Acknowledgment> {
        return await Acknowledgment.create(data as any);
    }

    async update(id: string, data: UpdateAcknowledgmentData): Promise<Acknowledgment | null> {
        const acknowledgment = await Acknowledgment.findOne({
            where: { id }
        });
        if (!acknowledgment) {
            return null;
        }
        await acknowledgment.update(data as any);
        return acknowledgment;
    }

    async bulkCreate(data: CreateAcknowledgmentData[]): Promise<Acknowledgment[]> {
        return await Acknowledgment.bulkCreate(data as any);
    }
}

export default AcknowledgmentRepository; 