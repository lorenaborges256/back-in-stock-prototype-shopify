import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import notificationRoutes from './routes/notificationRoutes.js';
import inventoryFixtureRoutes from './routes/inventoryFixtureRoutes.js';

const app = express();

app.disable('x-powered-by');
app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      // Bruno has no browser Origin header. Browser requests must match the
      // explicit development-store origin configured in the environment.
      if (!origin || origin === env.corsOrigin) {
        return callback(null, true);
      }

      const error = new Error('Origin is not allowed by CORS policy.');
      error.statusCode = 403;
      return callback(error);
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
  })
);

app.use(express.json({ limit: '20kb' }));

app.get('/health', (request, response) => {
  response.status(200).json({ status: 'ok' });
});

app.use('/api/notifications', notificationRoutes);
if (env.nodeEnv === 'development') {
  app.use('/api/test/inventory-events', inventoryFixtureRoutes);
}
app.use(notFoundHandler);
app.use(errorHandler);

export default app;