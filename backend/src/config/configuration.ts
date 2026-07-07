export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',

  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_DATABASE ?? 'delivery_integration',
    synchronize: (process.env.DB_SYNCHRONIZE ?? 'true') === 'true',
  },

  boltFood: {
    apiBaseUrl: process.env.BOLT_FOOD_API_BASE_URL ?? '',
    apiKey: process.env.BOLT_FOOD_API_KEY ?? '',
    pollIntervalMs: parseInt(process.env.BOLT_FOOD_POLL_INTERVAL_MS ?? '30000', 10),
  },

  glovo: {
    apiBaseUrl: process.env.GLOVO_API_BASE_URL ?? '',
    apiKey: process.env.GLOVO_API_KEY ?? '',
    webhookSecret: process.env.GLOVO_WEBHOOK_SECRET ?? '',
  },
});
