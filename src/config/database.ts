import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://postgres:password@postgres:5432/policy_management_db', {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false
});

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected');
    } catch (error) {
        console.error('Database connection failed:', error);
    }
};

export { sequelize, testConnection }; 