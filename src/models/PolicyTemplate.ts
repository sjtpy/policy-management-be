import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { PolicyType } from '../types/policy';

class PolicyTemplate extends Model { }

PolicyTemplate.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: DataTypes.STRING,
        type: DataTypes.ENUM(...Object.values(PolicyType)),
        version: DataTypes.STRING,
        isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
        sequelize,
        tableName: 'policy_templates',
        timestamps: true,
    }
);

export default PolicyTemplate; 