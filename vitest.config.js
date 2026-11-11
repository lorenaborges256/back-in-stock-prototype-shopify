import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    env: {
      MONGODB_URI: 'mongodb://127.0.0.1:27017/test_db',
      NODE_ENV: 'test'
    }
  }
});