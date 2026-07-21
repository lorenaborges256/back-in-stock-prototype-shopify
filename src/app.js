import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from './config/env.js';

import {
  errorHandler,
  notFoundHandler
} from './middleware/errorHandler.js';

import notificationRoutes from './routes/notificationRoutes.js';
import inventoryFixtureRoutes from './routes/inventoryFixtureRoutes.js';

const app = express();

app.disable('x-powered-by');

app.use(helmet());

app.use(cors());

app.use(
  express.json({
    limit: '20kb'
  })
);

/**
 * Health check endpoint.
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok'
  });
});

/**
 * Customer notification requests.
 */
app.use(
  '/api/notifications',
  notificationRoutes
);

/**
 * Development-only inventory event simulator.
 */
if (env.nodeEnv === 'development') {
  app.use(
    '/api/inventory-events',
    inventoryFixtureRoutes
  );
}

app.use(notFoundHandler);

app.use(errorHandler);

export default app;