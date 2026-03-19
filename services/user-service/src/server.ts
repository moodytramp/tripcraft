import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { userRoutes } from './routes/users.js';
import { passportRoutes } from './routes/passports.js';
import { visaRoutes } from './routes/visas.js';
import { healthRoutes } from './routes/health.js';
import { parseAuth } from './middleware/auth.js';

const PORT = parseInt(process.env['PORT'] ?? '3001', 10);
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

  // Decorate every request with `user` (null = anonymous).
  // The parseAuth hook populates it from the Authorization header.
  app.decorateRequest('user', null);
  app.addHook('onRequest', parseAuth);

  // Routes
  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(userRoutes, { prefix: '/v1/users' });
  await app.register(passportRoutes, { prefix: '/v1/users/me/passports' });
  await app.register(visaRoutes, { prefix: '/v1/users/me/visas' });

  return app;
}

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`User service running on ${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();

export { buildApp };
