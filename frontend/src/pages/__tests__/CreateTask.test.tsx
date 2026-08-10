import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "../../test-utils";

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from "vitest";

import CreateTask from "../CreateTask";
import { MemoryRouter } from "react-router-dom";
import api from "../../services/axios";

vi.mock("../../services/axios", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("CreateTask Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AI button triggers correctly and displays mocked extracted tasks", async () => {
    const mockExtracted = [
      {
        id: "ai-1",
        title: "Task 1",
        description: "Desc 1",
        priority: "High",
        status: "Pending",
        estimatedHours: 4,
      },
    ];

    (api.post as any).mockResolvedValueOnce({
      data: mockExtracted,
    });

    render(
      <MemoryRouter>
        <CreateTask />
      </MemoryRouter>
    );

    // Find AI textarea
    const textarea = screen.getByPlaceholderText(
      /Paste your text here/i
    );

    // Enter project/task description
    fireEvent.change(textarea, {
      target: {
        value: "Please create a task to fix the header.",
      },
    });

    // Find AI generation button
    const generateBtn = screen.getByRole("button", {
      name: /Extract Tasks with AI/i,
    });

    // Button should now be enabled
    expect(generateBtn).not.toBeDisabled();

    // Click AI button
    fireEvent.click(generateBtn);

    // Wait for the mutation/API call
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/tasks/create-from-text",
        {
          text: "Please create a task to fix the header.",
        }
      );
    });

    // Wait for extracted task to appear
    await waitFor(() => {
      expect(
        screen.getByText("Task 1")
      ).toBeInTheDocument();

      expect(
        screen.getByText("Desc 1")
      ).toBeInTheDocument();
    });
  });
});