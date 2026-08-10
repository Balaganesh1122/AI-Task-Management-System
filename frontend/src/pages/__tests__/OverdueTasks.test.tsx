import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OverdueTasks from '../OverdueTasks';
import { MemoryRouter } from 'react-router-dom';
import api from '../../services/axios';

vi.mock('../../services/axios', () => ({
  default: {
    get: vi.fn(),
  }
}));

describe('OverdueTasks Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock current time to a fixed date to calculate days overdue accurately
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-31T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('risk cards are colour coded correctly based on days overdue', async () => {
    // 2026-10-31 is the mock current date
    const mockOverdueTasks = [
      { id: 'T-1', title: 'Task 1', dueDate: '2026-10-30', status: 'Overdue', priority: 'High' }, // 1 day overdue -> Low Risk (amber)
      { id: 'T-2', title: 'Task 2', dueDate: '2026-10-23', status: 'Overdue', priority: 'High' }, // 8 days overdue -> Medium Risk (orange)
      { id: 'T-3', title: 'Task 3', dueDate: '2026-10-15', status: 'Overdue', priority: 'High' }, // 16 days overdue -> High Risk (red)
    ];

    (api.get as any).mockResolvedValueOnce({ data: mockOverdueTasks });

    render(
      <MemoryRouter>
        <OverdueTasks />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    const lowRiskBadge = screen.getByText('Low Risk');
    expect(lowRiskBadge).toHaveClass('bg-amber-100');
    expect(lowRiskBadge).toHaveClass('text-amber-700');

    const mediumRiskBadge = screen.getByText('Medium Risk');
    expect(mediumRiskBadge).toHaveClass('bg-orange-100');
    expect(mediumRiskBadge).toHaveClass('text-orange-700');

    const highRiskBadge = screen.getByText('High Risk');
    expect(highRiskBadge).toHaveClass('bg-red-100');
    expect(highRiskBadge).toHaveClass('text-red-700');
  });
});
