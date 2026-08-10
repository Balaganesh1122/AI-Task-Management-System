import { render, screen, fireEvent, waitFor } from "../../test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AIRecommendations from "../AIRecommendations";
import { MemoryRouter } from "react-router-dom";
import api from "../../services/axios";

vi.mock("../../services/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("AIRecommendations Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (api.get as any).mockImplementation((url: string) => {
      // Users API
      if (url === "/users") {
        return Promise.resolve({
          data: [
            {
              id: "U-001",
              name: "Darshan Patel",
              role: "UI/UX Designer",
              department: "Design",
              avatar: "",
              skills: ["Figma", "CSS"],
              workload: 45,
              availability: "Available",
              tasksAssigned: 2,
            },
          ],
        });
      }

      // Tasks API
      if (url === "/tasks") {
        return Promise.resolve({
          data: [
            {
              id: "T-001",
              title: "Fix login bug",
              description: "Fix authentication issue",
              assignee: "Darshan Patel",
              status: "In Progress",
              priority: "High",
              progress: 30,
              dueDate: "2026-10-10",
              createdDate: "2026-10-01",
              tags: [],
            },
          ],
        });
      }

      return Promise.resolve({
        data: [],
      });
    });
  });

  it("Accept and Dismiss buttons work correctly to remove cards", async () => {
    render(
      <MemoryRouter>
        <AIRecommendations />
      </MemoryRouter>
    );

    // =====================================================
    // WAIT FOR API DATA
    // =====================================================

    await waitFor(() => {
      expect(
        screen.getByText("Recommended Assignee")
      ).toBeInTheDocument();

      expect(
        screen.getByText("Delay Prediction")
      ).toBeInTheDocument();
    });

    // =====================================================
    // VERIFY BOTH CARDS EXIST
    // =====================================================

    expect(
      screen.getByText("Recommended Assignee")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Delay Prediction")
    ).toBeInTheDocument();

    // =====================================================
    // FIND BUTTONS
    // =====================================================

    const dismissBtns = screen.getAllByRole("button", {
      name: /Dismiss/i,
    });

    const acceptBtns = screen.getAllByRole("button", {
      name: /Accept Suggestion/i,
    });

    expect(dismissBtns.length).toBeGreaterThan(0);
    expect(acceptBtns.length).toBeGreaterThan(0);

    // =====================================================
    // DISMISS RECOMMENDED ASSIGNEE
    // =====================================================

    const assigneeHeading =
      screen.getByText("Recommended Assignee");

    const assigneeCard =
      assigneeHeading.closest("div.bg-white");

    expect(assigneeCard).not.toBeNull();

    const assigneeDismissButton =
      assigneeCard!.querySelector(
        "button:first-of-type"
      ) as HTMLButtonElement;

    fireEvent.click(assigneeDismissButton);

    // Card should disappear
    await waitFor(() => {
      expect(
        screen.queryByText("Recommended Assignee")
      ).not.toBeInTheDocument();
    });

    // Delay Prediction should still exist
    expect(
      screen.getByText("Delay Prediction")
    ).toBeInTheDocument();

    // =====================================================
    // ACCEPT DELAY PREDICTION
    // =====================================================

    const delayHeading =
      screen.getByText("Delay Prediction");

    const delayCard =
      delayHeading.closest("div.bg-white");

    expect(delayCard).not.toBeNull();

    const delayAcceptButton =
      delayCard!.querySelector(
        "button:last-of-type"
      ) as HTMLButtonElement;

    fireEvent.click(delayAcceptButton);

    // Card should disappear
    await waitFor(() => {
      expect(
        screen.queryByText("Delay Prediction")
      ).not.toBeInTheDocument();
    });
  });
});