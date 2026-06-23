import express, { Express } from 'express';
import cors from 'cors';
import { config } from '@config/index.js';
import { logger } from '@utils/logger.js';
import { errorHandler } from '@middleware/errorHandler.js';
import routes from './routes/index.js';

const app: Express = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use(routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`✓ Server is running on port ${PORT}`);
  logger.info(`✓ Environment: ${config.nodeEnv}`);
  logger.info(`✓ API Base URL: http://localhost:${PORT}${config.apiPrefix}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
  process.exit(1);
});

export default app;
