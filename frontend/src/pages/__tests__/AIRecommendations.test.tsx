import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AIRecommendations from '../AIRecommendations';
import { MemoryRouter } from 'react-router-dom';

describe('AIRecommendations Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Accept and Dismiss buttons work correctly to remove cards', () => {
    render(
      <MemoryRouter>
        <AIRecommendations />
      </MemoryRouter>
    );

    // Initial state: cards are visible
    expect(screen.getByText('Recommended Assignee')).toBeInTheDocument();
    expect(screen.getByText('Delay Prediction')).toBeInTheDocument();

    const dismissBtns = screen.getAllByRole('button', { name: /Dismiss/i });
    const acceptBtns = screen.getAllByRole('button', { name: /Accept Suggestion/i });
    
    expect(dismissBtns.length).toBeGreaterThan(0);
    expect(acceptBtns.length).toBeGreaterThan(0);

    // Click Dismiss on the first card
    fireEvent.click(dismissBtns[0]);

    // Recommended Assignee is the first card, should be removed
    expect(screen.queryByText('Recommended Assignee')).not.toBeInTheDocument();

    // Click Accept on the new first card (Delay Prediction is now maybe index 1 depending on which one was first, but Smart Priority is actually 2nd)
    // Just find a specific card's button by traversing from the card text
    const delayPredictionHeading = screen.getByText('Delay Prediction');
    const delayCard = delayPredictionHeading.closest('div.bg-white.rounded-2xl');
    const delayAcceptBtn = delayCard?.querySelector('button:last-child') as Element; // The Accept button

    fireEvent.click(delayAcceptBtn);

    // Delay Prediction should be removed
    expect(screen.queryByText('Delay Prediction')).not.toBeInTheDocument();
  });
});
