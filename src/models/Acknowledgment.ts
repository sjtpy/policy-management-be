import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { AcknowledgmentType, AcknowledgmentStatus } from '../types/acknowledgment';

class Acknowledgment extends Model { }

Acknowledgment.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        employeeId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'employees',
                key: 'id'
            }
        },
        policyId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'policies',
                key: 'id'
            }
        },
        type: {
            type: DataTypes.ENUM(...Object.values(AcknowledgmentType)),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(AcknowledgmentStatus)),
            defaultValue: AcknowledgmentStatus.PENDING,
        },
        dueDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        completedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'acknowledgments',
        timestamps: true
    }
);

export default Acknowledgment; 