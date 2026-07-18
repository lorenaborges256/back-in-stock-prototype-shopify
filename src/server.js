import app from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { NotificationRequest } from './models/NotificationRequest.js';

async function startServer() {
  try {
    await connectDatabase();

    // Wait for the unique partial index before accepting write requests, so
    // duplicate-prevention tests do not run before the index is available.
    await NotificationRequest.init();

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