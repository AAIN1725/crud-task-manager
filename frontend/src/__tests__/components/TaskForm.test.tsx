import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from '../../components/TaskForm';

describe('TaskForm', () => {
  it('renders title and description inputs', () => {
    render(<TaskForm onSubmit={vi.fn()} />);
    expect(screen.getByPlaceholderText('Task title…')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Description (optional)')).toBeInTheDocument();
  });

  it('submit button is disabled when title is empty', () => {
    render(<TaskForm onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: '+ Add task' })).toBeDisabled();
  });

  it('submit button is enabled after typing a title', async () => {
    render(<TaskForm onSubmit={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText('Task title…'), 'My task');
    expect(screen.getByRole('button', { name: '+ Add task' })).toBeEnabled();
  });

  it('calls onSubmit with trimmed title and description', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByPlaceholderText('Task title…'), '  My task  ');
    await userEvent.type(screen.getByPlaceholderText('Description (optional)'), 'Details');
    await userEvent.click(screen.getByRole('button', { name: '+ Add task' }));

    expect(onSubmit).toHaveBeenCalledWith('My task', 'Details');
  });

  it('passes undefined for description when it is blank', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByPlaceholderText('Task title…'), 'My task');
    await userEvent.click(screen.getByRole('button', { name: '+ Add task' }));

    expect(onSubmit).toHaveBeenCalledWith('My task', undefined);
  });

  it('clears fields after a successful submission', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TaskForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByPlaceholderText('Task title…'), 'My task');
    await userEvent.click(screen.getByRole('button', { name: '+ Add task' }));

    expect(screen.getByPlaceholderText('Task title…')).toHaveValue('');
    expect(screen.getByPlaceholderText('Description (optional)')).toHaveValue('');
  });

  it('shows an error message when onSubmit rejects', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('API error'));
    render(<TaskForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByPlaceholderText('Task title…'), 'My task');
    await userEvent.click(screen.getByRole('button', { name: '+ Add task' }));

    expect(await screen.findByText('Failed to create task')).toBeInTheDocument();
  });
});
