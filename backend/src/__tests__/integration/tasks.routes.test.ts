import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import taskRoutes from '../../routes/tasks';
import { prisma } from '../../lib/prisma';
import { signToken } from '../../services/auth.service';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    task: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

const mockTask = prisma.task as unknown as {
  findMany: jest.Mock;
  findFirst: jest.Mock;
  create: jest.Mock;
  updateMany: jest.Mock;
  deleteMany: jest.Mock;
};

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/tasks', taskRoutes);

const USER_ID = 'test-user-uuid';
const authCookie = () => `token=${signToken(USER_ID)}`;

const sampleTask = {
  id: 'task-uuid-1',
  title: 'Sample Task',
  description: 'A description',
  status: 'ACTIVE',
  userId: USER_ID,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('GET /api/tasks', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });

  it('returns 200 with tasks array when authenticated', async () => {
    mockTask.findMany.mockResolvedValue([sampleTask]);
    const res = await request(app)
      .get('/api/tasks')
      .set('Cookie', authCookie());
    expect(res.status).toBe(200);
    expect(res.body.tasks).toHaveLength(1);
    expect(res.body.tasks[0].id).toBe(sampleTask.id);
  });

  it('passes status query param to service', async () => {
    mockTask.findMany.mockResolvedValue([]);
    await request(app)
      .get('/api/tasks?status=active')
      .set('Cookie', authCookie());
    expect(mockTask.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'ACTIVE' }) })
    );
  });
});

describe('POST /api/tasks', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'New Task' });
    expect(res.status).toBe(401);
  });

  it('returns 400 when title is missing', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Cookie', authCookie())
      .send({ description: 'No title here' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Title is required');
  });

  it('returns 400 when title is only whitespace', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Cookie', authCookie())
      .send({ title: '   ' });
    expect(res.status).toBe(400);
  });

  it('returns 201 with created task', async () => {
    mockTask.create.mockResolvedValue(sampleTask);
    const res = await request(app)
      .post('/api/tasks')
      .set('Cookie', authCookie())
      .send({ title: 'Sample Task', description: 'A description' });
    expect(res.status).toBe(201);
    expect(res.body.task.id).toBe(sampleTask.id);
  });
});

describe('PUT /api/tasks/:id', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app)
      .put('/api/tasks/task-uuid-1')
      .send({ title: 'Updated' });
    expect(res.status).toBe(401);
  });

  it('returns 404 when task does not belong to user', async () => {
    mockTask.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/tasks/task-uuid-1')
      .set('Cookie', authCookie())
      .send({ title: 'Updated' });
    expect(res.status).toBe(404);
  });

  it('returns 200 with updated task', async () => {
    const updated = { ...sampleTask, title: 'Updated', status: 'COMPLETED' };
    mockTask.findFirst
      .mockResolvedValueOnce(sampleTask)  // ownership check
      .mockResolvedValueOnce(updated);    // return updated record
    mockTask.updateMany.mockResolvedValue({ count: 1 });

    const res = await request(app)
      .put('/api/tasks/task-uuid-1')
      .set('Cookie', authCookie())
      .send({ title: 'Updated', status: 'COMPLETED' });

    expect(res.status).toBe(200);
    expect(res.body.task.title).toBe('Updated');
  });

  it('returns 400 for an invalid status value', async () => {
    mockTask.findFirst.mockResolvedValue(sampleTask);
    const res = await request(app)
      .put('/api/tasks/task-uuid-1')
      .set('Cookie', authCookie())
      .send({ status: 'INVALID_STATUS' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app).delete('/api/tasks/task-uuid-1');
    expect(res.status).toBe(401);
  });

  it('returns 404 when task does not belong to user', async () => {
    mockTask.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .delete('/api/tasks/task-uuid-1')
      .set('Cookie', authCookie());
    expect(res.status).toBe(404);
  });

  it('returns 204 on successful deletion', async () => {
    mockTask.findFirst.mockResolvedValue(sampleTask);
    mockTask.deleteMany.mockResolvedValue({ count: 1 });

    const res = await request(app)
      .delete('/api/tasks/task-uuid-1')
      .set('Cookie', authCookie());

    expect(res.status).toBe(204);
  });
});
