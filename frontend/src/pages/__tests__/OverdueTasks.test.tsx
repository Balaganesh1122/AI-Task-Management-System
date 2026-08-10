import { render, screen, waitFor } from "../../test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import OverdueTasks from "../OverdueTasks";
import { MemoryRouter } from "react-router-dom";
import api from "../../services/axios";

vi.mock("../../services/axios", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe("OverdueTasks Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Date only.
    // Keep setTimeout/setInterval real so React Testing Library's
    // waitFor() can work normally.
    vi.useFakeTimers({
      toFake: ["Date"],
    });

    vi.setSystemTime(new Date("2026-10-31T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("risk cards are colour coded correctly based on days overdue", async () => {
    const mockOverdueTasks = [
      {
        id: "T-1",
        title: "Task 1",
        description: "Task 1 description",
        dueDate: "2026-10-30",
        status: "Overdue",
        priority: "High",
        assignee: "Alice",
        assigneeAvatar: "",
      },
      {
        id: "T-2",
        title: "Task 2",
        description: "Task 2 description",
        dueDate: "2026-10-23",
        status: "Overdue",
        priority: "High",
        assignee: "Bob",
        assigneeAvatar: "",
      },
      {
        id: "T-3",
        title: "Task 3",
        description: "Task 3 description",
        dueDate: "2026-10-15",
        status: "Overdue",
        priority: "High",
        assignee: "Charlie",
        assigneeAvatar: "",
      },
    ];

    (api.get as any).mockResolvedValueOnce({
      data: mockOverdueTasks,
    });

    render(
      <MemoryRouter>
        <OverdueTasks />
      </MemoryRouter>
    );

    // Wait for React Query/API data to render.
    await waitFor(() => {
      expect(screen.getByText("Task 1")).toBeInTheDocument();
    });

    // Confirm all three tasks rendered.
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();

    // --------------------------------------------------
    // LOW RISK
    // Task 1 = 1 day overdue
    // --------------------------------------------------

    const lowRiskBadge = screen.getByText("Low Risk");

    expect(lowRiskBadge).toBeInTheDocument();
    expect(lowRiskBadge).toHaveClass("bg-amber-100");
    expect(lowRiskBadge).toHaveClass("text-amber-700");

    // --------------------------------------------------
    // MEDIUM RISK
    // Task 2 = 8 days overdue
    // --------------------------------------------------

    const mediumRiskBadge = screen.getByText("Medium Risk");

    expect(mediumRiskBadge).toBeInTheDocument();
    expect(mediumRiskBadge).toHaveClass("bg-orange-100");
    expect(mediumRiskBadge).toHaveClass("text-orange-700");

    // --------------------------------------------------
    // HIGH RISK
    // Task 3 = 16 days overdue
    // --------------------------------------------------

    const highRiskBadge = screen.getByText("High Risk");

    expect(highRiskBadge).toBeInTheDocument();
    expect(highRiskBadge).toHaveClass("bg-red-100");
    expect(highRiskBadge).toHaveClass("text-red-700");
  });
});