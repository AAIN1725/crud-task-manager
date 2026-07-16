import {
  getTasksForUser,
  getTaskByIdAndUser,
  createTask,
  updateTask,
  deleteTask,
} from '../../services/task.service';
import { prisma } from '../../lib/prisma';

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

describe('task.service', () => {
  describe('getTasksForUser', () => {
    it('calls findMany with userId only when no status filter', async () => {
      mockTask.findMany.mockResolvedValue([]);
      await getTasksForUser('user-1');
      expect(mockTask.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('adds ACTIVE status filter when status is "active"', async () => {
      mockTask.findMany.mockResolvedValue([]);
      await getTasksForUser('user-1', 'active');
      expect(mockTask.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('adds COMPLETED status filter when status is "completed"', async () => {
      mockTask.findMany.mockResolvedValue([]);
      await getTasksForUser('user-1', 'completed');
      expect(mockTask.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('returns the tasks array from findMany', async () => {
      const tasks = [{ id: 'task-1', title: 'Test' }];
      mockTask.findMany.mockResolvedValue(tasks);
      const result = await getTasksForUser('user-1');
      expect(result).toEqual(tasks);
    });
  });

  describe('getTaskByIdAndUser', () => {
    it('calls findFirst with id and userId', async () => {
      mockTask.findFirst.mockResolvedValue(null);
      await getTaskByIdAndUser('task-1', 'user-1');
      expect(mockTask.findFirst).toHaveBeenCalledWith({
        where: { id: 'task-1', userId: 'user-1' },
      });
    });
  });

  describe('createTask', () => {
    it('calls create with userId and data', async () => {
      const created = { id: 'task-new', title: 'New Task', userId: 'user-1' };
      mockTask.create.mockResolvedValue(created);
      const result = await createTask('user-1', { title: 'New Task' });
      expect(mockTask.create).toHaveBeenCalledWith({
        data: { title: 'New Task', description: undefined, userId: 'user-1' },
      });
      expect(result).toEqual(created);
    });

    it('includes description when provided', async () => {
      mockTask.create.mockResolvedValue({});
      await createTask('user-1', { title: 'Task', description: 'Desc' });
      expect(mockTask.create).toHaveBeenCalledWith({
        data: { title: 'Task', description: 'Desc', userId: 'user-1' },
      });
    });
  });

  describe('updateTask', () => {
    it('calls updateMany with id, userId, and update data', async () => {
      mockTask.updateMany.mockResolvedValue({ count: 1 });
      await updateTask('task-1', 'user-1', { title: 'Updated' });
      expect(mockTask.updateMany).toHaveBeenCalledWith({
        where: { id: 'task-1', userId: 'user-1' },
        data: { title: 'Updated' },
      });
    });
  });

  describe('deleteTask', () => {
    it('calls deleteMany with id and userId', async () => {
      mockTask.deleteMany.mockResolvedValue({ count: 1 });
      await deleteTask('task-1', 'user-1');
      expect(mockTask.deleteMany).toHaveBeenCalledWith({
        where: { id: 'task-1', userId: 'user-1' },
      });
    });
  });
});
