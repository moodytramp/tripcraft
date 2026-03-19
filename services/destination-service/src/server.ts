import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { healthRoutes } from './routes/health.js';
import { destinationRoutes } from './routes/destinations.js';

const PORT = parseInt(process.env['PORT'] ?? '3002', 10);
const HOST = process.env['HOST'] ?? '0.0.0.0';

async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env['LOG_LEVEL'] ?? 'info',
      transport:
        process.env['NODE_ENV'] !== 'production'
          ? { target: 'pino-pretty' }
          : undefined,
    },
  });

  await app.register(cors, {
    origin: process.env['CORS_ORIGIN'] ?? '*',
  });
  await app.register(helmet);

  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(destinationRoutes, { prefix: '/v1/destinations' });

  return app;
}

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Destination service running on ${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();

export { buildApp };
