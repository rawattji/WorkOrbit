import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import { database } from './config/database/connection';
import { redis } from './config/redis/connection';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Test database connection
    await database.query('SELECT NOW()');
    logger.info('Connected to PostgreSQL database');

    // Connect to Redis
    await redis.connect();
    logger.info('Connected to Redis');

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`WorkOrbit API server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          await database.close();
          logger.info('Database connection closed');
          
          await redis.close();
          logger.info('Redis connection closed');
          
          logger.info('Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown:', error);
          process.exit(1);
        }
      });
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();