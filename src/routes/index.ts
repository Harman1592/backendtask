import { Router } from 'express';
import employeeRoutes from './employeeRoutes.js';
import leaveRequestRoutes from './leaveRequestRoutes.js';
import departmentRoutes from './departmentRoutes.js';
import { config } from '@config/index.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

router.use(`${config.apiPrefix}/employees`, employeeRoutes);
router.use(`${config.apiPrefix}/leaves`, leaveRequestRoutes);
router.use(`${config.apiPrefix}/departments`, departmentRoutes);

export default router;
