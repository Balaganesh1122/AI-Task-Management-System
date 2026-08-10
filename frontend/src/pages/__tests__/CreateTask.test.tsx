import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateTask from '../CreateTask';
import { MemoryRouter } from 'react-router-dom';
import api from '../../services/axios';

vi.mock('../../services/axios', () => ({
  default: {
    post: vi.fn(),
  }
}));

describe('CreateTask Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('AI button triggers correctly and displays mocked extracted tasks', async () => {
    const mockExtracted = [
      { id: 'ai-1', title: 'Task 1', description: 'Desc 1', priority: 'High', status: 'Pending', estimatedHours: 4 }
    ];
    (api.post as any).mockResolvedValueOnce({ data: mockExtracted });

    render(
      <MemoryRouter>
        <CreateTask />
      </MemoryRouter>
    );

    const textarea = screen.getByPlaceholderText(/Paste your text here/i);
    fireEvent.change(textarea, { target: { value: 'Please create a task to fix the header.' } });

    const generateBtn = screen.getByRole('button', { name: /Extract Tasks with AI/i });
    expect(generateBtn).not.toBeDisabled();
    
    fireEvent.click(generateBtn);

    expect(api.post).toHaveBeenCalledWith('/tasks/create-from-text', { text: 'Please create a task to fix the header.' });
    
    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Desc 1')).toBeInTheDocument();
    });
  });
});
