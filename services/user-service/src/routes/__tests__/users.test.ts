import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildApp } from '../../server.js';

// Mock Prisma
vi.mock('../../lib/prisma.js', () => ({
  prisma: {
    user: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    passport: { findMany: vi.fn(), create: vi.fn(), deleteMany: vi.fn(), updateMany: vi.fn() },
    visa: { findMany: vi.fn(), create: vi.fn(), deleteMany: vi.fn() },
  },
}));

// Mock auth — inject a test user on every request
vi.mock('../../middleware/auth.js', () => ({
  parseAuth: vi.fn().mockImplementation(async (request: { user: unknown }) => {
    request.user = { authProviderId: 'auth0|test-user', email: 'test@example.com' };
  }),
  requireAuth: vi.fn().mockImplementation(async () => {}),
}));

const { prisma } = await import('../../lib/prisma.js');

const MOCK_USER = {
  id: 'uuid-1',
  authProviderId: 'auth0|test-user',
  email: 'test@example.com',
  displayName: 'test',
  departureCountry: null,
  preferredLanguage: 'en',
  preferredCurrency: 'USD',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('GET /v1/users/me', () => {
  beforeEach(() => {
    vi.mocked(prisma.user.upsert).mockResolvedValue(MOCK_USER);
  });

  it('returns 200 with user data', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/v1/users/me' });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ data: { id: 'uuid-1', email: 'test@example.com' } });
  });

  it('returns 410 for soft-deleted account', async () => {
    vi.mocked(prisma.user.upsert).mockResolvedValue({ ...MOCK_USER, deletedAt: new Date() });
    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/v1/users/me' });

    expect(res.statusCode).toBe(410);
    expect(res.json().error.code).toBe('ACCOUNT_DELETED');
  });
});

describe('PUT /v1/users/me', () => {
  beforeEach(() => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(MOCK_USER);
    vi.mocked(prisma.user.update).mockResolvedValue({
      ...MOCK_USER,
      departureCountry: 'MA',
      preferredLanguage: 'fr',
    });
  });

  it('updates and returns user', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'PUT',
      url: '/v1/users/me',
      payload: { departureCountry: 'MA', preferredLanguage: 'fr' },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().data.departureCountry).toBe('MA');
  });

  it('returns 400 for invalid language', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'PUT',
      url: '/v1/users/me',
      payload: { preferredLanguage: 'xx' },
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 when user does not exist', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const app = await buildApp();
    const res = await app.inject({
      method: 'PUT',
      url: '/v1/users/me',
      payload: { displayName: 'Test' },
    });

    expect(res.statusCode).toBe(404);
  });
});

describe('DELETE /v1/users/me', () => {
  beforeEach(() => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(MOCK_USER);
    vi.mocked(prisma.user.update).mockResolvedValue({ ...MOCK_USER, deletedAt: new Date() });
  });

  it('returns 204 on successful soft delete', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'DELETE', url: '/v1/users/me' });

    expect(res.statusCode).toBe(204);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) }),
    );
  });

  it('returns 404 when user does not exist', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const app = await buildApp();
    const res = await app.inject({ method: 'DELETE', url: '/v1/users/me' });

    expect(res.statusCode).toBe(404);
  });
});
