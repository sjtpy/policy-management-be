import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://postgres:password@postgres:5432/policy_management_db', {
    dialect: 'postgres',
    logging: false
});

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected');
    } catch (error) {
        console.error('Database connection failed:', error);
    }
};

const syncDatabase = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('Database synced');
    } catch (error) {
        console.error('Database sync failed:', error);
    }
};

export { sequelize, testConnection, syncDatabase }; 