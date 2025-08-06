import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection, syncDatabase } from './config/database';
import './models';
import policyTemplateRoutes from './routes/policyTemplates';
import companyRoutes from './routes/companies';
import policyRoutes from './routes/policies';
import employeeRoutes from './routes/employees';
import acknowledgmentRoutes from './routes/acknowledgments';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS middleware
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));

app.use(express.json());

app.get('/ping', (req: Request, res: Response) => {
    res.json({ message: 'pong' });
});

app.use('/api/policy-templates', policyTemplateRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/acknowledgments', acknowledgmentRoutes);


app.use(errorHandler);

app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    await testConnection();
    await syncDatabase();
});

export { app }; 