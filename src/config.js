require('dotenv').config();

function numberFromEnv(name, fallback) {
  const value = process.env[name];

  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function csvFromEnv(name, fallback = []) {
  const value = process.env[name];

  if (!value) {
    return fallback;
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function databaseConfig(prefix, fallbackName) {
  const database = process.env[`${prefix}_PATH`];

  if (!database) {
    return null;
  }

  return {
    name: (process.env[`${prefix}_NAME`] || fallbackName).toLowerCase(),
    options: {
      host: process.env[`${prefix}_HOST`] || '127.0.0.1',
      port: numberFromEnv(`${prefix}_PORT`, 3050),
      database,
      user: process.env[`${prefix}_USER`] || 'SYSDBA',
      password: process.env[`${prefix}_PASSWORD`] || '',
      role: process.env[`${prefix}_ROLE`] || null,
      lowercase_keys: true,
      pageSize: numberFromEnv(`${prefix}_PAGE_SIZE`, 4096)
    },
    poolSize: numberFromEnv(`${prefix}_POOL_SIZE`, 5)
  };
}

const databases = [
  databaseConfig('DB1', 'gestao'),
  databaseConfig('DB2', 'secundario')
].filter(Boolean);

module.exports = {
  env: process.env.NODE_ENV || 'development',
  host: process.env.HOST || '0.0.0.0',
  port: numberFromEnv('PORT', 34000),
  corsOrigins: csvFromEnv('CORS_ORIGIN', ['*']),
  databases
};
