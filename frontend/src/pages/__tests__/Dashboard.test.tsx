import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../Dashboard';
import { MemoryRouter } from 'react-router-dom';
import api from '../../services/axios';

// Mock recharts to avoid ResizeObserver errors in JSDOM
vi.mock('recharts', async (importOriginal) => {
  const OriginalRecharts = await importOriginal<typeof import('recharts')>();
  return {
    ...OriginalRecharts,
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  };
});

// Mock the axios API
vi.mock('../../services/axios', () => ({
  default: {
    get: vi.fn(),
  }
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('KPI cards render with correct data from API', async () => {
    const mockTasks = [
      { id: '1', status: 'In Progress', dueDate: '2026-10-10' },
      { id: '2', status: 'Completed', dueDate: '2026-10-10' },
      { id: '3', status: 'Overdue', dueDate: '2026-10-10' },
      { id: '4', status: 'In Progress', dueDate: '2026-10-10' },
    ];
    
    (api.get as any).mockResolvedValueOnce({
      data: { tasks: mockTasks }
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Wait for API call to complete
    await waitFor(() => expect(api.get).toHaveBeenCalledWith('/dashboard/summary'));

    // Check Total Tasks
    const totalTasksCard = screen.getByText('Total Tasks').parentElement;
    expect(totalTasksCard).toHaveTextContent('4');

    // Check In Progress
    const inProgressCard = screen.getByText('In Progress').parentElement;
    expect(inProgressCard).toHaveTextContent('2');

    // Check Completed
    const completedCard = screen.getByText('Completed').parentElement;
    expect(completedCard).toHaveTextContent('1');

    // Check Overdue
    const overdueCard = screen.getByText('Overdue').parentElement;
    expect(overdueCard).toHaveTextContent('1');
  });
});
