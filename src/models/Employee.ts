import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { EmployeeRole } from '../types/employee';

class Employee extends Model { }

Employee.init(
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
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        companyId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'companies',
                key: 'id'
            }
        },
        role: {
            type: DataTypes.ENUM(...Object.values(EmployeeRole)),
            allowNull: false,
        }
    },
    {
        sequelize,
        tableName: 'employees',
        timestamps: true
    }
);

export default Employee; 