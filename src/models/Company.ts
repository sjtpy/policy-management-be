import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

class Company extends Model { }

Company.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'companies',
        timestamps: true,
    }
);

export default Company; 