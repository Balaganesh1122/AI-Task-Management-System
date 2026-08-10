import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AssignTask from '../AssignTask';
import { MemoryRouter } from 'react-router-dom';
import api from '../../services/axios';

vi.mock('../../services/axios', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  }
}));

describe('AssignTask Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('recommend card shows correct AI suggested assignee data', async () => {
    const mockMembers = [
      { id: "U-001", name: "Padma Priya", role: "Frontend Developer", department: "Engineering", avatar: "", skills: ["React"], workload: 80, availability: "Busy", tasksAssigned: 3 },
      { id: "U-004", name: "Darshan Patel", role: "UI/UX Designer", department: "Design", avatar: "", skills: ["Figma", "CSS"], workload: 45, availability: "Available", tasksAssigned: 2 },
    ];
    
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/users') return Promise.resolve({ data: mockMembers });
      if (url === '/tasks') return Promise.resolve({ data: [] });
      return Promise.reject();
    });

    render(
      <MemoryRouter>
        <AssignTask />
      </MemoryRouter>
    );

    // Wait for the AI Suggestion card to appear
    await waitFor(() => {
      expect(screen.getByText('AI Suggested Assignee')).toBeInTheDocument();
    });

    // Verify it suggests Darshan Patel due to availability and low workload
    expect(screen.getByText('Darshan Patel')).toBeInTheDocument();
    expect(screen.getByText('UI/UX Designer')).toBeInTheDocument();
    expect(screen.getByText(/Workload: 45%/i)).toBeInTheDocument();
    expect(screen.getByText(/Skills match: Figma, CSS/i)).toBeInTheDocument();
  });
});
