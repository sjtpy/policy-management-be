import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { PolicyType, PolicyStatus } from '../types/policy';
import { POLICY_CONFIG } from '../config/policy';

class Policy extends Model { }

Policy.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        companyId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'companies',
                key: 'id'
            }
        },
        templateId: {
            type: DataTypes.UUID,
            allowNull: true, // null for custom policies
            references: {
                model: 'policy_templates',
                key: 'id'
            }
        },
        name: DataTypes.STRING,
        type: DataTypes.ENUM(...Object.values(PolicyType)),
        version: DataTypes.STRING,
        content: DataTypes.TEXT,
        configuration: DataTypes.JSON, // For customer-specific config
        status: {
            type: DataTypes.ENUM(...Object.values(PolicyStatus)),
            defaultValue: POLICY_CONFIG.DEFAULT_STATUS,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        approvedBy: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'employees',
                key: 'id'
            }
        },
        approvedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        effectiveFrom: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        effectiveTo: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'policies',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['companyId', 'name', 'type'],
                name: 'policies_company_name_type_unique'
            }
        ]
    }
);

export default Policy; 