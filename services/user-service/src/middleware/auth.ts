import jwt from 'jsonwebtoken';
import JwksClient from 'jwks-rsa';
import type { FastifyRequest, FastifyReply } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user: { authProviderId: string; email: string } | null;
  }
}

const jwksClient = new JwksClient({
  jwksUri: `https://${process.env['AUTH0_DOMAIN']}/.well-known/jwks.json`,
  cache: true,
  cacheMaxAge: 60 * 60 * 1000, // 1 hour
  rateLimit: true,
});

async function getSigningKey(kid: string): Promise<string> {
  const key = await jwksClient.getSigningKey(kid);
  return key.getPublicKey();
}

/**
 * Parses the Authorization header and sets request.user.
 * On missing / invalid token, sets request.user = null (allows anonymous access).
 * Register as an `onRequest` hook in buildApp().
 */
export async function parseAuth(request: FastifyRequest): Promise<void> {
  const authHeader = request.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    request.user = null;
    return;
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded === 'string' || !decoded.header.kid) {
      request.user = null;
      return;
    }

    const signingKey = await getSigningKey(decoded.header.kid);
    const payload = jwt.verify(token, signingKey, {
      audience: process.env['AUTH0_AUDIENCE'],
      issuer: `https://${process.env['AUTH0_DOMAIN']}/`,
    }) as jwt.JwtPayload;

    request.user = {
      authProviderId: payload['sub'] as string,
      email: (payload['email'] as string) ?? '',
    };
  } catch {
    request.user = null;
  }
}

/**
 * Prehandler that rejects unauthenticated requests with 401.
 * Usage: `{ preHandler: [requireAuth] }` on protected routes.
 */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (!request.user) {
    await reply.status(401).send({
      error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
    });
  }
}
