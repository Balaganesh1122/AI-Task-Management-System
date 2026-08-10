import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Reports from '../Reports';
import { MemoryRouter } from 'react-router-dom';

// Mock recharts
vi.mock('recharts', async (importOriginal) => {
  const OriginalRecharts = await importOriginal<typeof import('recharts')>();
  return {
    ...OriginalRecharts,
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  };
});

// Mock ResizeObserver
window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
};

describe('Reports Component', () => {
  it('tabs switch correctly and update the view', () => {
    render(
      <MemoryRouter>
        <Reports />
      </MemoryRouter>
    );

    // Initial tab is Weekly
    expect(screen.getByText('Weekly Performance Briefing')).toBeInTheDocument();
    
    // Check that Employee Performance is NOT the active title
    expect(screen.queryByText('Detailed Employee Performance Metrics')).not.toBeInTheDocument();

    // Click on Employee Performance tab
    const empTab = screen.getByRole('button', { name: 'Employee Performance' });
    fireEvent.click(empTab);

    // Now it should show the Employee Performance section
    expect(screen.getByText('Detailed Employee Performance Metrics')).toBeInTheDocument();
    expect(screen.getByText('Employee Performance Performance Briefing')).toBeInTheDocument();
  });
});
