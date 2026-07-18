import app from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { NotificationRequest } from './models/NotificationRequest.js';
import { ProcessedInventoryEvent } from './models/ProcessedInventoryEvent.js';

async function startServer() {
  try {
    await connectDatabase();

    // Wait for database indexes before accepting write requests, so duplicate
    // request and duplicate-event tests do not run before their indexes exist.
    await Promise.all([
        NotificationRequest.init(),
        ProcessedInventoryEvent.init()
    ]);

    app.listen(env.port, () => {
      console.info(`Back-in-stock API listening on port ${env.port}.`);
    });
  } catch (error) {
    console.error({
      event: 'startup_failed',
      errorName: error?.name,
      errorMessage: error?.message
    });
    process.exitCode = 1;
  }
}

startServer();