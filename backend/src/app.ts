import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

import authRoutes from './modules/auth/routes/authRoutes';
import adminRoutes from './modules/admin/routes/adminRoutes';
import dashboardRoutes from './modules/dashboard/routes/dashboardRoutes';
import dataSourceRoutes from './modules/data-sources/routes/dataSourceRoutes';
import schemaRegistryRoutes from './modules/schema-registry/routes/schemaRegistryRoutes';
import explorerRoutes from './modules/explorer/routes/explorerRoutes';
import reportBuilderRoutes from './modules/report-builder/routes/reportBuilderRoutes';
import executionRoutes from './modules/execution-engine/routes/executionRoutes';
import schedulerRoutes from './modules/scheduler/routes/schedulerRoutes';
import reportCenterRoutes from './modules/report-center/routes/reportCenterRoutes';
import auditRoutes from './modules/audit/routes/auditRoutes';
import alertRoutes from './modules/alerting/routes/alertRoutes';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { auditLogger } from './shared/middleware/auditMiddleware';

const app = express();

// Security Hardening
app.use(helmet());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global generic Audit Logger for all API requests (can be noisy, but satisfies enterprise requirement)
app.use('/api/', auditLogger('API_REQUEST', 'FinSight_Platform'));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/data-sources', dataSourceRoutes);
app.use('/api/v1/schema-registry', schemaRegistryRoutes);
app.use('/api/v1/explorer', explorerRoutes);
app.use('/api/v1/report-builder', reportBuilderRoutes);
app.use('/api/v1/execute', executionRoutes);
app.use('/api/v1/scheduler', schedulerRoutes);
app.use('/api/v1/report-center', reportCenterRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/alerts', alertRoutes);

// Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'FinSight Monolith',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

export default app;
