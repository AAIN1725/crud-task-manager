import { renderHook, act, waitFor } from '@testing-library/react';
import { useTasks } from '../../hooks/useTasks';
import * as tasksApi from '../../api/tasks.api';
import type { Task } from '../../types';

vi.mock('../../api/tasks.api');

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  title: 'Test task',
  description: undefined,
  status: 'ACTIVE',
  userId: 'user-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('useTasks', () => {
  beforeEach(() => {
    vi.mocked(tasksApi.getTasks).mockResolvedValue([makeTask()]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('starts in loading state then returns fetched tasks', async () => {
    const { result } = renderHook(() => useTasks('all'));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].id).toBe('task-1');
  });

  it('calls getTasks with the current filter', async () => {
    const { result } = renderHook(() => useTasks('active'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(tasksApi.getTasks).toHaveBeenCalledWith('active');
  });

  it('prepends newly added task to the list', async () => {
    const newTask = makeTask({ id: 'task-2', title: 'New task' });
    vi.mocked(tasksApi.createTask).mockResolvedValue(newTask);

    const { result } = renderHook(() => useTasks('all'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addTask('New task');
    });

    expect(result.current.tasks[0]).toEqual(newTask);
    expect(result.current.tasks).toHaveLength(2);
  });

  it('updates an existing task in place', async () => {
    const updated = makeTask({ title: 'Updated', status: 'COMPLETED' });
    vi.mocked(tasksApi.updateTask).mockResolvedValue(updated);

    const { result } = renderHook(() => useTasks('all'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.editTask('task-1', { status: 'COMPLETED' });
    });

    expect(result.current.tasks[0].status).toBe('COMPLETED');
    expect(result.current.tasks[0].title).toBe('Updated');
  });

  it('removes deleted task from the list', async () => {
    vi.mocked(tasksApi.deleteTask).mockResolvedValue(undefined);

    const { result } = renderHook(() => useTasks('all'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.removeTask('task-1');
    });

    expect(result.current.tasks).toHaveLength(0);
  });

  it('sets error message when fetch fails', async () => {
    vi.mocked(tasksApi.getTasks).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useTasks('all'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Failed to load tasks');
    expect(result.current.tasks).toHaveLength(0);
  });

  it('re-fetches when filter changes', async () => {
    const { rerender } = renderHook(
      ({ filter }: { filter: 'all' | 'active' | 'completed' }) => useTasks(filter),
      { initialProps: { filter: 'all' as const } }
    );
    await waitFor(() => expect(tasksApi.getTasks).toHaveBeenCalledTimes(1));

    rerender({ filter: 'active' });
    await waitFor(() => expect(tasksApi.getTasks).toHaveBeenCalledTimes(2));
    expect(tasksApi.getTasks).toHaveBeenLastCalledWith('active');
  });
});
