import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterBar from '../../components/FilterBar';

describe('FilterBar', () => {
  it('renders All, Active, and Completed buttons', () => {
    render(<FilterBar current="all" onChange={vi.fn()} />);
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('calls onChange with "active" when Active is clicked', async () => {
    const onChange = vi.fn();
    render(<FilterBar current="all" onChange={onChange} />);
    await userEvent.click(screen.getByText('Active'));
    expect(onChange).toHaveBeenCalledWith('active');
  });

  it('calls onChange with "completed" when Completed is clicked', async () => {
    const onChange = vi.fn();
    render(<FilterBar current="all" onChange={onChange} />);
    await userEvent.click(screen.getByText('Completed'));
    expect(onChange).toHaveBeenCalledWith('completed');
  });

  it('calls onChange with "all" when All is clicked', async () => {
    const onChange = vi.fn();
    render(<FilterBar current="active" onChange={onChange} />);
    await userEvent.click(screen.getByText('All'));
    expect(onChange).toHaveBeenCalledWith('all');
  });

  it('applies active style to the current filter button', () => {
    render(<FilterBar current="active" onChange={vi.fn()} />);
    const activeBtn = screen.getByText('Active');
    expect(activeBtn.className).toContain('bg-white');
  });

  it('does not apply active style to inactive filter buttons', () => {
    render(<FilterBar current="active" onChange={vi.fn()} />);
    const allBtn = screen.getByText('All');
    expect(allBtn.className).not.toContain('bg-white');
  });
});
