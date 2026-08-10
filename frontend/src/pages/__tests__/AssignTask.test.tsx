import { render, screen, waitFor } from "../../test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AssignTask from "../AssignTask";
import { MemoryRouter } from "react-router-dom";
import api from "../../services/axios";

vi.mock("../../services/axios", () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe("AssignTask Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("recommend card shows correct AI suggested assignee data", async () => {
    const mockMembers = [
      {
        id: "U-001",
        name: "Padma Priya",
        role: "Frontend Developer",
        department: "Engineering",
        avatar: "",
        skills: ["React"],
        workload: 80,
        availability: "Busy",
        tasksAssigned: 3,
      },
      {
        id: "U-004",
        name: "Darshan Patel",
        role: "UI/UX Designer",
        department: "Design",
        avatar: "",
        skills: ["Figma", "CSS"],
        workload: 45,
        availability: "Available",
        tasksAssigned: 2,
      },
    ];

    (api.get as any).mockImplementation((url: string) => {
      if (url === "/users") {
        return Promise.resolve({
          data: mockMembers,
        });
      }

      if (url === "/tasks") {
        return Promise.resolve({
          data: [],
        });
      }

      return Promise.reject(new Error("Unknown URL"));
    });

    render(
      <MemoryRouter>
        <AssignTask />
      </MemoryRouter>
    );

    // Wait until API data has loaded and AI recommendation appears.
    await waitFor(() => {
      expect(
        screen.getByText("AI Suggested Assignee")
      ).toBeInTheDocument();
    });

    // Darshan appears in both the member list and AI card,
    // so use getAllByText instead of getByText.
    expect(
      screen.getAllByText("Darshan Patel").length
    ).toBeGreaterThan(0);

    // Verify recommendation details.
    expect(
      screen.getAllByText("UI/UX Designer").length
    ).toBeGreaterThan(0);

    expect(
      screen.getByText(/Workload: 45%/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Skills match: Figma, CSS/i)
    ).toBeInTheDocument();
  });
});