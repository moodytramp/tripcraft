import type { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/', async () => ({
    status: 'ok',
    service: 'destination-service',
    timestamp: new Date().toISOString(),
  }));
}
