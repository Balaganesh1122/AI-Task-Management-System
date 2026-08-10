import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TaskList from '../TaskList';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../data/dummyData', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../data/dummyData')>();
  return {
    ...mod,
    tasks: [
      { id: '1', title: 'Fix login bug', assignee: 'Alice', status: 'Pending', priority: 'High', tags: [], dueDate: '2026-10-10', createdDate: '2026-10-01' },
      { id: '2', title: 'Update documentation', assignee: 'Bob', status: 'Completed', priority: 'Low', tags: [], dueDate: '2026-10-10', createdDate: '2026-10-01' },
      { id: '3', title: 'Database migration', assignee: 'Alice', status: 'In Progress', priority: 'High', tags: [], dueDate: '2026-10-10', createdDate: '2026-10-01' },
    ]
  };
});

describe('TaskList Component', () => {
  it('filters work correctly', () => {
    render(
      <MemoryRouter>
        <TaskList />
      </MemoryRouter>
    );

    // Initial state: 3 tasks
    expect(screen.getByText('Fix login bug')).toBeInTheDocument();
    expect(screen.getByText('Update documentation')).toBeInTheDocument();
    expect(screen.getByText('Database migration')).toBeInTheDocument();

    // 1. Test search filter
    const searchInput = screen.getByPlaceholderText('Search tasks or assignees...');
    fireEvent.change(searchInput, { target: { value: 'Fix' } });
    
    expect(screen.getByText('Fix login bug')).toBeInTheDocument();
    expect(screen.queryByText('Update documentation')).not.toBeInTheDocument();
    
    fireEvent.change(searchInput, { target: { value: '' } }); // Reset

    // 2. Test status filter
    const statusSelect = screen.getByRole('combobox', { name: /all status/i });
    // In the component, the select doesn't have an aria-label, but we can query by display value.
    // Wait, let's use getByDisplayValue to find the select
    const statusDropdown = screen.getByDisplayValue('All Status');
    fireEvent.change(statusDropdown, { target: { value: 'Completed' } });

    expect(screen.queryByText('Fix login bug')).not.toBeInTheDocument();
    expect(screen.getByText('Update documentation')).toBeInTheDocument();
    expect(screen.queryByText('Database migration')).not.toBeInTheDocument();

    fireEvent.change(statusDropdown, { target: { value: 'All' } }); // Reset

    // 3. Test priority filter
    const priorityDropdown = screen.getByDisplayValue('All Priority');
    fireEvent.change(priorityDropdown, { target: { value: 'Low' } });

    expect(screen.queryByText('Fix login bug')).not.toBeInTheDocument();
    expect(screen.getByText('Update documentation')).toBeInTheDocument();
  });
});
