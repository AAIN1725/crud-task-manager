import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskCard from '../../components/TaskCard';
import type { Task } from '../../types';

const baseTask: Task = {
  id: 'task-1',
  title: 'Write tests',
  description: 'Cover all branches',
  status: 'ACTIVE',
  userId: 'user-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('TaskCard', () => {
  it('renders title and description', () => {
    render(<TaskCard task={baseTask} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Write tests')).toBeInTheDocument();
    expect(screen.getByText('Cover all branches')).toBeInTheDocument();
  });

  it('does not render description when it is absent', () => {
    const task = { ...baseTask, description: undefined };
    render(<TaskCard task={task} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.queryByText('Cover all branches')).not.toBeInTheDocument();
  });

  it('calls onEdit with toggled status when the status button is clicked', async () => {
    const onEdit = vi.fn().mockResolvedValue(undefined);
    render(<TaskCard task={baseTask} onEdit={onEdit} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByTitle('Mark complete'));
    expect(onEdit).toHaveBeenCalledWith('task-1', { status: 'COMPLETED' });
  });

  it('shows "Mark active" title when task is completed', () => {
    const completed = { ...baseTask, status: 'COMPLETED' as const };
    render(<TaskCard task={completed} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByTitle('Mark active')).toBeInTheDocument();
  });

  it('calls onDelete with task id when Delete button is clicked', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(<TaskCard task={baseTask} onEdit={vi.fn()} onDelete={onDelete} />);
    await userEvent.click(screen.getByText('Delete'));
    expect(onDelete).toHaveBeenCalledWith('task-1');
  });

  it('shows edit inputs when Edit button is clicked', async () => {
    render(<TaskCard task={baseTask} onEdit={vi.fn()} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByText('Edit'));
    expect(screen.getByDisplayValue('Write tests')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Cover all branches')).toBeInTheDocument();
  });

  it('calls onEdit with updated values when Save is clicked', async () => {
    const onEdit = vi.fn().mockResolvedValue(undefined);
    render(<TaskCard task={baseTask} onEdit={onEdit} onDelete={vi.fn()} />);

    await userEvent.click(screen.getByText('Edit'));
    const titleInput = screen.getByDisplayValue('Write tests');
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Updated title');
    await userEvent.click(screen.getByText('Save'));

    expect(onEdit).toHaveBeenCalledWith(
      'task-1',
      expect.objectContaining({ title: 'Updated title' })
    );
  });

  it('reverts to view mode when Cancel is clicked', async () => {
    render(<TaskCard task={baseTask} onEdit={vi.fn()} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByText('Edit'));
    await userEvent.click(screen.getByText('Cancel'));
    expect(screen.getByText('Write tests')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Write tests')).not.toBeInTheDocument();
  });
});
