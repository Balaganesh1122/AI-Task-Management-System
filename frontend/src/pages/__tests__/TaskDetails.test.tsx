import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TaskDetails from '../TaskDetails';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('../../data/dummyData', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../data/dummyData')>();
  return {
    ...mod,
    tasks: [
      { id: '1', title: 'Test Task Title', description: 'Test Description', assignee: 'Alice', status: 'Pending', priority: 'High', tags: [], dueDate: '2026-10-10', createdDate: '2026-10-01', department: 'Engineering' }
    ]
  };
});

// Mock ResizeObserver
window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
};

describe('TaskDetails Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('toggles edit mode correctly', async () => {
    render(
      <MemoryRouter initialEntries={['/tasks/1']}>
        <Routes>
          <Route path="/tasks/:id" element={<TaskDetails />} />
        </Routes>
      </MemoryRouter>
    );

    // Initial state: not in edit mode
    expect(screen.getByText('Test Task Title')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Edit Task/i })).toBeInTheDocument();

    // Click Edit Task
    fireEvent.click(screen.getByRole('button', { name: /Edit Task/i }));

    // Now in edit mode
    expect(screen.queryByRole('button', { name: /Edit Task/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();

    // Title should be an input
    const titleInput = screen.getByDisplayValue('Test Task Title');
    expect(titleInput).toBeInTheDocument();

    // Change title and cancel
    fireEvent.change(titleInput, { target: { value: 'New Task Title' } });
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

    // Edit mode cancelled, changes reverted
    expect(screen.getByText('Test Task Title')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Edit Task/i })).toBeInTheDocument();
  });
});
