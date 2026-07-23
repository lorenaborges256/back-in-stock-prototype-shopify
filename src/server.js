import app from './app.js';

import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';

import { NotificationRequest }
  from './models/NotificationRequest.js';

import { ProcessedInventoryEvent }
  from './models/ProcessedInventoryEvent.js';

async function startServer() {
  try {
    await connectDatabase();

    /**
     * Ensure MongoDB indexes are created before
     * accepting incoming requests.
     */
    await Promise.all([
      NotificationRequest.init(),
      ProcessedInventoryEvent.init()
    ]);

    app.listen(env.port, () => {
      console.info(
        `Back-in-stock API listening on port ${env.port}.`
      );
    });
  } catch (error) {
    console.error({
      event: 'server_startup_failed',
      errorName: error?.name,
      errorMessage: error?.message
    });

    process.exit(1);
  }
}

startServer();