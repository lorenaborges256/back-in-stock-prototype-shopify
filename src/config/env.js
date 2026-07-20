import 'dotenv/config';

const supportedEmailModes = new Set(['disabled', 'ethereal']);

function requiredEnvironmentValue(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readPort(value) {
  const port = Number(value ?? 3001);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  return port;
}

function readEmailMode(value) {
  const emailMode = value?.trim().toLowerCase() || 'disabled';

  if (!supportedEmailModes.has(emailMode)) {
    throw new Error('EMAIL_MODE must be either `disabled` or `ethereal`.');
  }

  return emailMode;
}

/**
 * Centralises configuration so the rest of the application never reads raw
 * environment variables. This prevents accidental logging of configuration
 * objects that may later include credentials.
 */
export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV?.trim() || 'development',
  port: readPort(process.env.PORT),
  mongoUri: requiredEnvironmentValue('MONGODB_URI'),
  shopDomain: requiredEnvironmentValue('SHOP_DOMAIN').toLowerCase(),
  corsOrigin: process.env.CORS_ORIGIN?.trim() || null,
  emailMode: readEmailMode(process.env.EMAIL_MODE)
});