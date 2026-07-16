import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from '../../routes/auth.routes';
import { prisma } from '../../lib/prisma';
import { signToken } from '../../services/auth.service';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const mockUser = prisma.user as unknown as { findUnique: jest.Mock; create: jest.Mock };

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

const testUser = {
  id: 'user-uuid-1',
  email: 'test@example.com',
  createdAt: new Date('2024-01-01'),
};

describe('POST /api/auth/register', () => {
  it('returns 201 and sets cookie on success', async () => {
    mockUser.findUnique.mockResolvedValue(null);
    mockUser.create.mockResolvedValue(testUser);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ password: 'password123' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email and password are required');
  });

  it('returns 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com' });
    expect(res.status).toBe(400);
  });

  it('returns 409 when email is already in use', async () => {
    mockUser.findUnique.mockResolvedValue(testUser);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Email already in use');
  });
});

describe('POST /api/auth/login', () => {
  const storedUser = {
    ...testUser,
    // bcrypt hash of "password123" with 12 rounds — pre-computed to avoid slow test setup
    passwordHash: '$2a$12$1234567890123456789012uW4GZLN2IZ5L6H8h7LXz2Z5sOqzNXRy',
  };

  it('returns 400 when credentials are missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com' });
    expect(res.status).toBe(400);
  });

  it('returns 401 when user does not exist', async () => {
    mockUser.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'pass' });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('returns 401 when password is wrong', async () => {
    mockUser.findUnique.mockResolvedValue(storedUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });
});

describe('POST /api/auth/logout', () => {
  it('returns 200 and clears the token cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logged out');
  });
});

describe('GET /api/auth/me', () => {
  it('returns 401 when no token cookie is present', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 when token is invalid', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', 'token=invalid.jwt.token');
    expect(res.status).toBe(401);
  });

  it('returns 200 with user data for a valid token', async () => {
    mockUser.findUnique.mockResolvedValue(testUser);
    const token = signToken(testUser.id);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(testUser.id);
  });

  it('returns 404 when user no longer exists', async () => {
    mockUser.findUnique.mockResolvedValue(null);
    const token = signToken('deleted-user-id');

    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(404);
  });
});
