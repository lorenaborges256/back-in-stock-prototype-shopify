import mongoose from 'mongoose';
import { env } from './env.js';

/**
 * Connects before the HTTP server starts. Failing early is preferable to
 * accepting requests that cannot be stored accurately.
 */
export async function connectDatabase() {
  await mongoose.connect(env.mongoUri);
  console.info('MongoDB connection established.');
}
